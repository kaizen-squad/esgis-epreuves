import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Garde de l'espace BDE : sans session Supabase valide, renvoie vers /login. Appelee par le
 * layout `(bde)` et par chaque page : Next ne reexecute pas un layout lors d'une navigation
 * entre deux pages qui le partagent, la page reverifie donc a chaque rendu. Memoisee par
 * requete (`cache`) pour ne lire la session qu'une fois quand layout et page s'executent
 * ensemble. Ne verifie que la presence d'une session (pas le role) ; complete le proxy
 * (`/bde/:path*`), la RLS restant le vrai verrou des ecritures.
 */
export const requireBdeSession = cache(async (): Promise<void> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) redirect("/login");
});
