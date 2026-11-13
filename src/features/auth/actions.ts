"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { actionError, type ActionResult } from "@/lib/action-result";
import { loginSchema } from "./schemas";

/**
 * Connexion BDE/Admin. Pas d'inscription publique (#15) : les comptes sont crees a la main.
 * Signature `(prevState, formData)` pour s'utiliser avec `useActionState` cote ecran (#17),
 * seul moyen d'afficher l'erreur de connexion sans recharger la page. Redirige vers `/admin`
 * en cas de succes ; ne renvoie `ActionResult` qu'en cas d'echec.
 */
export async function login(
  _prevState: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return actionError(
      "Identifiants invalides.",
      z.flattenError(parsed.error).fieldErrors,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.status === 429) {
      return actionError(
        "Trop de tentatives, reessayez dans quelques minutes.",
      );
    }
    return actionError("Email ou mot de passe incorrect.");
  }

  redirect("/admin");
}

/**
 * Deconnecte uniquement la session courante (`scope: "local"`) : un compte BDE est partage
 * par toute l'equipe (decision de #5), une deconnexion ne doit pas affecter les autres postes
 * connectes avec le meme compte.
 */
export async function logout(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/login");
}
