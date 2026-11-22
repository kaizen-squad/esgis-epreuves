"use client";

import { useCatalogueFilters } from "@/components/exams/useCatalogueFilters";
import type { Level } from "@/features/referentials/types";

/**
 * Onglets de niveau de la page d'une filiere (R-14), a la place des pastilles de domaine
 * inertes : chaque onglet filtre reellement le catalogue affiche en dessous (`levelId`).
 */
export default function FieldLevelTabs({ levels }: { levels: Level[] }) {
  const filters = useCatalogueFilters();
  const levelId = filters.get("levelId");

  return (
    <div
      role="tablist"
      aria-label="Niveau"
      className="my-6 flex w-full max-w-full gap-2 overflow-x-auto md:mx-auto md:w-fit"
    >
      <button
        type="button"
        role="tab"
        aria-selected={levelId === null}
        onClick={() => filters.set("levelId", null)}
        className={`rounded-full border border-gray-400 px-3 py-2 whitespace-nowrap ${levelId === null ? "bg-background-accent text-text-primary" : ""}`}
      >
        Tous les niveaux
      </button>
      {levels.map((level) => (
        <button
          key={level.id}
          type="button"
          role="tab"
          aria-selected={levelId === level.id}
          onClick={() => filters.toggle("levelId", level.id)}
          className={`rounded-full border border-gray-400 px-3 py-2 whitespace-nowrap ${levelId === level.id ? "bg-background-accent text-text-primary" : ""}`}
        >
          {level.name}
        </button>
      ))}
    </div>
  );
}
