import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Field, Level, Option, Subject } from "./types";

const FIELD_SELECT = "id, name, description, is_active";
const LEVEL_SELECT = "id, name, is_active";
const SUBJECT_SELECT = "id, name, field_id, level_id, is_active";
const OPTION_SELECT = "id, name, field_id, is_active";

type ListOptions = {
  /** Admin seulement (#64) : inclut aussi les referentiels desactives. Par defaut, les listes
   * publiques (menu, filtres) n'affichent que les referentiels actifs. */
  includeInactive?: boolean;
};

/** Filieres, pour le menu "Filieres", l'accueil et les filtres du catalogue (actives uniquement,
 * sauf `includeInactive` pour l'ecran Admin, #64). */
export async function getFields(options: ListOptions = {}): Promise<Field[]> {
  const supabase = await createClient();
  let query = supabase.from("fields").select(FIELD_SELECT).order("name");
  if (!options.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;

  if (error) throw error;

  return data.map((field) => ({
    id: field.id,
    name: field.name,
    description: field.description,
    isActive: field.is_active,
  }));
}

/** Filiere par id, pour sa page dediee (#53). `null` si absente ou si l'id n'est pas un uuid, pour laisser la page faire notFound(). */
export async function getFieldById(id: string): Promise<Field | null> {
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fields")
    .select(FIELD_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isActive: data.is_active,
  };
}

/** Niveau par id, pour le titre de la page d'une filiere filtree sur un niveau. `null` si absent ou si l'id n'est pas un uuid. */
export async function getLevelById(id: string): Promise<Level | null> {
  if (!z.uuid().safeParse(id).success) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("levels")
    .select(LEVEL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return { id: data.id, name: data.name, isActive: data.is_active };
}

/** Niveaux (L1 a M2), pour les filtres du catalogue (actifs uniquement, sauf `includeInactive`). */
export async function getLevels(options: ListOptions = {}): Promise<Level[]> {
  const supabase = await createClient();
  let query = supabase.from("levels").select(LEVEL_SELECT).order("name");
  if (!options.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;

  if (error) throw error;

  return data.map((level) => ({
    id: level.id,
    name: level.name,
    isActive: level.is_active,
  }));
}

/** Matieres, pour les filtres du catalogue (combinables avec filiere et niveau, actives uniquement sauf `includeInactive`). */
export async function getSubjects(
  options: ListOptions = {},
): Promise<Subject[]> {
  const supabase = await createClient();
  let query = supabase.from("subjects").select(SUBJECT_SELECT).order("name");
  if (!options.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;

  if (error) throw error;

  return data.map((subject) => ({
    id: subject.id,
    name: subject.name,
    fieldId: subject.field_id,
    levelId: subject.level_id,
    isActive: subject.is_active,
  }));
}

/** `max_rows` de PostgREST (`supabase/config.toml`) : une page de `getExamCountsByColumn` au-dela
 * de cette taille serait tronquee sans erreur. */
const POSTGREST_MAX_ROWS = 1000;

/** Nombre d'epreuves rattachees a chaque filiere, niveau, matiere ou option, pour annoncer
 * l'impact d'une desactivation dans l'Admin (#168). Un SELECT de la colonne, page par page
 * (`POSTGREST_MAX_ROWS` a la fois) : le volume d'epreuves reste trop faible pour justifier un
 * COUNT par ligne cote serveur, mais une seule page tronquerait silencieusement le compte au-dela
 * de `max_rows`. */
export async function getExamCountsByColumn(
  column: "field_id" | "level_id" | "subject_id" | "option_id",
): Promise<Record<string, number>> {
  const supabase = await createClient();
  const counts: Record<string, number> = {};

  for (let from = 0; ; from += POSTGREST_MAX_ROWS) {
    const { data, error } = await supabase
      .from("exams")
      .select(column)
      .range(from, from + POSTGREST_MAX_ROWS - 1);
    if (error) throw error;

    for (const row of data as Record<string, string | null>[]) {
      const id = row[column];
      if (!id) continue;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    if (data.length < POSTGREST_MAX_ROWS) break;
  }

  return counts;
}

/** Options de specialisation, pour le formulaire de depot/edition d'epreuve (actives uniquement sauf `includeInactive`, #64). */
export async function getOptions(options: ListOptions = {}): Promise<Option[]> {
  const supabase = await createClient();
  let query = supabase.from("options").select(OPTION_SELECT).order("name");
  if (!options.includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;

  if (error) throw error;

  return data.map((option) => ({
    id: option.id,
    name: option.name,
    fieldId: option.field_id,
    isActive: option.is_active,
  }));
}
