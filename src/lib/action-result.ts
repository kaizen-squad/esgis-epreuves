/** Forme unique de retour pour toute Server Action du projet (pas d'API REST, donc pas de code HTTP). */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }
  | {
      ok: false;
      error: string;
      duplicate: { examId: string; slug: string; title: string };
    };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionError<T>(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<T> {
  return fieldErrors ? { ok: false, error, fieldErrors } : { ok: false, error };
}

export function actionDuplicateWarning<T>(
  error: string,
  duplicate: { examId: string; slug: string; title: string },
): ActionResult<T> {
  return { ok: false, error, duplicate };
}
