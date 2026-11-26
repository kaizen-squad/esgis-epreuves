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
 * Taille maximale d'un fichier (#18). Depuis #56, le corps maximal d'une Server Action de l'app
 * est relevé à 4 Mo (`experimental.serverActions.bodySizeLimit`, `next.config.ts`) pour que
 * `uploadExamsBatch` accepte plusieurs fichiers d'un coup : cette limite n'est donc plus une marge
 * sous le défaut Next (1 Mo, dépassé), mais directement le budget par fichier, choisi pour que
 * `MAX_BATCH_FILES` fichiers à cette taille restent sous les 4,5 Mo imposés par la plateforme
 * d'hébergement (voir `MAX_BATCH_FILES`). Un fichier trop gros atteint désormais l'action (Next ne
 * le rejette plus avant) et reçoit directement ce message Zod. Le front doit donc aussi contrôler
 * la taille côté client pour afficher un message clair sans attendre la réponse du serveur.
 *
 * Exportée pour que le script de seed (#21) applique la même limite : contrairement à Next, rien
 * ne la fait respecter automatiquement pour un script Node autonome.
 */
export const MAX_FILE_SIZE_BYTES = 900 * 1024;

/**
 * Nombre maximum de fichiers par lot (#56, `uploadExamsBatch`). Le corps d'une requete reste
 * borne par la plateforme d'hebergement (Vercel : 4,5 Mo quelle que soit la configuration Next,
 * voir `experimental.serverActions.bodySizeLimit` dans `next.config.ts`, souleve a l'identique).
 * 4 fichiers a 900 Ko (`MAX_FILE_SIZE_BYTES`) totalisent au plus 3,6 Mo de contenu binaire,
 * laissant de la marge pour les champs de metadonnee et les separateurs multipart.
 *
 * ponytail: plafond fixe choisi pour rester sous cette limite de plateforme ; a revoir si la
 * limite change ou si des fichiers plus gros que 900 Ko doivent etre acceptes en lot.
 */
export const MAX_BATCH_FILES = 4;

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
  // Filtre de proprietaire (acces aux donnees d'un membre) : jamais de .catch(undefined) ici,
  // un createdBy invalide doit faire echouer la requete, pas faire sauter le filtre et renvoyer
  // les epreuves de tout le monde.
  createdBy: z.uuid().optional(),
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

const examFileSchema = z
  .instanceof(File, { message: "Fichier manquant." })
  .refine((file) => file.size > 0, "Le fichier est vide.")
  .refine((file) => file.type === PDF_MIME_TYPE, "Le fichier doit etre un PDF.")
  .refine(
    (file) => file.size <= MAX_FILE_SIZE_BYTES,
    `Le fichier depasse la limite de ${Math.floor(MAX_FILE_SIZE_BYTES / 1024)} Ko. Compressez-le (un outil de compression PDF en ligne suffit) puis reessayez.`,
  );

/**
 * Champs communs au depot (#18) et a la modification (#55) d'une epreuve, hors fichier (`pick`/
 * `omit` requiert un objet simple, impossible une fois `superRefine` applique ci-dessous).
 * `fieldId`/`levelId`/`optionId` ne sont plus exiges depuis #197 : le classement est deduit de
 * `subjectId` par le trigger `exams_set_classification`, jamais saisi ni verifie cote serveur.
 * Restent acceptes et simplement ignores si le front (pas encore aligne, ticket #202) les envoie
 * encore. `academicYear`/`session` sont facultatifs depuis #196 (inconnues possibles sur une
 * vieille epreuve au depot) ; `examType` reste toujours obligatoire (visible sur toute copie).
 */
/** Exporte pour `seedRowSchema` (#21/#196), qui reutilise ses bornes `title`/`academicYear` sans
 * dupliquer `.shape` d'un schema deja passe par `superRefine` (devenu un ZodEffects, sans `.shape`). */
export const examFieldsSchema = z.object({
  /**
   * Accepte encore un titre libre (ignoré) si le front (pas aligné avant #202) en envoie un :
   * depuis #198, le titre est toujours calculé côté serveur (`examTitle`), jamais saisi.
   */
  title: z.string().trim().max(200).optional(),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Format attendu : AAAA-AAAA.")
    .optional(),
  session: z.enum(EXAM_SESSIONS).optional(),
  examType: z.enum(EXAM_TYPES),
  fieldId: z.uuid().optional(),
  levelId: z.uuid().optional(),
  subjectId: z.uuid(),
  optionId: z.uuid().optional(),
});

/** Un Controle Continu n'a jamais de session (#196), regle universelle valable pour toute filiere. */
function refuseSessionOnContinuousControl<
  T extends z.ZodType<{ examType: ExamType; session?: ExamSession }>,
>(schema: T) {
  return schema.superRefine((data, ctx) => {
    if (data.examType === "Contrôle Continu" && data.session !== undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["session"],
        message: "Un Contrôle Continu n'a jamais de session.",
      });
    }
  });
}

/** Validation du depot d'une epreuve (#18) : type MIME et taille du fichier en plus des champs communs. */
export const examUploadSchema = refuseSessionOnContinuousControl(
  examFieldsSchema.extend({ file: examFileSchema }),
);

export type ExamUploadParsed = z.output<typeof examUploadSchema>;

/** Validation de la modification des metadonnees d'une epreuve (#55) : memes champs que examUploadSchema, sans le fichier. */
export const examMetadataSchema =
  refuseSessionOnContinuousControl(examFieldsSchema);

export type ExamMetadataParsed = z.output<typeof examMetadataSchema>;

/** Validation du remplacement du fichier d'une epreuve (#55) : seul le fichier, memes contraintes que examUploadSchema. */
export const examFileReplaceSchema = z.object({ file: examFileSchema });
