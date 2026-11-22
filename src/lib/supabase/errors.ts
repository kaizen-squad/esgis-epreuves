type DbError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

/** Ecriture refusee par une politique RLS (INSERT, ou UPDATE via WITH CHECK). */
const RLS_REFUSED = "42501";

const NOT_BDE =
  "Votre compte n'a pas le droit de déposer des épreuves : il faut un compte BDE actif. Reconnectez-vous avec un compte BDE, ou contactez l'administrateur.";

/**
 * Erreur Supabase en une ligne. A journaliser sous cette forme : c'est un objet simple, que le
 * journal de developpement de Next reduit a `{}`.
 */
export function describeDbError(error: DbError): string {
  const extra = [error.details, error.hint].filter(Boolean).join(" ; ");
  return `[${error.code || "sans code"}] ${error.message || "sans message"}${extra ? ` (${extra})` : ""}`;
}

/**
 * Message affiche quand l'insertion d'une epreuve echoue. Un refus de la RLS (compte ADMIN,
 * desactive ou sans profil) ne se regle pas en reessayant : on le dit explicitement.
 */
export function examInsertErrorMessage(error: DbError): string {
  return error.code === RLS_REFUSED
    ? NOT_BDE
    : "Impossible d'enregistrer l'epreuve.";
}
