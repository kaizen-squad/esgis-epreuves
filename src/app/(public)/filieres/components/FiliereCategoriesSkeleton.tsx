export default function FiliereCategoriesSkeleton() {
  return (
    <div className="mx-auto mb-10 max-w-7xl px-6" aria-busy="true">
      {Array.from({ length: 2 }).map((_, categoryIndex) => (
        <div key={categoryIndex} className="mb-6">
          <div className="mb-2 h-9 w-80 max-w-full animate-pulse rounded bg-gray-200" />
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`${index > 0 ? "hidden md:block" : "block"} aspect-square w-full animate-pulse rounded-xl bg-gray-200`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
