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
  // Statut avant role : un compte desactive doit toujours finir sur /login, y compris un ADMIN
  // (jamais desactive par l'app aujourd'hui, mais rien ne l'empeche en base). Teste role en
  // premier bouclerait /admin <-> /bde pour ce cas, la page de connexion ne consultant que le
  // meme statut pour decider ou l'envoyer.
  if (!status || !status.isActive) redirect("/login");
  if (status.role === "ADMIN") redirect("/admin");
});
