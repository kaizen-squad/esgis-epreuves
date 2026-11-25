import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { BDE_BASE_PATH, examHref } from "@/components/layout/spaces";
import type { ActionResult } from "@/lib/action-result";
import ExamPreviewLink from "./ExamPreviewLink";

/**
 * Derniere etape d'une mise a jour d'epreuve (donnees ou fichier) : succes, avec avertissement
 * eventuel de doublon probable, ou echec (refus, doublon bloquant, erreur serveur). Forme de
 * retour commune a `updateExamMetadata` et `replaceExamFile`.
 */
export default function ExamUpdateResult({
  result,
  successTitle,
  failureTitle,
  successMessage,
  againLabel,
  onRetry,
}: {
  result: ActionResult<{ slug: string }>;
  successTitle: string;
  failureTitle: string;
  /** Recoit le slug de l'epreuve mise a jour. */
  successMessage: (slug: string) => ReactNode;
  /** Libelle du bouton qui rouvre le formulaire apres un succes. */
  againLabel: string;
  /** Revenir au formulaire en gardant les donnees saisies. */
  onRetry: () => void;
}) {
  const Icon = result.ok ? FiCheckCircle : FiXCircle;

  // Focus sur le resultat a l'arrivee sur cette etape (#171, meme raison qu'AddExamResult).
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
      {/* Seul ce resumé est annoncé par le lecteur d'écran (#171), pas le detail ni les actions. */}
      <div
        role={result.ok ? "status" : "alert"}
        className="flex flex-col items-center gap-4"
      >
        <Icon
          className={result.ok ? "text-green-600" : "text-red-600"}
          size={56}
          aria-hidden="true"
        />
        <h2 className="text-text-secondary text-2xl font-semibold">
          {result.ok ? successTitle : failureTitle}
        </h2>
        <p className="text-text-paragraph mb-0 max-w-lg">
          {result.ok ? successMessage(result.data.slug) : result.error}
        </p>
      </div>

      {result.ok ? (
        result.warning ? (
          <p className="mb-0 max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Attention : une autre épreuve a la même matière, année, session et
            type : <ExamPreviewLink exam={result.warning} />. Vérifiez
            qu&apos;il ne s&apos;agit pas d&apos;un doublon.
          </p>
        ) : null
      ) : (
        <>
          {"duplicate" in result ? (
            <p className="mb-0 text-sm">
              Épreuve existante : <ExamPreviewLink exam={result.duplicate} />
            </p>
          ) : null}
          {"fieldErrors" in result && result.fieldErrors ? (
            <ul className="text-sm text-red-700">
              {Object.values(result.fieldErrors)
                .flat()
                .map((message) => (
                  <li key={message}>{message}</li>
                ))}
            </ul>
          ) : null}
        </>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {result.ok ? (
          <>
            <Link
              href={examHref(BDE_BASE_PATH, result.data.slug)}
              className="flex items-center rounded-lg border border-black px-4 py-2"
            >
              Voir l&apos;épreuve
            </Link>
            <button
              type="button"
              onClick={onRetry}
              className="bg-background-accent text-text-primary cursor-pointer rounded-lg px-4 py-2"
            >
              {againLabel}
            </button>
          </>
        ) : (
          <>
            <Link
              href="/bde/catalogue"
              className="flex items-center rounded-lg border border-black px-4 py-2"
            >
              Retour au catalogue
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
