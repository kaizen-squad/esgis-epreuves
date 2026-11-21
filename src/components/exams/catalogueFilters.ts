import type { ExamFilters } from "@/features/exams/types";
import type { Field, Level, Subject } from "@/features/referentials/types";

/** Epreuves par page dans les catalogues : 12 tombe juste sur 2, 3 ou 4 colonnes de cartes. */
export const CATALOGUE_PAGE_SIZE = 12;

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
 * examFiltersSchema les valide (une valeur invalide est ignoree, pas d'erreur). La taille de page
 * est fixee ici (`CATALOGUE_PAGE_SIZE`), jamais lue dans l'URL.
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
  return { ...filters, pageSize: CATALOGUE_PAGE_SIZE } as ExamFilters;
}
