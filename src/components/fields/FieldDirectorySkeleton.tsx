import {
  DIRECTORY_GRID_CLASS,
  directoryGridStyle,
} from "@/components/fields/FieldDirectory";

/** Fiches visibles selon la largeur, comme les colonnes de `DIRECTORY_GRID_CLASS` (1, 2, 3, puis 5). */
const VISIBILITY = [
  "block",
  "hidden sm:block",
  "hidden lg:block",
  "hidden xl:block",
];

/** Memes gabarits que `FieldDirectory` (rangees, sigle, fiches) : aucun saut au chargement. */
export default function FieldDirectorySkeleton() {
  return (
    <div className="mx-auto mb-16 max-w-7xl" aria-busy="true">
      <div className="hidden h-12 xl:block" />
      {Array.from({ length: 2 }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className={`py-8 lg:py-10 ${rowIndex === 0 ? "pt-2" : "border-text-secondary/15 border-t"}`}
        >
          <div className="mb-5 h-12 w-48 animate-pulse rounded bg-gray-200 sm:h-14 lg:h-16" />
          <div className={DIRECTORY_GRID_CLASS} style={directoryGridStyle(5)}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`${VISIBILITY[Math.min(index, 3)]} rounded-card h-52 animate-pulse bg-gray-200`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
