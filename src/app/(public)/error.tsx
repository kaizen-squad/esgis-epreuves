"use client";

import { useEffect } from "react";

export default function PublicError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="section-title">Une erreur est survenue</h1>
      <p className="text-text-paragraph">
        Impossible de charger cette page pour le moment.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-background-accent rounded-lg px-4 py-2 text-white"
      >
        Réessayer
      </button>
    </div>
  );
}
