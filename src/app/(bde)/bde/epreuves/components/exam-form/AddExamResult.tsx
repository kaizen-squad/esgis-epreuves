import Link from "next/link";
import { useEffect, useRef } from "react";
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
      <li className="rounded-control border-success/30 bg-success/10 flex gap-3 border p-3 text-sm">
        <FiCheckCircle className="text-success mt-0.5 shrink-0" size={18} />
        <div className="min-w-0 flex-1">
          <p className="mb-0 truncate font-medium">{entry.file}</p>
          <p className="text-success mb-0">
            Publiée.{" "}
            <ExamPreviewLink
              exam={{ slug: entry.slug, title: "Voir l'épreuve" }}
            />
          </p>
          {entry.warning ? (
            <p className="text-warning mt-1 mb-0">
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
      className={`rounded-control flex gap-3 border p-3 text-sm ${isDuplicate ? "border-warning/30 bg-warning/10" : "border-error/30 bg-error/10"}`}
    >
      {isDuplicate ? (
        <FiCopy className="text-warning mt-0.5 shrink-0" size={18} />
      ) : (
        <FiXCircle className="text-error mt-0.5 shrink-0" size={18} />
      )}
      <div className="min-w-0">
        <p className="mb-0 truncate font-medium">{entry.file}</p>
        <p className={`mb-0 ${isDuplicate ? "text-warning" : "text-error"}`}>
          {entry.message}
        </p>
        {fieldMessages.map((message) => (
          <p key={message} className="text-error mb-0">
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
    ? "text-success"
    : someImported
      ? "text-warning"
      : "text-error";

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
      : `${summary?.imported ?? 0} sur ${summary?.total ?? 0} fichier${(summary?.total ?? 0) > 1 ? "s" : ""} publié${(summary?.total ?? 0) > 1 ? "s" : ""}. Corrigez les fichiers restants puis réessayez.`;

  // Focus sur le resultat a l'arrivee sur cette etape : le formulaire disparait et, sans cela,
  // le focus retombait sur `body` (#171).
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className="flex flex-col items-center gap-4 text-center outline-none"
    >
      {/* Seul ce resumé est annoncé par le lecteur d'écran (#171) : la liste détaillée et les
          actions, verbeuses, restent hors de la région live, consultables normalement. */}
      <div
        role={allImported ? "status" : "alert"}
        className="flex flex-col items-center gap-4"
      >
        <Icon className={iconClass} size={56} aria-hidden="true" />
        <h2 className="text-text-secondary text-2xl font-semibold">{title}</h2>
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
            <Link href="/bde/catalogue" className="btn-secondary">
              Voir le catalogue
            </Link>
            <button type="button" onClick={onRestart} className="btn-primary">
              Verser d&apos;autres épreuves
            </button>
          </>
        ) : (
          <>
            <Link href="/bde/accueil" className="btn-secondary">
              Retour à l&apos;accueil
            </Link>
            <button type="button" onClick={onRetry} className="btn-primary">
              Revenir au formulaire
            </button>
          </>
        )}
      </div>
    </div>
  );
}
