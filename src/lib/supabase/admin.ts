import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la cle secrete (`SUPABASE_SECRET_KEY`) : contourne la RLS et donne acces a
 * l'API d'administration Auth (creation de comptes). Serveur uniquement, a n'utiliser que depuis
 * une Server Action qui a deja verifie que l'appelant est ADMIN. `null` si la cle n'est pas
 * configuree, pour que l'action renvoie une erreur lisible au lieu de planter.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) return null;

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
