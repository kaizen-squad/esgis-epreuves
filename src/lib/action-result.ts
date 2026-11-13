/** Forme unique de retour pour toute Server Action du projet (pas d'API REST, donc pas de code HTTP). */
export type ActionResult<T> =
  | {
      ok: true;
      data: T;
      warning?: { examId: string; slug: string; title: string };
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  | {
      ok: false;
      error: string;
      duplicate: { examId: string; slug: string; title: string };
    };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

/** Succes avec avertissement non bloquant (ex. doublon probable mais pas certain, #19) : l'ecriture a bien eu lieu. */
export function actionOkWithWarning<T>(
  data: T,
  warning: { examId: string; slug: string; title: string },
): ActionResult<T> {
  return { ok: true, data, warning };
}

export function actionError<T>(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<T> {
  return fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error };
}

/** Echec bloquant : l'ecriture n'a pas eu lieu, le doublon detecte empeche l'effet de bord. */
export function actionDuplicateWarning<T>(
  error: string,
  duplicate: { examId: string; slug: string; title: string },
): ActionResult<T> {
  return { ok: false, error, duplicate };
}
