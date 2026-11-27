import { z } from "zod";
import {
  EXAM_SESSIONS,
  EXAM_TYPES,
  MAX_BATCH_FILES,
  MAX_FILE_SIZE_BYTES,
} from "@/features/exams/schemas";

export const MAX_FILE_SIZE_LABEL = `${Math.floor(MAX_FILE_SIZE_BYTES / 1024)} Ko`;
export const ACCEPTED_FILE_TYPES = "application/pdf";

/** Nombre d'annees academiques proposees dans le select (la courante et les precedentes). */
const ACADEMIC_YEARS_COUNT = 10;
/** Mois (0 = janvier) a partir duquel une nouvelle annee academique commence. */
const ACADEMIC_YEAR_START_MONTH = 8;

/**
 * Annees academiques au format attendu par le backend (`AAAA-AAAA`), de la plus recente a la plus
 * ancienne. L'annee en cours bascule en septembre.
 */
export function academicYears(
  now: Date = new Date(),
  count = ACADEMIC_YEARS_COUNT,
): string[] {
  const start =
    now.getMonth() >= ACADEMIC_YEAR_START_MONTH
      ? now.getFullYear()
      : now.getFullYear() - 1;
  return Array.from({ length: count }, (_, i) => {
    const year = start - i;
    return `${year}-${year + 1}`;
  });
}

/**
 * Controle d'un fichier des sa selection, memes regles que `examUploadSchema` cote serveur (qui
 * revalide de toute facon, avec en plus la signature PDF et le doublon).
 */
export function validateExamFile(file: File): string | null {
  if (file.size === 0) return "Le fichier est vide.";
  if (file.type !== ACCEPTED_FILE_TYPES) return "Le fichier doit être un PDF.";
  if (file.size > MAX_FILE_SIZE_BYTES)
    return `Le fichier dépasse la limite de ${MAX_FILE_SIZE_LABEL}. Compressez-le (un outil de compression PDF en ligne suffit) puis réessayez.`;
  return null;
}

/** Cle d'identite d'un fichier, pour ne pas ajouter deux fois le meme fichier au lot. */
export function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

/** Ajoute les fichiers selectionnes au lot en ignorant ceux deja presents. */
export function mergeFiles(current: File[], incoming: File[]): File[] {
  const keys = new Set(current.map(fileKey));
  const added = incoming.filter((file) => {
    const key = fileKey(file);
    if (keys.has(key)) return false;
    keys.add(key);
    return true;
  });
  return [...current, ...added];
}

/** Vide ("Année inconnue" coché, #202) ou au format attendu par le backend. */
const academicYearSchema = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{4}$/, "Format attendu : AAAA-AAAA."),
]);

/** Metadonnees propres a chaque fichier du lot ; les autres sont communes a tout le lot. Le titre
 * n'est plus saisi (#202) : toujours genere cote serveur depuis #198. */
const examFileEntrySchema = z.object({
  file: z
    .instanceof(File, { message: "Fichier manquant." })
    .refine(
      (file) => validateExamFile(file) === null,
      "Retirez ce fichier invalide avant de publier.",
    ),
  academicYear: academicYearSchema,
});

/** Champs communs aux formulaires d'ajout et de modification (filiere, niveau, matiere...).
 * `session` vide est resolu par `validateSessionForExamType`, applique apres `.extend`. */
const commonExamSchema = z.object({
  fieldId: z.uuid("Choisissez une filière."),
  levelId: z.uuid("Choisissez un niveau."),
  subjectId: z.uuid("Choisissez une matière dans la liste."),
  session: z.union([z.literal(""), z.enum(EXAM_SESSIONS)]),
  examType: z.enum(EXAM_TYPES, "Choisissez un type d'évaluation."),
});

export type ExamCommonField = keyof z.output<typeof commonExamSchema>;
export type ExamCommonValues = Record<ExamCommonField, string>;

/**
 * Un Controle Continu n'a jamais de session (#196), meme regle que
 * `refuseSessionOnContinuousControl` cote serveur, `exams/schemas.ts`. La session d'un Controle
 * Terminal reste facultative (decision du 2026-11-26 : inconnue possible sur une vieille epreuve),
 * jamais exigee ici. Appliquee apres `.extend` comme son equivalent serveur : un `superRefine` rend
 * le schema un `ZodEffects`, qui n'a plus de `.extend`.
 */
function validateSessionForExamType<
  T extends z.ZodType<{ examType: string; session: string }>,
>(schema: T) {
  return schema.superRefine((data, ctx) => {
    if (data.examType === "Contrôle Continu" && data.session !== "") {
      ctx.addIssue({
        code: "custom",
        path: ["session"],
        message: "Un Contrôle Continu n'a jamais de session.",
      });
    }
  });
}

/**
 * Validation cote client du formulaire d'ajout. Les noms des champs sont ceux attendus par
 * `uploadExamsBatch` : l'annee academique par fichier, le reste commun au lot. Option et titre ne
 * sont plus proposes (#202) : deduits/generes cote serveur (#197/#198).
 */
export const addExamFormSchema = validateSessionForExamType(
  commonExamSchema.extend({
    files: z
      .array(examFileEntrySchema)
      .min(1, "Ajoutez au moins un fichier.")
      .max(
        MAX_BATCH_FILES,
        `Vous pouvez publier au plus ${MAX_BATCH_FILES} fichiers à la fois.`,
      ),
  }),
);

export type AddExamFormValues = z.output<typeof addExamFormSchema>;
type SharedField = ExamCommonField;
type FileEntryField = "file" | "academicYear";

export type AddExamErrors = Partial<Record<SharedField | "files", string>>;
/** Erreurs par fichier, indexees par la position du fichier dans le lot. */
export type AddExamFileErrors = Record<
  number,
  Partial<Record<FileEntryField, string>>
>;

/** Premier message par champ commun, et par champ de chaque fichier du lot. */
export function toFieldErrors(error: z.ZodError): {
  errors: AddExamErrors;
  fileErrors: AddExamFileErrors;
} {
  const errors: AddExamErrors = {};
  const fileErrors: AddExamFileErrors = {};
  for (const issue of error.issues) {
    const [head, index, field] = issue.path;
    if (head === "files" && typeof index === "number") {
      const entry = (fileErrors[index] ??= {});
      const name = field as FileEntryField;
      entry[name] ??= issue.message;
    } else {
      const name = head as SharedField | "files";
      errors[name] ??= issue.message;
    }
  }
  return { errors, fileErrors };
}

const SHARED_BATCH_FIELDS = [
  "session",
  "examType",
  "fieldId",
  "levelId",
  "subjectId",
] as const;

/**
 * `FormData` au format de `uploadExamsBatch` : un `files` par fichier et, pour chaque metadonnee,
 * autant de valeurs que de fichiers (alignees par index).
 */
export function toBatchFormData(values: AddExamFormValues): FormData {
  const formData = new FormData();
  for (const entry of values.files) {
    formData.append("files", entry.file);
    formData.append("academicYear", entry.academicYear);
    for (const name of SHARED_BATCH_FIELDS) {
      formData.append(name, values[name]);
    }
  }
  return formData;
}

/**
 * Validation cote client du formulaire de modification (fichier inchange), memes champs que
 * `updateExamMetadata`. Titre et option ne sont plus proposes (#202).
 */
export const editExamFormSchema = validateSessionForExamType(
  commonExamSchema.extend({
    academicYear: academicYearSchema,
  }),
);

export type EditExamFormValues = z.output<typeof editExamFormSchema>;
export type EditExamErrors = Partial<Record<keyof EditExamFormValues, string>>;

/** Premier message d'erreur par champ du formulaire de modification. */
export function toEditFieldErrors(error: z.ZodError): EditExamErrors {
  const errors: EditExamErrors = {};
  for (const issue of error.issues) {
    const name = issue.path[0] as keyof EditExamFormValues;
    errors[name] ??= issue.message;
  }
  return errors;
}

/** `FormData` au format de `updateExamMetadata`. */
export function toMetadataFormData(values: EditExamFormValues): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(values)) {
    formData.append(name, value);
  }
  return formData;
}

/** Validation cote client du remplacement du PDF (meme regles que `examFileReplaceSchema`). */
export const replaceFileFormSchema = z.object({
  file: z
    .instanceof(File, { message: "Ajoutez le nouveau fichier." })
    .refine(
      (file) => validateExamFile(file) === null,
      "Retirez ce fichier invalide et choisissez un PDF valide.",
    ),
});
