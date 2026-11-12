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
  fileSize: number;
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
  page?: number;
  pageSize?: number;
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
