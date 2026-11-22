import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getFieldById } from "@/features/referentials/queries";
import { getExamFileInfo } from "@/lib/r2/metadata";
import { examFiltersSchema, fixedFieldFilters } from "./schemas";
import type {
  Exam,
  ExamFilters,
  ExamListResult,
  FieldExamsResult,
  FieldCategory,
  FieldLevelSummary,
} from "./types";

const EXAM_CATALOG_SELECT =
  "id, title, slug, academic_year, session, exam_type, file_size, created_at, field_id, field_name, level_id, level_name, subject_id, subject_name, option_id, option_name";

/** PostgREST : decalage hors bornes avec un count exact (page trop loin apres un filtre qui reduit le total). */
const RANGE_NOT_SATISFIABLE = "PGRST103";

const RECENT_EXAMS_LIMIT = 8;

type CatalogRow = {
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
};

type ExamFile = Pick<Exam, "fileSize" | "mimeType" | "fileVersion">;

const FILE_VERSION_LENGTH = 12;

/**
 * Fichier de chaque epreuve, absent de la vue `exams_catalog` : taille et type lus sur le fichier
 * depose (R2), a defaut ceux enregistres en base.
 */
async function getExamFiles(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, ExamFile>> {
  if (ids.length === 0) return new Map();

  const { data, error } = await supabase
    .from("exams")
    .select("id, r2_key, file_hash, file_mime_type, file_size")
    .in("id", ids);
  if (error) throw error;

  const keys = [...new Set(data.map((row) => row.r2_key as string))];
  const infos = new Map(
    await Promise.all(
      keys.map(async (key) => [key, await getExamFileInfo(key)] as const),
    ),
  );

  return new Map(
    data.map((row) => {
      const info = infos.get(row.r2_key);
      return [
        row.id as string,
        {
          fileSize: info?.size ?? row.file_size,
          mimeType: info?.mimeType ?? row.file_mime_type,
          fileVersion: row.file_hash.slice(-FILE_VERSION_LENGTH),
        },
      ];
    }),
  );
}

function toExam(row: CatalogRow, file: ExamFile | undefined): Exam {
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
    fileSize: file?.fileSize ?? row.file_size,
    mimeType: file?.mimeType ?? "",
    fileVersion: file?.fileVersion ?? "",
    createdAt: row.created_at,
  };
}

type CatalogPage = Omit<ExamListResult, "exams"> & { rows: CatalogRow[] };

/** Page du catalogue telle que lue en base, sans les informations de fichier. */
async function queryCatalog(
  supabase: SupabaseClient,
  rawFilters: ExamFilters,
): Promise<CatalogPage> {
  const filters = examFiltersSchema.parse(rawFilters);

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
    return queryCatalog(supabase, { ...rawFilters, page: 1 });
  }
  if (error) throw error;

  return {
    rows: data,
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

async function queryExams(
  supabase: SupabaseClient,
  rawFilters: ExamFilters,
): Promise<ExamListResult> {
  const { rows, ...page } = await queryCatalog(supabase, rawFilters);
  const files = await getExamFiles(
    supabase,
    rows.map((row) => row.id),
  );
  return { ...page, exams: rows.map((row) => toExam(row, files.get(row.id))) };
}

/** Recherche texte + filtres combinables sur le catalogue (#9), pagination par decalage. */
export async function getExams(
  rawFilters: ExamFilters,
): Promise<ExamListResult> {
  return queryExams(await createClient(), rawFilters);
}

/** Nombre d'epreuves correspondant aux filtres, sans lire les epreuves elles-memes. */
export async function countExams(rawFilters: ExamFilters): Promise<number> {
  const { total } = await queryCatalog(await createClient(), {
    ...rawFilters,
    page: 1,
    pageSize: 1,
  });
  return total;
}

const ACADEMIC_YEARS_REVALIDATE_SECONDS = 60;

const getAcademicYearsCached = unstable_cache(
  async (fieldId: string | null): Promise<string[]> => {
    const supabase = createPublicClient();
    const years: string[] = [];

    // Une requete par annee distincte (la plus recente sous la precedente) : PostgREST n'a pas de
    // `distinct`, et lire toutes les lignes serait tronque par `max_rows`.
    for (;;) {
      let query = supabase
        .from("exams")
        .select("academic_year")
        .order("academic_year", { ascending: false })
        .limit(1);
      if (fieldId) query = query.eq("field_id", fieldId);
      const last = years.at(-1);
      if (last) query = query.lt("academic_year", last);

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return years;
      years.push(data.academic_year);
    }
  },
  ["exam-academic-years"],
  { revalidate: ACADEMIC_YEARS_REVALIDATE_SECONDS, tags: ["exams"] },
);

/**
 * Annees academiques ayant au moins une epreuve (d'une filiere si `fieldId`), de la plus recente a
 * la plus ancienne : choix du filtre du catalogue, donc jamais une annee sans resultat.
 */
export async function getAcademicYears(
  fieldId: string | null = null,
): Promise<string[]> {
  return getAcademicYearsCached(fieldId);
}

const RECENT_EXAMS_REVALIDATE_SECONDS = 60;

const getRecentExamsCached = unstable_cache(
  async (limit: number): Promise<Exam[]> => {
    const { exams } = await queryExams(createPublicClient(), {
      page: 1,
      pageSize: limit,
    });
    return exams;
  },
  ["recent-exams"],
  { revalidate: RECENT_EXAMS_REVALIDATE_SECONDS, tags: ["exams"] },
);

/** Epreuves recentes pour l'accueil : meme requete que le catalogue, juste une limite en plus. */
export async function getRecentExams(
  limit = RECENT_EXAMS_LIMIT,
): Promise<Exam[]> {
  return getRecentExamsCached(limit);
}

const FIELD_LEVEL_SUMMARIES_REVALIDATE_SECONDS = 60;

type FieldLevelCouple = Omit<FieldLevelSummary, "examCount">;

/** Jointures many-to-one : PostgREST renvoie un objet, le client non type les infere a tort en tableau. */
type SubjectCoupleRow = {
  field_id: string;
  level_id: string;
  fields: { name: string };
  levels: { name: string };
};

/** Couples niveau x filiere proposes, deduits des matieres actives (filiere et niveau actifs aussi). */
async function getFieldLevelCouples(
  supabase: SupabaseClient,
): Promise<FieldLevelCouple[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("field_id, level_id, fields!inner(name), levels!inner(name)")
    .eq("is_active", true)
    .eq("fields.is_active", true)
    .eq("levels.is_active", true);

  if (error) throw error;

  const couples = new Map<string, FieldLevelCouple>();
  for (const row of data as unknown as SubjectCoupleRow[]) {
    const key = `${row.field_id}:${row.level_id}`;
    if (couples.has(key)) continue;
    couples.set(key, {
      fieldId: row.field_id,
      fieldName: row.fields.name,
      levelId: row.level_id,
      levelName: row.levels.name,
    });
  }

  return [...couples.values()].sort(
    (a, b) =>
      a.fieldName.localeCompare(b.fieldName) ||
      a.levelName.localeCompare(b.levelName),
  );
}

const getFieldLevelSummariesCached = unstable_cache(
  async (): Promise<FieldLevelSummary[]> => {
    const supabase = createPublicClient();
    const couples = await getFieldLevelCouples(supabase);

    // Un comptage par couple (head: true, aucune ligne transferee) : exact quel que soit max_rows.
    return Promise.all(
      couples.map(async (couple) => {
        const { count, error } = await supabase
          .from("exams")
          .select("id", { count: "exact", head: true })
          .eq("field_id", couple.fieldId)
          .eq("level_id", couple.levelId);

        if (error) throw error;

        return { ...couple, examCount: count ?? 0 };
      }),
    );
  },
  ["field-level-summaries"],
  { revalidate: FIELD_LEVEL_SUMMARIES_REVALIDATE_SECONDS, tags: ["exams"] },
);

/** Cartes "niveau x filiere" de l'accueil (ex. "L1 IRT") avec leur nombre d'epreuves, toutes options confondues. */
export async function getFieldLevelSummaries(): Promise<FieldLevelSummary[]> {
  return getFieldLevelSummariesCached();
}

/** Page /filieres : une categorie par filiere, dans l'ordre du tri des couples (meme cache). */
export async function getFieldCategories(): Promise<FieldCategory[]> {
  const categories = new Map<string, FieldCategory>();
  for (const summary of await getFieldLevelSummaries()) {
    const category = categories.get(summary.fieldId) ?? {
      fieldId: summary.fieldId,
      fieldName: summary.fieldName,
      levels: [],
    };
    category.levels.push(summary);
    categories.set(summary.fieldId, category);
  }
  return [...categories.values()];
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

/**
 * Options ayant au moins une epreuve pour ce couple filiere x niveau (titre de la page d'une
 * filiere a partir de la L3). Un comptage par option active de la filiere : peu de requetes, exact.
 */
export async function getFieldLevelOptionNames(
  fieldId: string,
  levelId: string,
): Promise<string[]> {
  const supabase = await createClient();
  const { data: options, error } = await supabase
    .from("options")
    .select("id, name")
    .eq("field_id", fieldId)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  const names = await Promise.all(
    options.map(async (option) => {
      const { count, error: countError } = await supabase
        .from("exams")
        .select("id", { count: "exact", head: true })
        .eq("field_id", fieldId)
        .eq("level_id", levelId)
        .eq("option_id", option.id);

      if (countError) throw countError;

      return (count ?? 0) > 0 ? (option.name as string) : null;
    }),
  );

  return names.filter((name) => name !== null);
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

  if (!data) return null;

  const files = await getExamFiles(supabase, [data.id]);
  return toExam(data, files.get(data.id));
}

/** Cle R2 du PDF d'une epreuve par son slug, pour la route de previsualisation/telechargement (#50). `null` si absente. */
export async function getExamR2Key(slug: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exams")
    .select("r2_key")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;

  return data?.r2_key ?? null;
}
