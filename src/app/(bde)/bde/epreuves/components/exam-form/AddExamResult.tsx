import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCopy,
  FiXCircle,
} from "react-icons/fi";
import type {
  ExamBatchEntryResult,
  ExamBatchReport,
} from "@/features/exams/actions";
import type { ActionResult } from "@/lib/action-result";
import ExamPreviewLink from "./ExamPreviewLink";

function EntryRow({ entry }: { entry: ExamBatchEntryResult }) {
  if (entry.status === "imported") {
    return (
      <li className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
        <FiCheckCircle className="mt-0.5 shrink-0 text-green-700" size={18} />
        <div className="min-w-0 flex-1">
          <p className="mb-0 truncate font-medium">{entry.file}</p>
          <p className="mb-0 text-green-800">
            Publiée.{" "}
            <ExamPreviewLink
              exam={{ slug: entry.slug, title: "Voir l'épreuve" }}
            />
          </p>
          {entry.warning ? (
            <p className="mt-1 mb-0 text-amber-800">
              Une autre épreuve a la même matière, année, session et type :{" "}
              <ExamPreviewLink exam={entry.warning} />. Vérifiez qu&apos;il ne
              s&apos;agit pas d&apos;un doublon.
            </p>
          ) : null}
        </div>
      </li>
    );
  }

  const isDuplicate = entry.status === "duplicate";
  const fieldMessages =
    entry.status === "error" && entry.fieldErrors
      ? Object.values(entry.fieldErrors).flat()
      : [];

  return (
    <li
      className={`flex gap-3 rounded-lg border p-3 text-sm ${isDuplicate ? "border-amber-200 bg-amber-50" : "border-red-200 bg-red-50"}`}
    >
      {isDuplicate ? (
        <FiCopy className="mt-0.5 shrink-0 text-amber-700" size={18} />
      ) : (
        <FiXCircle className="mt-0.5 shrink-0 text-red-700" size={18} />
      )}
      <div className="min-w-0">
        <p className="mb-0 truncate font-medium">{entry.file}</p>
        <p
          className={`mb-0 ${isDuplicate ? "text-amber-800" : "text-red-700"}`}
        >
          {entry.message}
        </p>
        {fieldMessages.map((message) => (
          <p key={message} className="mb-0 text-red-700">
            {message}
          </p>
        ))}
        {isDuplicate && entry.existing ? (
          <p className="mt-1 mb-0">
            Épreuve existante : <ExamPreviewLink exam={entry.existing} />
          </p>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Derniere etape : succes (tout le lot publie) ou echec (requete refusee, ou au moins un fichier
 * non publie), avec le detail fichier par fichier renvoye par `uploadExamsBatch`.
 */
export default function AddExamResult({
  result,
  onRetry,
  onRestart,
}: {
  result: ActionResult<ExamBatchReport>;
  /** Revenir au formulaire en gardant les donnees (et seulement les fichiers non publies). */
  onRetry: () => void;
  /** Repartir d'un formulaire vide. */
  onRestart: () => void;
}) {
  const summary = result.ok ? result.data.summary : null;
  const allImported = summary !== null && summary.imported === summary.total;
  const someImported = summary !== null && summary.imported > 0;

  const Icon = allImported
    ? FiCheckCircle
    : someImported
      ? FiAlertTriangle
      : FiXCircle;
  const iconClass = allImported
    ? "text-green-600"
    : someImported
      ? "text-amber-600"
      : "text-red-600";

  const title = allImported
    ? summary.total > 1
      ? "Épreuves publiées"
      : "Épreuve publiée"
    : someImported
      ? "Publication partielle"
      : "Échec de la publication";

  const description = !result.ok
    ? result.error
    : allImported
      ? summary.total > 1
        ? `Les ${summary.total} épreuves sont désormais disponibles dans le catalogue.`
        : "L'épreuve est désormais disponible dans le catalogue."
      : `${summary?.imported ?? 0} sur ${summary?.total ?? 0} fichier(s) publié(s). Corrigez les fichiers restants puis réessayez.`;

  // Focus sur le resultat a l'arrivee sur cette etape : le formulaire disparait et, sans cela,
  // le focus retombait sur `body` (#171). `aria-labelledby` plutot qu'un `role="alert"/"status"`
  // en plus du focus (revue de code, #171, apres coup) : les deux auraient annonce le resume en
  // double, un live region deja rempli a l'insertion n'etant d'ailleurs pas garanti d'etre lu.
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      aria-labelledby={titleId}
      className="flex flex-col items-center gap-4 text-center outline-none"
    >
      <div className="flex flex-col items-center gap-4">
        <Icon className={iconClass} size={56} aria-hidden="true" />
        <h3 id={titleId} className="text-text-secondary text-2xl font-semibold">
          {title}
        </h3>
        <p className="text-text-paragraph mb-2 max-w-lg">{description}</p>
      </div>

      {result.ok ? (
        <ul className="flex w-full flex-col gap-2 text-left">
          {result.data.entries.map((entry, index) => (
            <EntryRow key={`${index}-${entry.file}`} entry={entry} />
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {allImported ? (
          <>
            <Link
              href="/bde/catalogue"
              className="flex items-center rounded-lg border border-black px-4 py-2"
            >
              Voir le catalogue
            </Link>
            <button
              type="button"
              onClick={onRestart}
              className="bg-background-accent text-text-primary cursor-pointer rounded-lg px-4 py-2"
            >
              Ajouter d&apos;autres épreuves
            </button>
          </>
        ) : (
          <>
            <Link
              href="/bde/accueil"
              className="flex items-center rounded-lg border border-black px-4 py-2"
            >
              Retour à l&apos;accueil
            </Link>
            <button
              type="button"
              onClick={onRetry}
              className="bg-background-accent text-text-primary cursor-pointer rounded-lg px-4 py-2"
            >
              Revenir au formulaire
            </button>
          </>
        )}
      </div>
    </div>
  );
}
