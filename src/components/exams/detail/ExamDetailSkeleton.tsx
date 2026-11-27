/** Rendu pendant la verification du fichier sur R2 (`examFileExists`) : evite que la fiche
 * reste figee sans aucun retour visuel. Memes proportions que `ExamDetailView`. */
export default function ExamDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 lg:px-6">
      <div className="mb-6 h-5 w-40 rounded bg-gray-200" />

      <div className="mb-8">
        <div className="mb-3 h-5 w-32 rounded-full bg-gray-200" />
        <div className="mb-2 h-9 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-card h-[75vh] min-h-[32rem] bg-gray-200" />
        <div className="rounded-card flex flex-col gap-6 border border-gray-200 p-6">
          <div className="rounded-control h-12 bg-gray-200" />
          <div className="rounded-control h-10 bg-gray-200" />
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-4 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
