"use server";

import { createHash } from "node:crypto";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { putExamFile } from "@/lib/r2/upload";
import {
  actionDuplicateWarning,
  actionError,
  actionOk,
  type ActionResult,
} from "@/lib/action-result";
import { examUploadSchema, slugify } from "./schemas";

const PDF_MAGIC_BYTES = "%PDF-";

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
 * Detection de doublon limitee au hash exact pour l'instant : #19 introduira la detection
 * par quadruplet (titre/matiere/niveau/session) via une fonction partagee qui remplacera
 * ce controle.
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

  const { data: existing, error: lookupError } = await supabase
    .from("exams")
    .select("id, slug, title")
    .eq("file_hash", fileHash)
    .maybeSingle();
  if (lookupError) {
    console.error("uploadExam: lecture du hash existant", lookupError);
    return actionError("Impossible d'enregistrer l'epreuve.");
  }
  if (existing) {
    return actionDuplicateWarning("Ce fichier a deja ete depose.", {
      examId: existing.id,
      slug: existing.slug,
      title: existing.title,
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

  return actionOk({ slug });
}
