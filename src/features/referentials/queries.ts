import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Field, Level, Subject } from "./types";

const FIELD_SELECT = "id, name, description";

/** Filieres, pour le menu "Filieres", l'accueil et les filtres du catalogue. */
export async function getFields(): Promise<Field[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fields")
    .select(FIELD_SELECT)
    .order("name");

  if (error) throw error;

  return data;
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
