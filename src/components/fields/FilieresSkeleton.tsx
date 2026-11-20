import {
  GRID_CLASS,
  HOME_CARDS_LIMIT,
  cardVisibilityClass,
} from "@/components/fields/filieresLayout";

export default function FilieresSkeleton() {
  return (
    <div className="mx-auto mb-30 max-w-7xl" aria-busy="true">
      <div className="section-title mx-auto h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className={GRID_CLASS}>
        {Array.from({ length: HOME_CARDS_LIMIT }).map((_, index) => (
          <div
            key={index}
            className={`${cardVisibilityClass(index)} aspect-square w-full animate-pulse rounded-xl bg-gray-200`}
          />
        ))}
      </div>
      <div className="ml-auto h-10 w-52 animate-pulse rounded-lg bg-gray-200" />
    </div>
  );
}
