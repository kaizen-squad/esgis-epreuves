import { createClient } from "@/lib/supabase/server";
import type { Field, Level, Subject } from "./types";

/** Filieres, pour le menu "Filieres", l'accueil et les filtres du catalogue. */
export async function getFields(): Promise<Field[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fields")
    .select("id, name")
    .order("name");

  if (error) throw error;

  return data;
}

/** Niveaux (L1 a M2), pour les filtres du catalogue. */
export async function getLevels(): Promise<Level[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("levels")
    .select("id, name")
    .order("name");

  if (error) throw error;

  return data;
}

/** Matieres, pour les filtres du catalogue (combinables avec filiere et niveau). */
export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, field_id, level_id")
    .order("name");

  if (error) throw error;

  return data.map((subject) => ({
    id: subject.id,
    name: subject.name,
    fieldId: subject.field_id,
    levelId: subject.level_id,
  }));
}
