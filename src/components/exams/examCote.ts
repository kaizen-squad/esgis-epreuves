import {
  fieldDisplayName,
  optionDisplayName,
} from "@/components/fields/fieldLabel";

export type CoteFields = {
  field?: string | null;
  level?: string | null;
  /** Absente des niveaux de tronc commun (L1/L2) : simplement omise de la cote. */
  option?: string | null;
  subject?: string | null;
  academicYear?: string | null;
  examType?: string | null;
};

export type CoteSegmentKey =
  "field" | "level" | "option" | "subject" | "academicYear" | "examType";

export type CoteSegment = { key: CoteSegmentKey; label: string; name: string };

const EXAM_TYPE_CODES: Record<string, string> = {
  "Contrôle Terminal": "CT",
  "Contrôle Continu": "CC",
};

/** Matière telle qu'affichée dans la cote : en majuscules, dans l'esprit d'une fiche d'archive. */
export function coteSubject(subject: string): string {
  return subject.toLocaleUpperCase("fr-FR");
}

/**
 * Segments non vides de la cote, dans l'ordre d'affichage (filière, niveau, option, matière,
 * année, type) : seule source de la logique, partagée par `examCote` (texte) et `<Cote>`
 * (segments cliquables), pour ne jamais diverger entre les deux.
 */
export function coteSegments(exam: CoteFields): CoteSegment[] {
  const segments: (CoteSegment | null)[] = [
    exam.field
      ? { key: "field", label: "Filière", name: fieldDisplayName(exam.field) }
      : null,
    exam.level ? { key: "level", label: "Niveau", name: exam.level } : null,
    exam.option
      ? {
          key: "option",
          label: "Option",
          name: optionDisplayName(exam.option),
        }
      : null,
    exam.subject
      ? { key: "subject", label: "Matière", name: coteSubject(exam.subject) }
      : null,
    exam.academicYear
      ? {
          key: "academicYear",
          label: "Année académique",
          name: exam.academicYear,
        }
      : null,
    exam.examType
      ? {
          key: "examType",
          label: "Type",
          name: EXAM_TYPE_CODES[exam.examType] ?? exam.examType,
        }
      : null,
  ];
  return segments.filter((segment): segment is CoteSegment => segment !== null);
}

/**
 * Cote d'archive d'une épreuve ("IRT : L2 : ALGÈBRE : 2023-2024 : CT"), résumé de son
 * classement. Un champ manquant (ou une option absente, cas des niveaux de tronc commun) est
 * simplement omis, jamais un segment vide (ex. ":: ").
 */
export function examCote(exam: CoteFields): string {
  return coteSegments(exam)
    .map((segment) => segment.name)
    .join(" : ");
}
