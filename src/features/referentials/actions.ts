"use server";

import { z } from "zod";
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
  table: string,
  duplicateMessage: string,
  values: Record<string, unknown>,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .insert(values)
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") return actionError(duplicateMessage);
    console.error(`${label}: insertion`, error);
    return actionError("Impossible d'enregistrer.");
  }
  return actionOk({ id: data.id });
}

async function updateReferential(
  label: string,
  table: string,
  id: string,
  duplicateMessage: string,
  values: Record<string, unknown>,
): Promise<ActionResult<null>> {
  if (!ID_SCHEMA.safeParse(id).success) return actionError("Introuvable.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .update(values)
    .eq("id", id)
    .select("id");
  if (error) {
    if (error.code === "23505") return actionError(duplicateMessage);
    console.error(`${label}: mise a jour`, error);
    return actionError("Impossible de modifier.");
  }
  // La RLS *_write_admin refuse un UPDATE non autorise sans jamais lever d'erreur Postgres : USING
  // s'evalue d'abord et renvoie 0 ligne affectee si faux (voir updateExamMetadata, exams/actions.ts,
  // meme principe sur exams_write_bde) ; aucune ligne affectee veut donc dire refus silencieux ou
  // id inexistant, jamais une anomalie a signaler autrement.
  if (!data || data.length === 0) return actionError("Introuvable.");
  return actionOk(null);
}

async function setReferentialActive(
  label: string,
  table: string,
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  if (!ID_SCHEMA.safeParse(id).success) return actionError("Introuvable.");
  if (!IS_ACTIVE_SCHEMA.safeParse(isActive).success) {
    return actionError("Donnees invalides.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .update({ is_active: isActive })
    .eq("id", id)
    .select("id");
  if (error) {
    console.error(`${label}: changement d'etat`, error);
    return actionError("Impossible de changer l'etat.");
  }
  if (!data || data.length === 0) return actionError("Introuvable.");
  return actionOk(null);
}

export async function createField(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = fieldSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return actionError(
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return insertReferential(
    "createField",
    "fields",
    "Cette filiere existe deja.",
    parsed.data,
  );
}

export async function updateField(
  id: string,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = fieldSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return actionError(
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return updateReferential(
    "updateField",
    "fields",
    id,
    "Cette filiere existe deja.",
    parsed.data,
  );
}

export async function setFieldActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  return setReferentialActive("setFieldActive", "fields", id, isActive);
}

export async function createLevel(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = levelSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return actionError(
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return insertReferential(
    "createLevel",
    "levels",
    "Ce niveau existe deja.",
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
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return updateReferential(
    "updateLevel",
    "levels",
    id,
    "Ce niveau existe deja.",
    parsed.data,
  );
}

export async function setLevelActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  return setReferentialActive("setLevelActive", "levels", id, isActive);
}

export async function createSubject(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = subjectSchema.safeParse({
    fieldId: formData.get("fieldId"),
    levelId: formData.get("levelId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return actionError(
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { fieldId, levelId, name } = parsed.data;
  return insertReferential(
    "createSubject",
    "subjects",
    "Cette matiere existe deja pour cette filiere et ce niveau.",
    { field_id: fieldId, level_id: levelId, name },
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
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return updateReferential(
    "updateSubject",
    "subjects",
    id,
    "Cette matiere existe deja pour cette filiere et ce niveau.",
    parsed.data,
  );
}

export async function setSubjectActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  return setReferentialActive("setSubjectActive", "subjects", id, isActive);
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
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  const { fieldId, name } = parsed.data;
  return insertReferential(
    "createOption",
    "options",
    "Cette option existe deja pour cette filiere.",
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
      "Donnees invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }
  return updateReferential(
    "updateOption",
    "options",
    id,
    "Cette option existe deja pour cette filiere.",
    parsed.data,
  );
}

export async function setOptionActive(
  id: string,
  isActive: boolean,
): Promise<ActionResult<null>> {
  return setReferentialActive("setOptionActive", "options", id, isActive);
}
