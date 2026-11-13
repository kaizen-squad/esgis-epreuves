import { createClient } from "@/lib/supabase/server";
import type { ExamSession, ExamType } from "./types";

export type ExamDuplicateMatch = {
  id: string;
  slug: string;
  title: string;
};

export type ExamDuplicateCheck =
  | { kind: "none" }
  | { kind: "hash"; exam: ExamDuplicateMatch }
  | { kind: "quadruplet"; exam: ExamDuplicateMatch };

export type ExamQuadruplet = {
  subjectId: string;
  academicYear: string;
  session: ExamSession;
  examType: ExamType;
};

const DUPLICATE_SELECT = "id, slug, title";

/**
 * Detection de doublon partagee (#19), reutilisee par #18/#55/#21/#56. Le hash exact du fichier
 * est verifie en premier et l'emporte toujours : un contenu identique reste un doublon bloquant
 * meme si le quadruplet differe. Le quadruplet (matiere + annee academique + session + type)
 * n'est qu'un avertissement non bloquant : il peut legitimement se repeter (plusieurs controles
 * continus de la meme matiere dans la meme annee) ou correspondre a une edition legitime (#55,
 * `excludeExamId` exclut alors l'epreuve editee de la recherche).
 */
export async function checkExamDuplicate(
  fileHash: string,
  quadruplet: ExamQuadruplet,
  excludeExamId?: string,
): Promise<ExamDuplicateCheck> {
  const supabase = await createClient();

  let hashQuery = supabase
    .from("exams")
    .select(DUPLICATE_SELECT)
    .eq("file_hash", fileHash);
  if (excludeExamId) hashQuery = hashQuery.neq("id", excludeExamId);
  const { data: hashMatch, error: hashError } = await hashQuery.maybeSingle();
  if (hashError) throw hashError;
  if (hashMatch) return { kind: "hash", exam: hashMatch };

  let quadrupletQuery = supabase
    .from("exams")
    .select(DUPLICATE_SELECT)
    .eq("subject_id", quadruplet.subjectId)
    .eq("academic_year", quadruplet.academicYear)
    .eq("session", quadruplet.session)
    .eq("exam_type", quadruplet.examType)
    .limit(1);
  if (excludeExamId) quadrupletQuery = quadrupletQuery.neq("id", excludeExamId);
  const { data: quadrupletMatches, error: quadrupletError } =
    await quadrupletQuery;
  if (quadrupletError) throw quadrupletError;
  const quadrupletMatch = quadrupletMatches?.[0];
  if (quadrupletMatch) {
    return { kind: "quadruplet", exam: quadrupletMatch };
  }

  return { kind: "none" };
}
