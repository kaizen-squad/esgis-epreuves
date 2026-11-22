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
 * (compte ADMIN) ou `/bde/accueil` (compte BDE) en cas de succes ; ne renvoie `ActionResult`
 * qu'en cas d'echec.
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
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    const firstMessage =
      fieldErrors.email?.[0] ??
      fieldErrors.password?.[0] ??
      "Identifiants invalides.";
    return actionError(firstMessage, fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.status === 429) {
      return actionError(
        "Trop de tentatives, reessayez dans quelques minutes.",
      );
    }
    // Compte desactive par l'Admin (bannissement Auth). Supabase ne renvoie `user_banned` qu'apres
    // avoir verifie le mot de passe : le message ne revele donc rien a qui ne le connait pas.
    if (error.code === "user_banned") {
      return actionError(
        "Ce compte est désactivé. Contactez l'administrateur.",
      );
    }
    return actionError("Email ou mot de passe incorrect.");
  }

  // `profiles` n'est lisible que par un ADMIN : un compte BDE ne lit aucune ligne et reste sur
  // l'espace BDE.
  const { data: profile } = data?.user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle()
    : { data: null };
  redirect(profile?.role === "ADMIN" ? "/admin" : "/bde/accueil");
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
