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
    return `Le fichier dépasse la limite de ${MAX_FILE_SIZE_LABEL}.`;
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

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * Validation cote client du formulaire d'ajout. Les noms des champs sont ceux attendus par
 * `uploadExamsBatch` ; les metadonnees saisies une fois s'appliquent a chaque fichier du lot.
 */
export const addExamFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères.")
    .max(200, "Le titre ne doit pas dépasser 200 caractères."),
  fieldId: z.uuid("Choisissez une filière."),
  levelId: z.uuid("Choisissez un niveau."),
  subjectId: z.uuid("Choisissez une matière dans la liste."),
  academicYear: z
    .string()
    .regex(/^\d{4}-\d{4}$/, "Choisissez une année académique."),
  session: z.enum(EXAM_SESSIONS, "Choisissez une session."),
  examType: z.enum(EXAM_TYPES, "Choisissez un type d'évaluation."),
  files: z
    .array(z.instanceof(File))
    .min(1, "Ajoutez au moins un fichier.")
    .max(
      MAX_BATCH_FILES,
      `Vous pouvez publier au plus ${MAX_BATCH_FILES} fichiers à la fois.`,
    )
    .refine(
      (files) => files.every((file) => validateExamFile(file) === null),
      "Retirez les fichiers invalides avant de publier.",
    ),
});

export type AddExamFormValues = z.output<typeof addExamFormSchema>;
export type AddExamField = keyof AddExamFormValues;
export type AddExamErrors = Partial<Record<AddExamField, string>>;

/** Premier message d'erreur par champ, pour l'affichage sous chaque champ. */
export function toFieldErrors(error: z.ZodError): AddExamErrors {
  const { fieldErrors } = z.flattenError(error);
  const errors: AddExamErrors = {};
  for (const [name, messages] of Object.entries(fieldErrors)) {
    const first = (messages as string[] | undefined)?.[0];
    if (first) errors[name as AddExamField] = first;
  }
  return errors;
}

const BATCH_METADATA_FIELDS = [
  "title",
  "academicYear",
  "session",
  "examType",
  "fieldId",
  "levelId",
  "subjectId",
] as const;

/**
 * `FormData` au format de `uploadExamsBatch` : un `files` par fichier et, pour chaque metadonnee,
 * autant de valeurs que de fichiers (alignees par index). `optionId` vaut une chaine vide : le
 * formulaire ne propose pas d'option.
 */
export function toBatchFormData(values: AddExamFormValues): FormData {
  const formData = new FormData();
  for (const file of values.files) {
    formData.append("files", file);
    for (const name of BATCH_METADATA_FIELDS) {
      formData.append(name, values[name]);
    }
    formData.append("optionId", "");
  }
  return formData;
}
