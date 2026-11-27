import {
  fieldDisplayName,
  optionDisplayName,
} from "@/components/fields/fieldLabel";

export type CoteFields = {
  field?: string | null;
  /** Sigle d'affichage de la filiere (#198), prefere au nom complet quand renseigne. */
  fieldShortName?: string | null;
  level?: string | null;
  /** Absente d'une matiere de tronc commun (L1, ou une matiere de L2 anterieure a l'option, #195) : simplement omise de la cote. */
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
      ? {
          key: "field",
          label: "Filière",
          name: fieldDisplayName(exam.field, exam.fieldShortName),
        }
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

export type ExamTitleFields = {
  subject: string;
  examType: string;
  /** Absente pour un Controle Continu (#196) ou inconnue sur une vieille epreuve. */
  session?: string | null;
};

/** Libelle du type d'epreuve dans le titre genere, phrase normale plutot qu'en capitales. */
const EXAM_TYPE_TITLE_LABELS: Record<string, string> = {
  "Contrôle Terminal": "Contrôle terminal",
  "Contrôle Continu": "Contrôle continu",
};

const EXAM_SESSION_TITLE_LABELS: Record<string, string> = {
  "Session Normale": "session normale",
  Rattrapage: "rattrapage",
};

/**
 * Titre d'une epreuve genere depuis ses metadonnees (#198), jamais saisi : "Matière : Type[,
 * session]" (ex. "Langage C avancé : Contrôle terminal, session normale"), sans repeter la cote
 * deja affichee juste en dessous sur la fiche et l'image de partage. La session n'apparait que
 * quand elle est connue (absente pour un Controle Continu, #196, ou une vieille epreuve). Un
 * rattrapage l'emporte sur le type ("Matière : Rattrapage" plutôt que "Matière : Contrôle
 * terminal, rattrapage") : c'est l'information la plus saillante pour un rattrapage (toujours un
 * Contrôle Terminal par construction, le dire est redondant), retour utilisateur.
 */
export function examTitle(exam: ExamTitleFields): string {
  if (exam.session === "Rattrapage") return `${exam.subject} : Rattrapage`;

  const typeLabel = EXAM_TYPE_TITLE_LABELS[exam.examType] ?? exam.examType;
  const sessionLabel = exam.session
    ? (EXAM_SESSION_TITLE_LABELS[exam.session] ?? exam.session)
    : null;

  return sessionLabel
    ? `${exam.subject} : ${typeLabel}, ${sessionLabel}`
    : `${exam.subject} : ${typeLabel}`;
}
