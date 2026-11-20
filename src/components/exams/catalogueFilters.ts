import type { ExamFilters } from "@/features/exams/types";
import type { Field, Level, Subject } from "@/features/referentials/types";

/** Filtres du catalogue portes par l'URL (?levelId=...&session=...), lus cote serveur par getExams. */
export const CATALOGUE_FILTER_KEYS = [
  "search",
  "fieldId",
  "levelId",
  "subjectId",
  "session",
  "examType",
  "academicYear",
  "page",
] as const;

export type CatalogueFilterKey = (typeof CATALOGUE_FILTER_KEYS)[number];

export type CatalogueSearchParams = Record<
  string,
  string | string[] | undefined
>;

/** Referentiels proposes dans la carte des filtres. `fields: null` masque le filtre filiere (page d'une filiere). */
export type CatalogueFilterOptions = {
  fields: Field[] | null;
  levels: Level[];
  subjects: Subject[];
};

/**
 * searchParams de la page -> filtres de getExams. Valeurs brutes volontairement non validees ici :
 * examFiltersSchema les valide (une valeur invalide est ignoree, pas d'erreur).
 */
export function toExamFilters(
  searchParams: CatalogueSearchParams,
): ExamFilters {
  const filters: Record<string, string> = {};
  for (const key of CATALOGUE_FILTER_KEYS) {
    const value = searchParams[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first) filters[key] = first;
  }
  return filters as ExamFilters;
}
