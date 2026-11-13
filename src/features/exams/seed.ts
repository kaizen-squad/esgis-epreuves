import { createHash } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import { checkExamDuplicate } from "./duplicate";
import {
  EXAM_SESSIONS,
  EXAM_TYPES,
  MAX_FILE_SIZE_BYTES,
  examMetadataSchema,
  slugify,
} from "./schemas";
import type { ExamSession, ExamType } from "./types";

const PDF_MAGIC_BYTES = "%PDF-";

/**
 * Parse minimal d'un CSV point-virgule avec guillemets (gabarit rempli a la main sous Excel,
 * `docs/gabarit-metadonnees.csv`) : BOM UTF-8 ignore, guillemets doubles pour echapper un ";" ou
 * un retour a la ligne dans un champ, `""` pour un guillemet litteral a l'interieur d'un champ.
 */
export function parseCsv(content: string): string[][] {
  const text = content.startsWith("﻿") ? content.slice(1) : content;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"' && field === "") {
      // Un guillemet n'ouvre le mode "champ encadre" qu'en tout debut de champ (RFC 4180) :
      // un guillemet au milieu d'un champ non encadre (ex. 12" pour des pouces) reste litteral,
      // sinon il avalerait tout le reste du fichier jusqu'au prochain guillemet.
      inQuotes = true;
    } else if (char === ";") {
      row.push(field);
      field = "";
    } else if (char === "\r") {
      // ignore, traite au retour a la ligne
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (inQuotes) {
    // Un guillemet ouvrant jamais referme avalerait sinon tout le reste du fichier comme un seul
    // champ (retours a la ligne compris), sans qu'aucune ligne suivante n'apparaisse au rapport.
    // Un CSV enregistre par Excel ne produit jamais ce cas (il referme toujours ses guillemets) :
    // seule une retouche manuelle peut le declencher.
    throw new Error("CSV invalide : guillemet ouvrant jamais referme.");
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Lignes de donnees du CSV, chacune mappee sur son en-tete (ordre des colonnes libre). Chaque
 * valeur est normalisee en NFC : un caractere accentue decompose par Excel (NFD) ferait sinon
 * echouer les contraintes `check` SQL sur `academic_year`/`session`/`exam_type`, qui comparent
 * des chaines octet a octet. Les lignes entierement vides (fin de fichier) sont ignorees.
 */
export function csvToRows(content: string): Record<string, string>[] {
  const [header, ...rows] = parseCsv(content);
  if (!header) return [];

  return rows
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => {
      const record: Record<string, string> = {};
      header.forEach((column, i) => {
        record[column.trim()] = (row[i] ?? "").normalize("NFC").trim();
      });
      return record;
    });
}

/**
 * `titre`/`annee_academique` reutilisent les memes bornes que `examMetadataSchema` (donc que
 * `examUploadSchema`), au lieu d'une seconde copie : un titre de plus de 200 caracteres importe
 * ici bloquerait ensuite toute modification par `updateExamMetadata`, qui revalide avec la meme
 * limite.
 */
export const seedRowSchema = z.object({
  fichier: z.string().min(1, "Chemin de fichier manquant."),
  titre: examMetadataSchema.shape.title,
  filiere: z.string().min(1, "Filiere manquante."),
  niveau: z.string().min(1, "Niveau manquant."),
  matiere: z.string().min(1, "Matiere manquante."),
  option: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
  annee_academique: examMetadataSchema.shape.academicYear,
  type_epreuve: z.enum(EXAM_TYPES),
  session: z.enum(EXAM_SESSIONS),
});

export type SeedCsvRow = z.output<typeof seedRowSchema>;

export type ReferentialRow = { id: string; name: string };
export type SubjectRow = {
  id: string;
  name: string;
  fieldId: string;
  levelId: string;
};
export type OptionRow = { id: string; name: string; fieldId: string };

export type ReferentialMaps = {
  fields: Map<string, string>;
  levels: Map<string, string>;
  subjects: Map<string, string>;
  options: Map<string, string>;
};

/**
 * Index en memoire des referentiels par nom, pour resoudre les colonnes textuelles du CSV sans
 * requete par ligne. Matiere et option ne sont uniques qu'au sein d'une filiere (et d'un niveau
 * pour la matiere, cf. contraintes `unique` de la migration initiale) : cles composites.
 */
export function buildReferentialMaps(data: {
  fields: ReferentialRow[];
  levels: ReferentialRow[];
  subjects: SubjectRow[];
  options: OptionRow[];
}): ReferentialMaps {
  return {
    fields: new Map(data.fields.map((f) => [f.name, f.id])),
    levels: new Map(data.levels.map((l) => [l.name, l.id])),
    subjects: new Map(
      data.subjects.map((s) => [`${s.fieldId}:${s.levelId}:${s.name}`, s.id]),
    ),
    options: new Map(data.options.map((o) => [`${o.fieldId}:${o.name}`, o.id])),
  };
}

export type ResolvedSeedRow = {
  fieldId: string;
  levelId: string;
  subjectId: string;
  optionId: string | null;
  title: string;
  academicYear: string;
  session: ExamSession;
  examType: ExamType;
  filePath: string;
};

export type ResolveSeedRowResult =
  { ok: true; row: ResolvedSeedRow } | { ok: false; error: string };

/** Resout les noms de referentiels d'une ligne validee vers leurs ids, sans toucher a la base. */
export function resolveSeedRow(
  row: SeedCsvRow,
  maps: ReferentialMaps,
): ResolveSeedRowResult {
  const fieldId = maps.fields.get(row.filiere);
  if (!fieldId)
    return { ok: false, error: `Filiere inconnue : "${row.filiere}".` };

  const levelId = maps.levels.get(row.niveau);
  if (!levelId)
    return { ok: false, error: `Niveau inconnu : "${row.niveau}".` };

  const subjectId = maps.subjects.get(`${fieldId}:${levelId}:${row.matiere}`);
  if (!subjectId) {
    return {
      ok: false,
      error: `Matiere inconnue pour cette filiere et ce niveau : "${row.matiere}".`,
    };
  }

  let optionId: string | null = null;
  if (row.option) {
    const found = maps.options.get(`${fieldId}:${row.option}`);
    if (!found) {
      return {
        ok: false,
        error: `Option inconnue pour cette filiere : "${row.option}".`,
      };
    }
    optionId = found;
  }

  return {
    ok: true,
    row: {
      fieldId,
      levelId,
      subjectId,
      optionId,
      title: row.titre,
      academicYear: row.annee_academique,
      session: row.session,
      examType: row.type_epreuve,
      filePath: row.fichier,
    },
  };
}

/**
 * Resout le chemin d'un fichier du CSV sous le dossier source, sans jamais en sortir : une
 * colonne `fichier` avec un `..` (erreur de saisie ou CSV corrompu) ne doit jamais faire lire un
 * fichier hors de l'echantillon fourni. Retourne `null` dans ce cas, jamais une exception.
 */
export function resolveFilePath(
  baseDir: string,
  relativePath: string,
): string | null {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, relativePath);
  return resolved === base || resolved.startsWith(base + path.sep)
    ? resolved
    : null;
}

export function isPdfBuffer(buffer: Buffer): boolean {
  return buffer.subarray(0, 5).toString("latin1") === PDF_MAGIC_BYTES;
}

export function hashBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export type SeedReportEntry =
  | {
      file: string;
      status: "imported" | "dry-run";
      slug: string;
      warning?: string;
    }
  | { file: string; status: "duplicate" | "error"; message: string };

export type SeedReportSummary = {
  total: number;
  imported: number;
  duplicates: number;
  warnings: number;
  errors: number;
};

export function summarizeReport(entries: SeedReportEntry[]): SeedReportSummary {
  return {
    total: entries.length,
    imported: entries.filter(
      (e) => e.status === "imported" || e.status === "dry-run",
    ).length,
    duplicates: entries.filter((e) => e.status === "duplicate").length,
    warnings: entries.filter(
      (e) =>
        (e.status === "imported" || e.status === "dry-run") &&
        e.warning !== undefined,
    ).length,
    errors: entries.filter((e) => e.status === "error").length,
  };
}

export type SeedReport = {
  entries: SeedReportEntry[];
  summary: SeedReportSummary;
};

/**
 * Client minimal attendu par `runSeed` : non type (pas de `database.types.ts` genere encore,
 * meme decision que le reste du backend), juste suffisant pour les requetes faites ici.
 */
export type SeedSupabaseClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
};

export type SeedDeps = {
  supabase: SeedSupabaseClient;
  readFile: (filePath: string) => Promise<Buffer>;
  putExamFile: (r2Key: string, body: Buffer) => Promise<void>;
};

/** PostgREST borne une reponse non paginee a `max_rows` (1000 par defaut, local comme heberge). */
const POSTGREST_MAX_ROWS = 1000;

async function fetchTable<T>(
  client: SeedSupabaseClient,
  table: string,
  columns: string,
): Promise<T[]> {
  const { data, error } = await client.from(table).select(columns);
  if (error) throw error;
  const rows = (data ?? []) as T[];
  // ponytail: pas de pagination tant que les referentiels restent sous ce seuil (table attendue
  // petite, meme decision que #9 pour `search_text`) ; a paginer avec `.range()` si un referentiel
  // approche vraiment ce volume.
  if (rows.length >= POSTGREST_MAX_ROWS) {
    throw new Error(
      `La table "${table}" renvoie ${rows.length} lignes : possible troncature par la limite PostgREST (max_rows).`,
    );
  }
  return rows;
}

/**
 * Script de seed en masse (#21) : lit le CSV de metadonnees, resout les referentiels, deduplique
 * via `checkExamDuplicate` (#19, hash bloquant / quadruplet en avertissement, meme decision que
 * #18/#55) puis insere et depose chaque fichier sur R2. `dryRun` saute l'insertion et le depot R2
 * (une ligne qui aurait ete importee est quand meme reportee, sous le statut `"dry-run"`), mais
 * execute tout le reste (CSV, referentiels, hash, detection de doublon) a l'identique : un
 * `--dry-run` reflete fidelement ce qu'un run reel ferait.
 *
 * Une ligne en erreur (referentiel inconnu, fichier manquant ou non-PDF, etc.) n'interrompt jamais
 * les lignes suivantes : chaque ligne est independante, le rapport final les distingue toutes.
 */
export async function runSeed(
  csvContent: string,
  options: { baseDir: string; dryRun: boolean },
  deps: SeedDeps,
): Promise<SeedReport> {
  const rawRows = csvToRows(csvContent);
  const entries: SeedReportEntry[] = [];
  // Doublons entre deux lignes du MEME CSV, jamais vus par `checkExamDuplicate` (qui n'interroge
  // que ce qui est deja en base) : sans ce suivi, un `--dry-run` rapporterait deux lignes
  // "importables" alors qu'un run reel rejetterait la seconde comme doublon de la premiere.
  const seenHashes = new Map<string, string>();
  const seenQuadruplets = new Map<string, string>();

  const [fields, levels, subjects, examOptions] = await Promise.all([
    fetchTable<ReferentialRow>(deps.supabase, "fields", "id, name"),
    fetchTable<ReferentialRow>(deps.supabase, "levels", "id, name"),
    fetchTable<{
      id: string;
      name: string;
      field_id: string;
      level_id: string;
    }>(deps.supabase, "subjects", "id, name, field_id, level_id"),
    fetchTable<{ id: string; name: string; field_id: string }>(
      deps.supabase,
      "options",
      "id, name, field_id",
    ),
  ]);
  const maps = buildReferentialMaps({
    fields,
    levels,
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      fieldId: s.field_id,
      levelId: s.level_id,
    })),
    options: examOptions.map((o) => ({
      id: o.id,
      name: o.name,
      fieldId: o.field_id,
    })),
  });

  for (const raw of rawRows) {
    const label = raw.fichier || "(fichier non renseigne)";

    const parsed = seedRowSchema.safeParse(raw);
    if (!parsed.success) {
      const [firstError] = z.flattenError(parsed.error).formErrors;
      const fieldErrors = Object.values(
        z.flattenError(parsed.error).fieldErrors,
      ).flat();
      entries.push({
        file: label,
        status: "error",
        message: firstError ?? fieldErrors[0] ?? "Ligne invalide.",
      });
      continue;
    }

    const resolved = resolveSeedRow(parsed.data, maps);
    if (!resolved.ok) {
      entries.push({
        file: parsed.data.fichier,
        status: "error",
        message: resolved.error,
      });
      continue;
    }
    const { row } = resolved;

    const filePath = resolveFilePath(options.baseDir, row.filePath);
    if (!filePath) {
      entries.push({
        file: row.filePath,
        status: "error",
        message: "Chemin de fichier invalide (hors du dossier source).",
      });
      continue;
    }

    let buffer: Buffer;
    try {
      buffer = await deps.readFile(filePath);
    } catch (error) {
      console.error(`runSeed: lecture de "${row.filePath}"`, error);
      const code = (error as NodeJS.ErrnoException).code;
      entries.push({
        file: row.filePath,
        status: "error",
        message:
          code === "ENOENT"
            ? "Fichier introuvable."
            : `Lecture du fichier impossible (${code ?? (error as Error).message}).`,
      });
      continue;
    }

    if (!isPdfBuffer(buffer)) {
      entries.push({
        file: row.filePath,
        status: "error",
        message: "Le fichier n'est pas un PDF valide.",
      });
      continue;
    }

    if (buffer.length > MAX_FILE_SIZE_BYTES) {
      entries.push({
        file: row.filePath,
        status: "error",
        message: `Le fichier depasse la limite de ${Math.floor(MAX_FILE_SIZE_BYTES / 1024)} Ko.`,
      });
      continue;
    }

    const fileHash = hashBuffer(buffer);
    const quadrupletKey = `${row.subjectId}:${row.academicYear}:${row.session}:${row.examType}`;

    const seenHashFile = seenHashes.get(fileHash);
    if (seenHashFile) {
      entries.push({
        file: row.filePath,
        status: "duplicate",
        message: `Fichier identique a une ligne precedente de ce CSV ("${seenHashFile}").`,
      });
      continue;
    }

    let duplicate;
    try {
      duplicate = await checkExamDuplicate(
        fileHash,
        {
          subjectId: row.subjectId,
          academicYear: row.academicYear,
          session: row.session,
          examType: row.examType,
        },
        undefined,
        deps.supabase,
      );
    } catch (error) {
      entries.push({
        file: row.filePath,
        status: "error",
        message: `Verification de doublon impossible : ${(error as Error).message ?? error}`,
      });
      continue;
    }

    if (duplicate.kind === "hash") {
      entries.push({
        file: row.filePath,
        status: "duplicate",
        message: `Fichier deja depose (epreuve "${duplicate.exam.slug}").`,
      });
      continue;
    }

    const seenQuadrupletFile = seenQuadruplets.get(quadrupletKey);
    const warning =
      duplicate.kind === "quadruplet"
        ? `Memes matiere/annee/session/type qu'une epreuve existante ("${duplicate.exam.slug}").`
        : seenQuadrupletFile
          ? `Memes matiere/annee/session/type qu'une ligne precedente de ce CSV ("${seenQuadrupletFile}").`
          : undefined;
    const slug = slugify(row.title);

    seenHashes.set(fileHash, row.filePath);
    seenQuadruplets.set(quadrupletKey, row.filePath);

    if (options.dryRun) {
      entries.push({ file: row.filePath, status: "dry-run", slug, warning });
      continue;
    }

    const r2Key = `exams/${fileHash}.pdf`;
    const { data: inserted, error: insertError } = await deps.supabase
      .from("exams")
      .insert({
        title: row.title,
        slug,
        academic_year: row.academicYear,
        session: row.session,
        exam_type: row.examType,
        field_id: row.fieldId,
        level_id: row.levelId,
        subject_id: row.subjectId,
        option_id: row.optionId,
        file_hash: fileHash,
        file_mime_type: "application/pdf",
        file_size: buffer.length,
        r2_key: r2Key,
      })
      .select("id")
      .single();
    if (insertError) {
      console.error("runSeed: insertion de l'epreuve", insertError);
      let message = `Insertion en base impossible (${insertError.code || insertError.message}).`;
      if (insertError.code === "23505") {
        message = insertError.message?.includes("exams_file_hash_key")
          ? "Fichier deja depose (course avec un autre depot)."
          : "Collision de slug a l'insertion (tres rare), relancer cette ligne.";
      }
      entries.push({ file: row.filePath, status: "error", message });
      continue;
    }

    try {
      await deps.putExamFile(r2Key, buffer);
    } catch (error) {
      console.error("runSeed: envoi du fichier vers R2", error);
      const { data: rolledBack, error: rollbackError } = await deps.supabase
        .from("exams")
        .delete()
        .eq("id", inserted.id)
        .select("id");
      const rollbackOk = !rollbackError && (rolledBack?.length ?? 0) > 0;
      entries.push({
        file: row.filePath,
        status: "error",
        message: rollbackOk
          ? "Depot R2 impossible, insertion annulee."
          : `Depot R2 impossible, et la ligne inseree (id "${inserted.id}") n'a pas pu etre retiree : a supprimer a la main.`,
      });
      continue;
    }

    entries.push({ file: row.filePath, status: "imported", slug, warning });
  }

  return { entries, summary: summarizeReport(entries) };
}
