"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { actionError, actionOk, type ActionResult } from "@/lib/action-result";
import {
  fieldSchema,
  levelSchema,
  optionSchema,
  referentialRenameSchema,
  subjectSchema,
} from "./schemas";

const ID_SCHEMA = z.uuid();
const IS_ACTIVE_SCHEMA = z.boolean();

/**
 * CRUD des referentiels geres par l'Admin (#64) : filieres, niveaux, matieres, options. Types
 * d'epreuve et sessions restent des enumerations fixes (`EXAM_TYPES`/`EXAM_SESSIONS`,
 * `exams/schemas.ts`), hors CRUD (decision prise en session, convertir ces enumerations en tables
 * depasserait largement la complexite prevue pour ce ticket).
 *
 * Pas de suppression : `on delete restrict` sur les tables referencees par `exams` l'empeche deja
 * pour un referentiel utilise, et le ticket ne demande que d'ajouter/modifier/desactiver.
 * Desactiver (`is_active`) retire un referentiel des listes publiques (menu, filtres, formulaire
 * de depot) sans toucher aux epreuves qui le referencent deja (migration #64).
 *
 * Trois operations generiques partagees par les quatre referentiels, parametrees par la table et
 * le message de doublon (contrainte `unique` propre a chacune) : insertion, mise a jour,
 * changement d'etat. Ecriture protegee par la RLS admin-only deja posee par #5 (`*_write_admin`),
 * jamais de verification de role dupliquee ici.
 */
async function insertReferential(
  label: string,
  itemLabel: string,
  table: string,
  duplicateMessage: string,
  values: Record<string, unknown>,
  /** Message pour une violation de cle etrangere (23503), ex. une option d'une autre filiere
   * (contrainte composite `subjects_option_id_field_id_fkey`, #197). */
  foreignKeyMessage = "Rattachement invalide.",
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .insert(values)
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return actionError(duplicateMessage);
    if (error.code === "23503") return actionError(foreignKeyMessage);
    console.error(`${label}: insertion`, error);
    return actionError(
      `Impossible d'enregistrer ${itemLabel}. Réessayez dans un instant.`,
    );
  }
  // Un nouveau referentiel actif apparait dans les listes publiques (menu, filtres, formulaire de
  // depot) : les pages publiques en ISR (revalidate=60) ne le verraient sinon qu'apres jusqu'a 60s.
  revalidatePath("/", "layout");
  return actionOk({ id: data.id });
}

async function updateReferential(
  label: string,
  itemLabel: string,
  table: string,
  id: string,
  duplicateMessage: string,
  values: Record<string, unknown>,
): Promise<ActionResult<null>> {
  if (!ID_SCHEMA.safeParse(id).success) {
    return actionError(`Impossible de trouver ${itemLabel}.`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .update(values)
    .eq("id", id)
    .select("id");
  if (error) {
    if (error.code === "23505") return actionError(duplicateMessage);
    console.error(`${label}: mise a jour`, error);
    return actionError(`Impossible de modifier ${itemLabel}.`);
  }
  // La RLS *_write_admin refuse un UPDATE non autorise sans jamais lever d'erreur Postgres : USING
  // s'evalue d'abord et renvoie 0 ligne affectee si faux (voir updateExamMetadata, exams/actions.ts,
  // meme principe sur exams_write_bde) ; aucune ligne affectee veut donc dire refus silencieux ou
  // id inexistant, jamais une anomalie a signaler autrement.
  if (!data || data.length === 0) {
    return actionError(`Impossible de trouver ${itemLabel}.`);
  }
  // Le nom modifie apparait dans les listes publiques : voir le commentaire d'insertReferential.
  revalidatePath("/", "layout");
  return actionOk(null);
}

async function setReferentialActive(
  label: string,
  itemLabel: string,
  table: string,
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  if (!ID_SCHEMA.safeParse(id).success) {
    return actionError(`Impossible de trouver ${itemLabel}.`);
  }
  if (!IS_ACTIVE_SCHEMA.safeParse(isActive).success) {
    return actionError("Données invalides.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .update({ is_active: isActive })
    .eq("id", id)
    .select("id");
  if (error) {
    console.error(`${label}: changement d'etat`, error);
    return actionError(
      `Impossible de changer l'état de ${itemLabel}. Réessayez dans un instant.`,
    );
  }
  if (!data || data.length === 0) {
    return actionError(`Impossible de trouver ${itemLabel}.`);
  }
  // Desactiver/reactiver change ce qui apparait dans les listes publiques : voir le commentaire
  // d'insertReferential.
  revalidatePath("/", "layout");
  return actionOk(null);
}

export async function createField(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = fieldSchema.safeParse({
    name: formData.get("name"),
    shortName: formData.get("shortName") || undefined,
  });
  if (!parsed.success) {
    return actionError(
      "Données invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return insertReferential(
    "createField",
    "cette filière",
    "fields",
    "Cette filière existe déjà.",
    { name: parsed.data.name, short_name: parsed.data.shortName },
  );
}

export async function updateField(
  id: string,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = fieldSchema.safeParse({
    name: formData.get("name"),
    shortName: formData.get("shortName") || undefined,
  });
  if (!parsed.success) {
    return actionError(
      "Données invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  // `short_name` (#198) n'est ecrit que si le formulaire l'a reellement envoye : l'ecran Admin
  // actuel (#200, pas encore livre) n'a qu'un champ "name", et un renommage de filiere ne doit
  // jamais effacer silencieusement son sigle faute d'un champ absent du formulaire.
  const values: Record<string, unknown> = { name: parsed.data.name };
  if (formData.has("shortName")) values.short_name = parsed.data.shortName;
  return updateReferential(
    "updateField",
    "cette filière",
    "fields",
    id,
    "Cette filière existe déjà.",
    values,
  );
}

export async function setFieldActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  return setReferentialActive(
    "setFieldActive",
    "cette filière",
    "fields",
    id,
    isActive,
  );
}

export async function createLevel(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = levelSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return actionError(
      "Données invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return insertReferential(
    "createLevel",
    "ce niveau",
    "levels",
    "Ce niveau existe déjà.",
    parsed.data,
  );
}

export async function updateLevel(
  id: string,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = levelSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return actionError(
      "Données invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return updateReferential(
    "updateLevel",
    "ce niveau",
    "levels",
    id,
    "Ce niveau existe déjà.",
    parsed.data,
  );
}

export async function setLevelActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  return setReferentialActive(
    "setLevelActive",
    "ce niveau",
    "levels",
    id,
    isActive,
  );
}

export async function createSubject(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = subjectSchema.safeParse({
    fieldId: formData.get("fieldId"),
    levelId: formData.get("levelId"),
    name: formData.get("name"),
    optionId: formData.get("optionId"),
  });
  if (!parsed.success) {
    return actionError(
      "Données invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { fieldId, levelId, name, optionId } = parsed.data;
  return insertReferential(
    "createSubject",
    "cette matière",
    "subjects",
    "Cette matière existe déjà pour cette filière, ce niveau et cette option.",
    { field_id: fieldId, level_id: levelId, name, option_id: optionId },
    "Cette option n'appartient pas à la filière choisie.",
  );
}

export async function updateSubject(
  id: string,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = referentialRenameSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return actionError(
      "Données invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return updateReferential(
    "updateSubject",
    "cette matière",
    "subjects",
    id,
    "Cette matière existe déjà pour cette filière, ce niveau et cette option.",
    parsed.data,
  );
}

export async function setSubjectActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  return setReferentialActive(
    "setSubjectActive",
    "cette matière",
    "subjects",
    id,
    isActive,
  );
}

export async function createOption(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = optionSchema.safeParse({
    fieldId: formData.get("fieldId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return actionError(
      "Données invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { fieldId, name } = parsed.data;
  return insertReferential(
    "createOption",
    "cette option",
    "options",
    "Cette option existe déjà pour cette filière.",
    { field_id: fieldId, name },
  );
}

export async function updateOption(
  id: string,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = referentialRenameSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return actionError(
      "Données invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return updateReferential(
    "updateOption",
    "cette option",
    "options",
    id,
    "Cette option existe déjà pour cette filière.",
    parsed.data,
  );
}

export async function setOptionActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  return setReferentialActive(
    "setOptionActive",
    "cette option",
    "options",
    id,
    isActive,
  );
}
