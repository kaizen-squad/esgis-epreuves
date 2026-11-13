"use server";

import { createHash } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { deleteExamFile, putExamFile } from "@/lib/r2/upload";
import {
  actionDuplicateWarning,
  actionError,
  actionOk,
  actionOkWithWarning,
  type ActionResult,
} from "@/lib/action-result";
import { checkExamDuplicate } from "./duplicate";
import {
  examFileReplaceSchema,
  examMetadataSchema,
  examUploadSchema,
  MAX_BATCH_FILES,
  slugify,
} from "./schemas";

const PDF_MAGIC_BYTES = "%PDF-";
const EXAM_ID_SCHEMA = z.uuid();

/**
 * Depot d'une epreuve par le BDE (#18). Validation (type MIME declare, taille, referentiels)
 * par `examUploadSchema`, puis verification des octets de signature du PDF (le type MIME
 * declare par le navigateur n'est qu'une indication, jamais fiable seule) et hash du fichier
 * pour detecter un doublon exact.
 *
 * Ordre volontaire : insertion en base avant l'envoi a R2. L'insertion est la seule etape
 * protegee par la RLS (`exams_write_bde`) ; la faire passer avant l'envoi evite qu'une
 * session authentifiee mais non-BDE (ex. un compte ADMIN) ne declenche un depot R2 qui serait
 * de toute facon rejete ensuite par la base. Aucune verification de role dupliquee ici : la
 * RLS reste le seul vrai verrou, comme pour le reste des ecritures (#15), mais verifiee avant
 * tout effet de bord couteux. Si l'envoi a R2 echoue, la ligne inseree est retiree (l'exam ne
 * doit jamais exister en base sans le fichier correspondant sur R2).
 *
 * Detection de doublon (#19) via la fonction partagee `checkExamDuplicate`, reutilisee par
 * #55/#21/#56. Le hash exact (memes octets deja deposes) bloque : aucune insertion. Le quadruplet
 * matiere/annee/session/type n'est qu'un avertissement non bloquant (le meme quadruplet peut
 * legitimement se repeter, ex. plusieurs controles continus de la meme matiere dans la meme
 * annee) : l'insertion et l'envoi a R2 se poursuivent normalement, et l'avertissement est
 * simplement rapporte dans le resultat de succes.
 */
export async function uploadExam(
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = examUploadSchema.safeParse({
    title: formData.get("title"),
    academicYear: formData.get("academicYear"),
    session: formData.get("session"),
    examType: formData.get("examType"),
    fieldId: formData.get("fieldId"),
    levelId: formData.get("levelId"),
    subjectId: formData.get("subjectId"),
    optionId: formData.get("optionId") || undefined,
    file: formData.get("file"),
  });
  if (!parsed.success) {
    return actionError(
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { file, ...exam } = parsed.data;

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== PDF_MAGIC_BYTES) {
    return actionError("Le fichier n'est pas un PDF valide.");
  }
  const fileHash = createHash("sha256").update(buffer).digest("hex");

  const supabase = await createClient();

  let duplicate;
  try {
    duplicate = await checkExamDuplicate(fileHash, {
      subjectId: exam.subjectId,
      academicYear: exam.academicYear,
      session: exam.session,
      examType: exam.examType,
    });
  } catch (error) {
    console.error("uploadExam: verification de doublon", error);
    return actionError("Impossible d'enregistrer l'epreuve.");
  }
  if (duplicate.kind === "hash") {
    return actionDuplicateWarning("Ce fichier a deja ete depose.", {
      examId: duplicate.exam.id,
      slug: duplicate.exam.slug,
      title: duplicate.exam.title,
    });
  }

  const slug = slugify(exam.title);
  const r2Key = `exams/${fileHash}.pdf`;

  const { data: inserted, error: insertError } = await supabase
    .from("exams")
    .insert({
      title: exam.title,
      slug,
      academic_year: exam.academicYear,
      session: exam.session,
      exam_type: exam.examType,
      field_id: exam.fieldId,
      level_id: exam.levelId,
      subject_id: exam.subjectId,
      option_id: exam.optionId ?? null,
      file_hash: fileHash,
      file_mime_type: file.type,
      file_size: file.size,
      r2_key: r2Key,
    })
    .select("id")
    .single();
  if (insertError) {
    // Course entre deux depots du meme fichier : rare, le controle prealable ne l'elimine pas.
    if (insertError.code === "23505") {
      return actionError("Ce fichier a deja ete depose.");
    }
    console.error("uploadExam: insertion de l'epreuve", insertError);
    return actionError("Impossible d'enregistrer l'epreuve.");
  }

  try {
    await putExamFile(r2Key, buffer);
  } catch (error) {
    console.error("uploadExam: envoi du fichier vers R2", error);
    await supabase.from("exams").delete().eq("id", inserted.id);
    return actionError("Impossible de deposer le fichier.");
  }

  if (duplicate.kind === "quadruplet") {
    return actionOkWithWarning(
      { slug },
      {
        examId: duplicate.exam.id,
        slug: duplicate.exam.slug,
        title: duplicate.exam.title,
      },
    );
  }

  return actionOk({ slug });
}

/**
 * Modification des metadonnees d'une epreuve par le BDE (#55), fichier inchange. Le slug n'est
 * jamais recalcule sur un changement de titre : il reste stable pour ne pas casser un lien deja
 * partage (route de telechargement, #50).
 *
 * Detection de doublon (#19) reutilisee avec le hash de fichier *actuel* de l'epreuve (inchange
 * par cette action) et `excludeExamId` pour que l'epreuve editee ne se signale jamais elle-meme.
 */
export async function updateExamMetadata(
  examId: string,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  if (!EXAM_ID_SCHEMA.safeParse(examId).success) {
    return actionError("Epreuve introuvable.");
  }

  const parsed = examMetadataSchema.safeParse({
    title: formData.get("title"),
    academicYear: formData.get("academicYear"),
    session: formData.get("session"),
    examType: formData.get("examType"),
    fieldId: formData.get("fieldId"),
    levelId: formData.get("levelId"),
    subjectId: formData.get("subjectId"),
    optionId: formData.get("optionId") || undefined,
  });
  if (!parsed.success) {
    return actionError(
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const exam = parsed.data;

  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("exams")
    .select("file_hash, slug")
    .eq("id", examId)
    .maybeSingle();
  if (fetchError) {
    console.error("updateExamMetadata: lecture de l'epreuve", fetchError);
    return actionError("Impossible de modifier l'epreuve.");
  }
  if (!current) {
    return actionError("Epreuve introuvable.");
  }

  let duplicate;
  try {
    duplicate = await checkExamDuplicate(
      current.file_hash,
      {
        subjectId: exam.subjectId,
        academicYear: exam.academicYear,
        session: exam.session,
        examType: exam.examType,
      },
      examId,
    );
  } catch (error) {
    console.error("updateExamMetadata: verification de doublon", error);
    return actionError("Impossible de modifier l'epreuve.");
  }
  if (duplicate.kind === "hash") {
    return actionDuplicateWarning("Ce fichier a deja ete depose.", {
      examId: duplicate.exam.id,
      slug: duplicate.exam.slug,
      title: duplicate.exam.title,
    });
  }

  const { data: updated, error: updateError } = await supabase
    .from("exams")
    .update({
      title: exam.title,
      academic_year: exam.academicYear,
      session: exam.session,
      exam_type: exam.examType,
      field_id: exam.fieldId,
      level_id: exam.levelId,
      subject_id: exam.subjectId,
      option_id: exam.optionId ?? null,
    })
    .eq("id", examId)
    .select("id");
  if (updateError) {
    console.error("updateExamMetadata: mise a jour", updateError);
    return actionError("Impossible de modifier l'epreuve.");
  }
  // La RLS (exams_write_bde) ne filtre un UPDATE que par USING, sans jamais lever d'erreur sur un
  // role non autorise (contrairement a l'INSERT de uploadExam, protege par WITH CHECK) : aucune
  // ligne affectee veut donc dire refus silencieux, jamais une anomalie a signaler autrement.
  if (!updated || updated.length === 0) {
    return actionError("Epreuve introuvable.");
  }

  if (duplicate.kind === "quadruplet") {
    return actionOkWithWarning(
      { slug: current.slug },
      {
        examId: duplicate.exam.id,
        slug: duplicate.exam.slug,
        title: duplicate.exam.title,
      },
    );
  }

  return actionOk({ slug: current.slug });
}

/**
 * Remplacement du fichier d'une epreuve par le BDE (#55), metadonnees inchangees. Reutilise le
 * quadruplet deja enregistre de l'epreuve (matiere/annee/session/type n'est pas resaisi) pour la
 * detection de doublon (#19), en excluant l'epreuve elle-meme.
 *
 * Ordre volontaire, miroir de `uploadExam` : la mise a jour en base (seule etape protegee par la
 * RLS) precede l'envoi a R2. Si l'envoi echoue, les colonnes de fichier sont remises a leurs
 * anciennes valeurs (jamais d'epreuve pointant vers un fichier jamais depose). L'ancien fichier
 * R2 n'est supprime qu'une fois le nouveau depose avec succes, en best effort : un echec de cette
 * suppression ne fait pas echouer le remplacement (le fichier courant est deja correct, seul un
 * objet R2 orphelin resterait, sans consequence fonctionnelle).
 */
export async function replaceExamFile(
  examId: string,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  if (!EXAM_ID_SCHEMA.safeParse(examId).success) {
    return actionError("Epreuve introuvable.");
  }

  const parsed = examFileReplaceSchema.safeParse({
    file: formData.get("file"),
  });
  if (!parsed.success) {
    return actionError(
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { file } = parsed.data;

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.subarray(0, 5).toString("latin1") !== PDF_MAGIC_BYTES) {
    return actionError("Le fichier n'est pas un PDF valide.");
  }
  const fileHash = createHash("sha256").update(buffer).digest("hex");

  const supabase = await createClient();

  const { data: current, error: fetchError } = await supabase
    .from("exams")
    .select(
      "slug, subject_id, academic_year, session, exam_type, r2_key, file_hash, file_mime_type, file_size",
    )
    .eq("id", examId)
    .maybeSingle();
  if (fetchError) {
    console.error("replaceExamFile: lecture de l'epreuve", fetchError);
    return actionError("Impossible de remplacer le fichier.");
  }
  if (!current) {
    return actionError("Epreuve introuvable.");
  }

  let duplicate;
  try {
    duplicate = await checkExamDuplicate(
      fileHash,
      {
        subjectId: current.subject_id,
        academicYear: current.academic_year,
        session: current.session,
        examType: current.exam_type,
      },
      examId,
    );
  } catch (error) {
    console.error("replaceExamFile: verification de doublon", error);
    return actionError("Impossible de remplacer le fichier.");
  }
  if (duplicate.kind === "hash") {
    return actionDuplicateWarning("Ce fichier a deja ete depose.", {
      examId: duplicate.exam.id,
      slug: duplicate.exam.slug,
      title: duplicate.exam.title,
    });
  }

  const newR2Key = `exams/${fileHash}.pdf`;

  const { data: updated, error: updateError } = await supabase
    .from("exams")
    .update({
      file_hash: fileHash,
      file_mime_type: file.type,
      file_size: file.size,
      r2_key: newR2Key,
    })
    .eq("id", examId)
    .select("id");
  if (updateError) {
    // Course entre deux remplacements du meme fichier : rare, le controle prealable ne l'elimine pas.
    if (updateError.code === "23505") {
      return actionError("Ce fichier a deja ete depose.");
    }
    console.error("replaceExamFile: mise a jour", updateError);
    return actionError("Impossible de remplacer le fichier.");
  }
  // Voir updateExamMetadata : un UPDATE bloque par la RLS n'est jamais une erreur Supabase,
  // seulement 0 ligne affectee. Verifie avant tout effet de bord sur R2.
  if (!updated || updated.length === 0) {
    return actionError("Epreuve introuvable.");
  }

  try {
    await putExamFile(newR2Key, buffer);
  } catch (error) {
    console.error("replaceExamFile: envoi du fichier vers R2", error);
    await supabase
      .from("exams")
      .update({
        file_hash: current.file_hash,
        file_mime_type: current.file_mime_type,
        file_size: current.file_size,
        r2_key: current.r2_key,
      })
      .eq("id", examId);
    return actionError("Impossible de deposer le fichier.");
  }

  // Un remplacement par un contenu identique garde la meme cle (`exams/<hash>.pdf`) : l'ancien
  // fichier et le nouveau sont alors le meme objet R2, jamais a supprimer sous peine d'effacer
  // le fichier qu'on vient de deposer.
  if (current.r2_key !== newR2Key) {
    try {
      await deleteExamFile(current.r2_key);
    } catch (error) {
      console.error(
        "replaceExamFile: suppression de l'ancien fichier R2",
        error,
      );
    }
  }

  if (duplicate.kind === "quadruplet") {
    return actionOkWithWarning(
      { slug: current.slug },
      {
        examId: duplicate.exam.id,
        slug: duplicate.exam.slug,
        title: duplicate.exam.title,
      },
    );
  }

  return actionOk({ slug: current.slug });
}

/**
 * Suppression definitive d'une epreuve par le BDE (#55) : pas de corbeille, pas d'historique de
 * versions. Supprime la ligne en base puis le fichier R2 correspondant, en best effort : un echec
 * de cette seconde suppression ne fait pas echouer l'action (l'epreuve n'est deja plus listee ni
 * accessible, seul un objet R2 orphelin resterait).
 *
 * Lecture de `r2_key` combinee au `DELETE` lui-meme (`.delete().select("r2_key").maybeSingle()`),
 * jamais une lecture separee suivie d'un `DELETE` : un `DELETE` bloque par la RLS (exams_write_bde)
 * n'est jamais une erreur Supabase, seulement une ligne non affectee (contrairement a l'INSERT de
 * uploadExam, protege par WITH CHECK) ; une lecture separee ne le detecterait pas et laisserait
 * supprimer le fichier R2 d'une epreuve que la base a refuse de supprimer. Combiner les deux evite
 * aussi une course avec un remplacement concurrent (#55) qui changerait `r2_key` entre les deux.
 */
export async function deleteExam(examId: string): Promise<ActionResult<null>> {
  if (!EXAM_ID_SCHEMA.safeParse(examId).success) {
    return actionError("Epreuve introuvable.");
  }

  const supabase = await createClient();

  const { data: deleted, error: deleteError } = await supabase
    .from("exams")
    .delete()
    .eq("id", examId)
    .select("r2_key")
    .maybeSingle();
  if (deleteError) {
    console.error("deleteExam: suppression", deleteError);
    return actionError("Impossible de supprimer l'epreuve.");
  }
  if (!deleted) {
    return actionError("Epreuve introuvable.");
  }

  try {
    await deleteExamFile(deleted.r2_key);
  } catch (error) {
    console.error("deleteExam: suppression du fichier R2", error);
  }

  return actionOk(null);
}

const BATCH_FIELD_NAMES = [
  "title",
  "academicYear",
  "session",
  "examType",
  "fieldId",
  "levelId",
  "subjectId",
  "optionId",
] as const;

export type ExamBatchEntryResult =
  | {
      file: string;
      status: "imported";
      slug: string;
      warning?: { examId: string; slug: string; title: string };
    }
  | {
      file: string;
      status: "duplicate";
      message: string;
      existing?: { examId: string; slug: string; title: string };
    }
  | {
      file: string;
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export type ExamBatchSummary = {
  total: number;
  imported: number;
  warnings: number;
  duplicates: number;
  errors: number;
};

export type ExamBatchReport = {
  entries: ExamBatchEntryResult[];
  summary: ExamBatchSummary;
};

function summarizeBatch(entries: ExamBatchEntryResult[]): ExamBatchSummary {
  return {
    total: entries.length,
    imported: entries.filter((e) => e.status === "imported").length,
    warnings: entries.filter(
      (e) => e.status === "imported" && e.warning !== undefined,
    ).length,
    duplicates: entries.filter((e) => e.status === "duplicate").length,
    errors: entries.filter((e) => e.status === "error").length,
  };
}

/**
 * Ajout en lot depuis l'espace BDE (#56) : plusieurs fichiers d'un coup, chacun avec ses propres
 * metadonnees completes (meme contrat que `uploadExam`, #18 ; jamais de metadonnees partagees pour
 * tout le lot, decision prise en brainstorming). Boucle cote serveur, jamais de patron observateur
 * ni de file d'attente (exclu explicitement par le ticket), un resultat par fichier.
 *
 * `FormData` attendu : un champ repete `files` (un par fichier, dans l'ordre de depot) et un champ
 * repete par metadonnee (`title`, `academicYear`, `session`, `examType`, `fieldId`, `levelId`,
 * `subjectId`, `optionId`), chacun avec exactement autant de valeurs que `files`, dans le meme
 * ordre (le fichier et sa metadonnee partagent le meme index). `optionId` attend une chaine vide
 * (jamais une valeur absente) pour un fichier sans option, afin que l'alignement par index reste
 * valable pour tous les fichiers du lot. Limite a `MAX_BATCH_FILES` fichiers (voir sa definition
 * dans `schemas.ts`, liee au corps maximal d'une requete sur la plateforme d'hebergement).
 *
 * Reutilise `checkExamDuplicate` (#19) telle quelle, fichier par fichier : meme logique
 * bloquante (hash) / avertissement non bloquant (quadruplet) que `uploadExam`, avec la meme forme
 * structuree (`existing`/`warning` : `{ examId, slug, title }`), jamais un simple message a
 * analyser cote ecran. Deduplique aussi entre deux fichiers du MEME lot (une `Map` en memoire pour
 * le hash, indexee par la position du fichier dans le lot plutot que son nom : deux fichiers du
 * lot peuvent porter le meme nom) : sans ca, deux fichiers identiques soumis ensemble ne se
 * detecteraient jamais l'un l'autre, `checkExamDuplicate` n'interrogeant que ce qui est deja en
 * base. Un avertissement de quadruplet entre deux fichiers du meme lot n'est construit qu'une fois
 * le premier reellement insere (`insertedByQuadruplet`) : un fichier du lot qui a echoue n'a pas
 * d'epreuve existante vers laquelle pointer.
 *
 * Donnees invalides par fichier renvoient `fieldErrors` (meme convention que `uploadExam`). Une
 * collision d'unicite a l'insertion (course entre deux depots du meme fichier) distingue la
 * collision sur le hash (classee `"duplicate"`) de celle, bien plus rare, sur le slug (classee
 * `"error"`), meme principe que `runSeed` (#21).
 *
 * Une ligne en erreur ou en doublon n'interrompt jamais les fichiers suivants : chacun est
 * independant, le rapport final les distingue tous. L'action renvoie toujours
 * `{ ok: true, data: { entries, summary } }` tant que la
 * requete globale est valide (au moins un fichier, au plus `MAX_BATCH_FILES`, tableaux alignes) :
 * un lot entierement en erreur n'est pas un echec de l'action, c'est un rapport dont chaque entree
 * vaut `"error"`.
 */
export async function uploadExamsBatch(
  formData: FormData,
): Promise<ActionResult<ExamBatchReport>> {
  const rawFiles = formData.getAll("files");
  if (rawFiles.length === 0) {
    return actionError("Aucun fichier fourni.");
  }
  if (rawFiles.length > MAX_BATCH_FILES) {
    return actionError(`Un lot est limite a ${MAX_BATCH_FILES} fichiers.`);
  }
  if (!rawFiles.every((value): value is File => value instanceof File)) {
    return actionError("Donnees invalides.");
  }
  const files = rawFiles;

  const fields = {} as Record<(typeof BATCH_FIELD_NAMES)[number], string[]>;
  for (const name of BATCH_FIELD_NAMES) {
    const values = formData.getAll(name);
    if (
      values.length !== files.length ||
      !values.every((value): value is string => typeof value === "string")
    ) {
      return actionError("Donnees invalides.", {
        [name]: [
          `Attendu ${files.length} valeur(s) pour "${name}" (autant que de fichiers), recu ${values.length}.`,
        ],
      });
    }
    fields[name] = values;
  }

  const supabase = await createClient();
  const entries: ExamBatchEntryResult[] = [];
  // Index (pas le nom du fichier, deux fichiers du lot peuvent porter le meme nom) du premier
  // fichier du lot vu avec ce hash/quadruplet. Marque avant meme l'insertion (comme `runSeed`,
  // #21) : deux fichiers identiques dans le meme lot doivent se detecter l'un l'autre meme si le
  // premier echoue ensuite a l'insertion ou au depot R2.
  const seenHashes = new Map<string, number>();
  // Epreuve reellement inseree pour un quadruplet donne, pour batir l'avertissement structure
  // d'un fichier suivant du meme lot qui partage ce quadruplet (jamais rempli avant l'insertion
  // reussie : un fichier du lot qui a echoue n'a pas d'epreuve existante vers laquelle pointer).
  const insertedByQuadruplet = new Map<
    string,
    { examId: string; slug: string; title: string }
  >();

  for (const [i, file] of files.entries()) {
    const label = file.name || `fichier ${i + 1}`;

    const parsed = examUploadSchema.safeParse({
      title: fields.title[i],
      academicYear: fields.academicYear[i],
      session: fields.session[i],
      examType: fields.examType[i],
      fieldId: fields.fieldId[i],
      levelId: fields.levelId[i],
      subjectId: fields.subjectId[i],
      optionId: fields.optionId[i] || undefined,
      file,
    });
    if (!parsed.success) {
      entries.push({
        file: label,
        status: "error",
        message: "Donnees invalides.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      });
      continue;
    }
    const exam = parsed.data;

    const buffer = Buffer.from(await exam.file.arrayBuffer());
    if (buffer.subarray(0, 5).toString("latin1") !== PDF_MAGIC_BYTES) {
      entries.push({
        file: label,
        status: "error",
        message: "Le fichier n'est pas un PDF valide.",
      });
      continue;
    }
    const fileHash = createHash("sha256").update(buffer).digest("hex");
    const quadrupletKey = `${exam.subjectId}:${exam.academicYear}:${exam.session}:${exam.examType}`;

    const seenHashIndex = seenHashes.get(fileHash);
    if (seenHashIndex !== undefined) {
      entries.push({
        file: label,
        status: "duplicate",
        message: `Fichier identique au fichier n°${seenHashIndex + 1} de ce lot (a redeposer seul si celui-ci a echoue).`,
      });
      continue;
    }

    let duplicate;
    try {
      duplicate = await checkExamDuplicate(fileHash, {
        subjectId: exam.subjectId,
        academicYear: exam.academicYear,
        session: exam.session,
        examType: exam.examType,
      });
    } catch (error) {
      console.error("uploadExamsBatch: verification de doublon", error);
      entries.push({
        file: label,
        status: "error",
        message: "Impossible de verifier les doublons.",
      });
      continue;
    }
    if (duplicate.kind === "hash") {
      entries.push({
        file: label,
        status: "duplicate",
        message: `Ce fichier a deja ete depose (epreuve "${duplicate.exam.slug}").`,
        existing: {
          examId: duplicate.exam.id,
          slug: duplicate.exam.slug,
          title: duplicate.exam.title,
        },
      });
      continue;
    }

    const warning =
      duplicate.kind === "quadruplet"
        ? {
            examId: duplicate.exam.id,
            slug: duplicate.exam.slug,
            title: duplicate.exam.title,
          }
        : insertedByQuadruplet.get(quadrupletKey);

    seenHashes.set(fileHash, i);

    const slug = slugify(exam.title);
    const r2Key = `exams/${fileHash}.pdf`;

    const { data: inserted, error: insertError } = await supabase
      .from("exams")
      .insert({
        title: exam.title,
        slug,
        academic_year: exam.academicYear,
        session: exam.session,
        exam_type: exam.examType,
        field_id: exam.fieldId,
        level_id: exam.levelId,
        subject_id: exam.subjectId,
        option_id: exam.optionId ?? null,
        file_hash: fileHash,
        file_mime_type: exam.file.type,
        file_size: exam.file.size,
        r2_key: r2Key,
      })
      .select("id")
      .single();
    if (insertError) {
      console.error("uploadExamsBatch: insertion de l'epreuve", insertError);
      // Course entre deux depots du meme fichier (rare, le controle prealable ne l'elimine pas) :
      // distingue la collision sur `file_hash` (vraiment un doublon) de celle, bien plus rare,
      // sur `slug` (meme principe que `runSeed`, #21), pour que `summary.duplicates` reste fiable.
      if (insertError.code === "23505") {
        const isHashCollision = insertError.message?.includes(
          "exams_file_hash_key",
        );
        entries.push(
          isHashCollision
            ? {
                file: label,
                status: "duplicate",
                message:
                  "Ce fichier a deja ete depose (course avec un autre depot).",
              }
            : {
                file: label,
                status: "error",
                message:
                  "Collision de slug a l'insertion (tres rare), reessayer ce fichier.",
              },
        );
        continue;
      }
      entries.push({
        file: label,
        status: "error",
        message: "Impossible d'enregistrer l'epreuve.",
      });
      continue;
    }

    try {
      await putExamFile(r2Key, buffer);
    } catch (error) {
      console.error("uploadExamsBatch: envoi du fichier vers R2", error);
      await supabase.from("exams").delete().eq("id", inserted.id);
      entries.push({
        file: label,
        status: "error",
        message: "Impossible de deposer le fichier.",
      });
      continue;
    }

    insertedByQuadruplet.set(quadrupletKey, {
      examId: inserted.id,
      slug,
      title: exam.title,
    });
    entries.push({ file: label, status: "imported", slug, warning });
  }

  return actionOk({ entries, summary: summarizeBatch(entries) });
}
