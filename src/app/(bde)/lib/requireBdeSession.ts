import { cache } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfileStatus } from "@/features/members/queries";

/**
 * Garde de l'espace BDE (#164) : sans session, renvoie vers /login ; une session ADMIN est
 * renvoyee vers son propre espace (les deux restent strictement separes, meme en lecture) ; un
 * compte BDE desactive est renvoye vers /login immediatement, sans attendre l'expiration de son
 * jeton (jusqu'a ~1h) pendant laquelle il voyait l'interface mais echouait en silence a chaque
 * ecriture (RLS). Appelee par le layout `(bde)` et par chaque page : Next ne reexecute pas un
 * layout entre deux pages qui le partagent, la page reverifie donc a chaque rendu. Memoisee par
 * requete (`cache`). La RLS reste le vrai verrou des ecritures.
 */
export const requireBdeSession = cache(async (): Promise<void> => {
  const status = await getCurrentProfileStatus();
  if (!status) redirect("/login");
  if (status.role === "ADMIN") redirect("/admin");
  if (!status.isActive) redirect("/login");
});
