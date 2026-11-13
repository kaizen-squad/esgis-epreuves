import { z } from "zod";
import type { ExamFilters, ExamType, ExamSession } from "./types";

/** Exportes pour etre reutilisees par le script de seed (#21) : jamais une seconde liste a tenir alignee avec celle-ci. */
export const EXAM_SESSIONS: readonly ExamSession[] = [
  "Session Normale",
  "Rattrapage",
];
export const EXAM_TYPES: readonly ExamType[] = [
  "Contrôle Terminal",
  "Contrôle Continu",
];

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const MAX_SEARCH_LENGTH = 100;

const PDF_MIME_TYPE = "application/pdf";
/**
 * Marge sous la limite par défaut (1 Mo) d'une Server Action Next.js : le reste du formulaire
 * doit aussi tenir dans ce corps. Un fichier entre cette limite et ~1 Mo ne déclenche jamais
 * ce message : Next refuse la requête avant d'exécuter `uploadExam`. Le front doit donc aussi
 * contrôler la taille côté client pour afficher un message clair dans cette zone.
 *
 * Exportée pour que le script de seed (#21) applique la même limite : contrairement à Next, rien
 * ne la fait respecter automatiquement pour un script Node autonome.
 */
export const MAX_FILE_SIZE_BYTES = 900 * 1024;

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

/**
 * Slug ascii derive du titre, suffixe d'un identifiant court (#18) pour garantir l'unicite
 * sans requete prealable : deux depots du meme titre produisent deux slugs distincts.
 */
export function slugify(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/** Validation du depot d'une epreuve (#18) : type MIME et taille du fichier, referentiels requis. */
export const examUploadSchema = z.object({
  title: z.string().trim().min(3).max(200),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Format attendu : AAAA-AAAA."),
  session: z.enum(EXAM_SESSIONS),
  examType: z.enum(EXAM_TYPES),
  fieldId: z.uuid(),
  levelId: z.uuid(),
  subjectId: z.uuid(),
  optionId: z.uuid().optional(),
  file: z
    .instanceof(File, { message: "Fichier manquant." })
    .refine((file) => file.size > 0, "Le fichier est vide.")
    .refine(
      (file) => file.type === PDF_MIME_TYPE,
      "Le fichier doit etre un PDF.",
    )
    .refine(
      (file) => file.size <= MAX_FILE_SIZE_BYTES,
      `Le fichier depasse la limite de ${Math.floor(MAX_FILE_SIZE_BYTES / 1024)} Ko.`,
    ),
});

export type ExamUploadParsed = z.output<typeof examUploadSchema>;

/** Validation de la modification des metadonnees d'une epreuve (#55) : memes champs que examUploadSchema, sans le fichier. */
export const examMetadataSchema = examUploadSchema.omit({ file: true });

export type ExamMetadataParsed = z.output<typeof examMetadataSchema>;

/** Validation du remplacement du fichier d'une epreuve (#55) : seul le fichier, memes contraintes que examUploadSchema. */
export const examFileReplaceSchema = examUploadSchema.pick({ file: true });
