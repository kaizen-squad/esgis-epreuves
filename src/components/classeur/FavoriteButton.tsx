"use client";

import { useEffect } from "react";
import { FiStar } from "@/components/icons";
import { useClasseur } from "@/features/classeur/useClasseur";
import type { FavoriteSnapshot } from "@/features/classeur/types";

/**
 * Bascule le favori de cette epreuve dans le classeur local (R-11), et enregistre la visite au
 * montage : l'horodatage de derniere visite se fait au meme endroit, sans composant de plus.
 */
export default function FavoriteButton({
  snapshot,
}: {
  snapshot: FavoriteSnapshot;
}) {
  const { state, toggleFavorite, recordVisit } = useClasseur();
  const isFavorite = Boolean(state.favorites[snapshot.slug]);

  useEffect(() => {
    recordVisit(snapshot.slug);
  }, [recordVisit, snapshot.slug]);

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      onClick={() => toggleFavorite(snapshot)}
      className="text-text-default flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-medium transition-colors hover:bg-gray-50"
    >
      <FiStar
        size={18}
        className={isFavorite ? "fill-current text-amber-500" : undefined}
      />
      {isFavorite ? "Retirer du classeur" : "Ajouter au classeur"}
    </button>
  );
}
