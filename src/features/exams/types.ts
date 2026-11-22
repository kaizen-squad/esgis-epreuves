import type { Field } from "@/features/referentials/types";

export type ExamSession = "Session Normale" | "Rattrapage";
export type ExamType = "Contrôle Terminal" | "Contrôle Continu";

/** Contrat entre `queries.ts`/`actions.ts` et les composants : porte à la fois les noms affichés et les ids des référentiels (préremplissage du formulaire d'édition, #55). */
export type Exam = {
  id: string;
  title: string;
  slug: string;
  academicYear: string;
  session: ExamSession;
  examType: ExamType;
  field: string;
  fieldId: string;
  level: string;
  levelId: string;
  subject: string;
  subjectId: string;
  option: string | null;
  optionId: string | null;
  /** Taille reelle du fichier, en octets. */
  fileSize: number;
  /** Type MIME reel du fichier (ex. `application/pdf`), chaine vide si inconnu. */
  mimeType: string;
  /** Change quand le fichier est remplace : invalide l'apercu garde en cache par le navigateur. */
  fileVersion: string;
  createdAt: string;
};

export type ExamFilters = {
  search?: string;
  fieldId?: string;
  levelId?: string;
  subjectId?: string;
  optionId?: string;
  session?: ExamSession;
  examType?: ExamType;
  academicYear?: string;
  /** Depose par ce membre (R-15) : jamais lu depuis l'URL, seulement passe par le code serveur. */
  createdBy?: string;
  page?: number;
  pageSize?: number;
};

/** Couverture du fonds pour une matiere (R-16) : son niveau et son nombre d'epreuves archivees. */
export type SubjectCoverage = {
  subjectId: string;
  subjectName: string;
  levelId: string;
  levelName: string;
  examCount: number;
};

export type ExamListResult = {
  exams: Exam[];
  total: number;
  page: number;
  pageSize: number;
};

export type FieldExamsResult = {
  field: Field;
  exams: ExamListResult;
};

/** Carte "niveau x filiere" de l'accueil (ex. "L1 IRT") et son nombre d'epreuves. */
export type FieldLevelSummary = {
  fieldId: string;
  fieldName: string;
  levelId: string;
  levelName: string;
  examCount: number;
};

/** Categorie de la page /filieres : une filiere et ses couples niveau x filiere. */
export type FieldCategory = {
  fieldId: string;
  fieldName: string;
  levels: FieldLevelSummary[];
};
