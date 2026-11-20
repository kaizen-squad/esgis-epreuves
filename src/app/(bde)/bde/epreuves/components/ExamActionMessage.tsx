import Link from "next/link";
import type { ActionResult } from "@/lib/action-result";

type ExamRef = { examId: string; slug: string; title: string };

function ExamPreviewLink({ exam }: { exam: ExamRef }) {
  return (
    <Link
      href={`/api/exams/${exam.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold underline"
    >
      {exam.title}
    </Link>
  );
}

/**
 * Retour d'une action d'ecriture sur une epreuve (`ActionResult`) : erreur, doublon bloquant
 * (`duplicate`) ou succes avec avertissement non bloquant (`warning`, meme quadruplet
 * matiere/annee/session/type qu'une autre epreuve).
 */
export default function ExamActionMessage({
  state,
  successMessage,
}: {
  state: ActionResult<{ slug: string }> | null;
  successMessage: string;
}) {
  if (!state) return null;

  if (!state.ok) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        <p>{state.error}</p>
        {"duplicate" in state ? (
          <p className="mt-1">
            Épreuve existante : <ExamPreviewLink exam={state.duplicate} />
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
    >
      <p>{successMessage}</p>
      {state.warning ? (
        <p className="mt-1 text-amber-800">
          Attention : une autre épreuve a la même matière, année, session et
          type : <ExamPreviewLink exam={state.warning} />. Vérifiez qu&apos;il
          ne s&apos;agit pas d&apos;un doublon.
        </p>
      ) : null}
      <Link href="/bde/accueil" className="mt-2 inline-block underline">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
