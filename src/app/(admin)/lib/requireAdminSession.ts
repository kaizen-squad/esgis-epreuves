import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/features/members/queries";

/**
 * Garde de l'espace Admin : sans session, renvoie vers /login ; une session BDE est renvoyee vers
 * son propre espace. Appelee par le layout `(admin)` et par chaque page (Next ne reexecute pas un
 * layout entre deux pages qui le partagent), memoisee par requete. La RLS reste le vrai verrou
 * des lectures, et chaque action Admin reverifie le role avant d'ecrire.
 */
export const requireAdminSession = cache(async (): Promise<void> => {
  const role = await getCurrentUserRole();
  if (!role) redirect("/login");
  if (role !== "ADMIN") redirect("/bde/accueil");
});
