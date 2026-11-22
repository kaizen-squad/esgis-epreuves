import { fieldDisplayName } from "@/components/fields/fieldLabel";

export type CoteFields = {
  field?: string | null;
  level?: string | null;
  subject?: string | null;
  academicYear?: string | null;
  examType?: string | null;
};

const EXAM_TYPE_CODES: Record<string, string> = {
  "Contrôle Terminal": "CT",
  "Contrôle Continu": "CC",
};

/** Matière telle qu'affichée dans la cote : en majuscules, dans l'esprit d'une fiche d'archive. */
export function coteSubject(subject: string): string {
  return subject.toLocaleUpperCase("fr-FR");
}

function coteSegments(exam: CoteFields): string[] {
  return [
    exam.field ? fieldDisplayName(exam.field) : null,
    exam.level ?? null,
    exam.subject ? coteSubject(exam.subject) : null,
    exam.academicYear ?? null,
    exam.examType ? (EXAM_TYPE_CODES[exam.examType] ?? exam.examType) : null,
  ].filter((segment): segment is string => Boolean(segment));
}

/**
 * Cote d'archive d'une épreuve ("IRT : L2 : ALGÈBRE : 2023-2024 : CT"), résumé de son
 * classement (filière, niveau, matière, année, type). Un champ manquant ou vide est simplement
 * omis, jamais un segment vide (ex. ":: ").
 */
export function examCote(exam: CoteFields): string {
  return coteSegments(exam).join(" : ");
}
