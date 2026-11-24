import {
  GRID_CLASS,
  HOME_CARDS_LIMIT,
  TRAY_CLASS,
  cardVisibilityClass,
} from "@/components/fields/filieresLayout";

/** Memes gabarits que `Filieres` (logement, intercalaires, poignee) : aucun saut au chargement. */
export default function FilieresSkeleton() {
  return (
    <div className="mx-auto mb-30 max-w-7xl" aria-busy="true">
      <div className="section-title mx-auto mb-4 h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className={TRAY_CLASS}>
        <div className={GRID_CLASS}>
          {Array.from({ length: HOME_CARDS_LIMIT }).map((_, index) => (
            <div
              key={index}
              className={`${cardVisibilityClass(index)} rounded-card h-20 animate-pulse bg-gray-200`}
            />
          ))}
        </div>
      </div>
      <div className="rounded-control mx-auto -mt-5 h-11 w-64 animate-pulse bg-gray-300" />
    </div>
  );
}
