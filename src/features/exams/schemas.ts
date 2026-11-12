import { z } from "zod";
import type { ExamFilters, ExamType, ExamSession } from "./types";

const EXAM_SESSIONS: readonly ExamSession[] = ["Session Normale", "Rattrapage"];
const EXAM_TYPES: readonly ExamType[] = [
  "Contrôle Terminal",
  "Contrôle Continu",
];

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

/**
 * Decoupe le terme de recherche en mots, casse/accents aplatis pour s'aligner sur `search_text`
 * (unaccent + lower, calcule en base par la vue `exams_catalog`). Plusieurs mots filtrent en ET
 * (un `ilike` par mot cote requete), donc l'ordre des mots dans la recherche n'importe plus.
 * Les ligatures (œ, æ) et le ß n'ont pas d'equivalent dans l'extension unaccent de Postgres :
 * repliees ici a la main pour rester coherent avec la base.
 */
export function searchTokens(term: string | undefined): string[] {
  if (!term) return [];

  const flattened = term
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss");

  return flattened.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

export const examFiltersSchema = z.object({
  search: z
    .string()
    .max(MAX_SEARCH_LENGTH)
    .optional()
    .catch(undefined)
    .transform(searchTokens),
  fieldId: z.uuid().optional().catch(undefined),
  levelId: z.uuid().optional().catch(undefined),
  subjectId: z.uuid().optional().catch(undefined),
  optionId: z.uuid().optional().catch(undefined),
  session: z.enum(EXAM_SESSIONS).optional().catch(undefined),
  examType: z.enum(EXAM_TYPES).optional().catch(undefined),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/)
    .optional()
    .catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .catch(DEFAULT_PAGE_SIZE),
});

export type ExamFiltersParsed = z.output<typeof examFiltersSchema>;

/** Filiere fixee par la page (#53) : prend toujours le pas sur un fieldId venu des filtres. */
export function fixedFieldFilters(
  fieldId: string,
  rawFilters: ExamFilters = {},
): ExamFilters {
  return { ...rawFilters, fieldId };
}
