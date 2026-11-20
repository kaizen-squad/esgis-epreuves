import { getDomainExams } from "@/features/exams/actions";
import { getFields } from "@/features/referentials/queries";
import { FiArrowRight } from "react-icons/fi";
import DomainFilterContent from "@/components/exams/DomainFilterContent";
import Link from "next/link";

export function DomainFilterSkeleton() {
  return (
    <div className="mx-auto mb-30 w-full max-w-7xl">
      <div className="section-title mx-auto h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="my-10 flex justify-center gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-28 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
      <div className="mb-4 grid grid-cols-1 justify-center gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    </div>
  );
}

export default async function DomainFilter({
  manageable = false,
  catalogueHref = "/catalogue",
}: {
  /** Espace BDE : cartes avec menu de gestion. */
  manageable?: boolean;
  /** Catalogue cible du bouton "Voir le catalogue" (`/bde/catalogue` cote BDE). */
  catalogueHref?: string;
}) {
  const [fields, exams] = await Promise.all([
    getFields(),
    getDomainExams(null),
  ]);

  return (
    <div className="mx-auto mb-30 w-full max-w-7xl">
      <h3 className="section-title text-center">
        Filtrez par domaine d&apos;activité
      </h3>

      <DomainFilterContent
        fields={fields}
        initialExams={exams}
        manageable={manageable}
      />

      <Link
        href={catalogueHref}
        className="bg-background-accent text-text-primary my-2 ml-auto flex w-fit items-center gap-2 rounded-lg px-3 py-2 font-semibold"
      >
        Voir le catalogue <FiArrowRight />
      </Link>
    </div>
  );
}
