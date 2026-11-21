const UPLOAD_FAILED = "Impossible de deposer le fichier.";
const STORAGE_REFUSED =
  "Le stockage des fichiers a refusé l'envoi (accès R2 non autorisé). Prévenez l'administrateur : la configuration du stockage est à vérifier.";

/**
 * Message affiche quand l'envoi d'un PDF vers R2 echoue. Un refus d'acces (403 : jeton R2 sans
 * droit d'ecriture sur le bucket, mauvais bucket) ne se regle pas en reessayant : on le dit
 * explicitement, plutot que le message generique qui laisse croire a un probleme de fichier.
 */
export function r2UploadErrorMessage(error: unknown): string {
  const { name, $metadata } = (error ?? {}) as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };
  if (
    name === "AccessDenied" ||
    name === "InvalidAccessKeyId" ||
    name === "SignatureDoesNotMatch" ||
    $metadata?.httpStatusCode === 401 ||
    $metadata?.httpStatusCode === 403
  ) {
    return STORAGE_REFUSED;
  }
  return UPLOAD_FAILED;
}
