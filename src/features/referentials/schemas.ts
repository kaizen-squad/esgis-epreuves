import { z } from "zod";

export const fieldSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis."),
  /** Sigle d'affichage (#198, ex. "IRT"), modifiable depuis l'Admin. Cellule vide -> `null`. */
  shortName: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

export const levelSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis."),
});

export const subjectSchema = z.object({
  fieldId: z.uuid("Filière invalide."),
  levelId: z.uuid("Niveau invalide."),
  name: z.string().trim().min(1, "Le nom est requis."),
  /** Option a laquelle rattacher la matiere (#197), `null` pour le tronc commun. */
  optionId: z.preprocess(
    (value) => (value ? value : null),
    z.uuid("Option invalide.").nullable(),
  ),
});

export const optionSchema = z.object({
  fieldId: z.uuid("Filière invalide."),
  name: z.string().trim().min(1, "Le nom est requis."),
});

/**
 * Modification d'une matiere ou d'une option (#64) : seulement le nom, jamais son rattachement
 * (`fieldId`/`levelId`). `exams` stocke `field_id`/`level_id`/`subject_id` independamment, sans
 * contrainte garantissant leur coherence mutuelle : deplacer une matiere ou une option deja
 * utilisee casserait silencieusement les filtres du catalogue pour toutes les epreuves qui la
 * referencent deja. Un mauvais rattachement se corrige en desactivant puis en recreant.
 */
export const referentialRenameSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis."),
});
