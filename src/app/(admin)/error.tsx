"use client";

import { useEffect } from "react";

export default function AdminError({
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
      <button
        type="button"
        onClick={reset}
        className="bg-background-accent text-text-primary rounded-control px-4 py-2"
      >
        Réessayer
      </button>
    </div>
  );
}
