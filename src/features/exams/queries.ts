import { createClient } from "@/lib/supabase/server";
import { getFieldById } from "@/features/referentials/queries";
import { examFiltersSchema, fixedFieldFilters } from "./schemas";
import type {
  Exam,
  ExamFilters,
  ExamListResult,
  FieldExamsResult,
} from "./types";

const EXAM_CATALOG_SELECT =
  "id, title, slug, academic_year, session, exam_type, file_size, created_at, field_id, field_name, level_id, level_name, subject_id, subject_name, option_id, option_name";

/** PostgREST : decalage hors bornes avec un count exact (page trop loin apres un filtre qui reduit le total). */
const RANGE_NOT_SATISFIABLE = "PGRST103";

const RECENT_EXAMS_LIMIT = 8;

function toExam(row: {
  id: string;
  title: string;
  slug: string;
  academic_year: string;
  session: Exam["session"];
  exam_type: Exam["examType"];
  file_size: number;
  created_at: string;
  field_id: string;
  field_name: string;
  level_id: string;
  level_name: string;
  subject_id: string;
  subject_name: string;
  option_id: string | null;
  option_name: string | null;
}): Exam {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    academicYear: row.academic_year,
    session: row.session,
    examType: row.exam_type,
    field: row.field_name,
    fieldId: row.field_id,
    level: row.level_name,
    levelId: row.level_id,
    subject: row.subject_name,
    subjectId: row.subject_id,
    option: row.option_name,
    optionId: row.option_id,
    fileSize: row.file_size,
    createdAt: row.created_at,
  };
}

/** Recherche texte + filtres combinables sur le catalogue (#9), pagination par decalage. */
export async function getExams(
  rawFilters: ExamFilters,
): Promise<ExamListResult> {
  const filters = examFiltersSchema.parse(rawFilters);
  const supabase = await createClient();

  let query = supabase
    .from("exams_catalog")
    .select(EXAM_CATALOG_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (filters.fieldId) query = query.eq("field_id", filters.fieldId);
  if (filters.levelId) query = query.eq("level_id", filters.levelId);
  if (filters.subjectId) query = query.eq("subject_id", filters.subjectId);
  if (filters.optionId) query = query.eq("option_id", filters.optionId);
  if (filters.session) query = query.eq("session", filters.session);
  if (filters.examType) query = query.eq("exam_type", filters.examType);
  if (filters.academicYear)
    query = query.eq("academic_year", filters.academicYear);
  for (const token of filters.search)
    query = query.ilike("search_text", `%${token}%`);

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error?.code === RANGE_NOT_SATISFIABLE) {
    // Page demandee au-dela du total (filtre qui reduit les resultats, page restee dans l'URL) : page 1 plutot qu'une erreur.
    return getExams({ ...rawFilters, page: 1 });
  }
  if (error) throw error;

  return {
    exams: data.map(toExam),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

/** Epreuves recentes pour l'accueil : meme requete que le catalogue, juste une limite en plus. */
export async function getRecentExams(
  limit = RECENT_EXAMS_LIMIT,
): Promise<Exam[]> {
  const { exams } = await getExams({ page: 1, pageSize: limit });
  return exams;
}

/**
 * Page dediee a une filiere (#53) : metadonnees de la filiere et ses epreuves, meme pagination et
 * memes filtres que le catalogue (#9), filiere fixee quel que soit le fieldId recu dans les filtres.
 * `null` si la filiere n'existe pas (notFound() cote page).
 */
export async function getFieldExams(
  fieldId: string,
  rawFilters: ExamFilters = {},
): Promise<FieldExamsResult | null> {
  const field = await getFieldById(fieldId);
  if (!field) return null;

  return {
    field,
    exams: await getExams(fixedFieldFilters(fieldId, rawFilters)),
  };
}

/** Lecture d'une epreuve par son slug, pour la page detail. `null` si absente (notFound() cote page). */
export async function getExamBySlug(slug: string): Promise<Exam | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams_catalog")
    .select(EXAM_CATALOG_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;

  return data ? toExam(data) : null;
}
