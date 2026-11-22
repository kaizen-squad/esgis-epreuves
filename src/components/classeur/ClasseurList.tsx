"use client";

import Link from "next/link";
import { FiArrowRight, FiX } from "@/components/icons";
import { publicExamPath } from "@/components/layout/spaces";
import { useClasseur } from "@/features/classeur/useClasseur";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

/** Liste des favoris du classeur local (R-11), tries du plus recent au plus ancien. */
export default function ClasseurList() {
  const { state, toggleFavorite } = useClasseur();
  const favorites = Object.values(state.favorites).sort((a, b) =>
    b.savedAt.localeCompare(a.savedAt),
  );

  if (favorites.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="text-text-paragraph mb-4">
          Aucune épreuve en favori pour l&apos;instant.
        </p>
        <Link
          href="/catalogue"
          className="text-text-default inline-flex items-center gap-2 font-medium hover:underline"
        >
          Parcourir le catalogue <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <ul className="mx-auto max-w-2xl divide-y divide-gray-100 px-6">
      {favorites.map((favorite) => (
        <li
          key={favorite.slug}
          className="flex items-center justify-between gap-4 py-4"
        >
          <div className="min-w-0">
            <Link
              href={publicExamPath(favorite.slug)}
              className="text-text-default block truncate font-medium hover:underline"
            >
              {favorite.title}
            </Link>
            <p className="text-text-paragraph truncate text-sm">
              {favorite.field} · {favorite.subject} · {favorite.academicYear}
            </p>
            {(() => {
              const lastVisit = state.lastVisits[favorite.slug];
              return lastVisit ? (
                <p className="text-text-paragraph text-xs">
                  Consultée le {dateFormat.format(new Date(lastVisit))}
                </p>
              ) : null;
            })()}
          </div>
          <button
            type="button"
            aria-label={`Retirer ${favorite.title} du classeur`}
            onClick={() => toggleFavorite(favorite)}
            className="text-text-paragraph flex-shrink-0 cursor-pointer rounded-full p-2 hover:bg-gray-100"
          >
            <FiX size={18} />
          </button>
        </li>
      ))}
    </ul>
  );
}
