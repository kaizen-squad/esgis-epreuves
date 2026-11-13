import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase pour un script Node autonome (#21), hors contexte de requete Next : pas de
 * cookies (contrairement a `server.ts`/`client.ts`), l'appelant gere lui-meme la session via
 * `auth.signInWithPassword` quand une ecriture protegee par la RLS est necessaire.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
