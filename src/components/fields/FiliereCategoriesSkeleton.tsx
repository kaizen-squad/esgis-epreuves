import { GRID_CLASS, TRAY_CLASS } from "@/components/fields/filieresLayout";

/** Memes gabarits que `FiliereCategory` (titre, logement, intercalaires) : aucun saut au chargement. */
export default function FiliereCategoriesSkeleton() {
  return (
    <div className="mx-auto mb-10 max-w-7xl px-6" aria-busy="true">
      {Array.from({ length: 2 }).map((_, categoryIndex) => (
        <div key={categoryIndex} className="mb-12">
          <div className="mb-3 h-9 w-80 max-w-full animate-pulse rounded bg-gray-200" />
          <div className={TRAY_CLASS}>
            <div className={GRID_CLASS}>
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`${index > 0 ? "hidden md:block" : "block"} rounded-card mt-10 h-19 animate-pulse bg-gray-200`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
