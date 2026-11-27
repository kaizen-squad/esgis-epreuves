"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function BdeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="section-title">Une erreur est survenue</h1>
      <p className="text-text-paragraph">
        Impossible de charger cette page pour le moment.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          Réessayer
        </button>
        <Link href="/bde/accueil" className="btn-secondary">
          Retour à l&apos;accueil BDE
        </Link>
      </div>
    </div>
  );
}
