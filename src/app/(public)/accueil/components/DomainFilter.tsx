import { getExams, getFieldExams } from "@/features/exams/queries";
import type { Exam } from "@/features/exams/types";
import { getFields } from "@/features/referentials/queries";
import { FiArrowRight } from "react-icons/fi";
import EpreuveCard from "../../components/EpreuveCard";
import DomainSelectFilter from "../../components/DomainSelectFilter";
import { toEpreuveCardProps } from "./toEpreuveCardProps";

const DOMAIN_EXAMS_LIMIT = 4;

type DomainFilterProps = {
  searchParams: Promise<{ domain?: string | string[] }>;
};

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
        {Array.from({ length: DOMAIN_EXAMS_LIMIT }).map((_, index) => (
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
  searchParams,
}: DomainFilterProps) {
  const [{ domain }, fields] = await Promise.all([searchParams, getFields()]);
  const requestedFieldId = Array.isArray(domain) ? domain[0] : domain;
  const selectedField = requestedFieldId
    ? fields.find((field) => field.id === requestedFieldId)
    : undefined;

  let exams: Exam[];
  if (selectedField) {
    const result = await getFieldExams(selectedField.id, {
      pageSize: DOMAIN_EXAMS_LIMIT,
    });
    exams = result?.exams.exams ?? [];
  } else {
    const result = await getExams({ pageSize: DOMAIN_EXAMS_LIMIT });
    exams = result.exams;
  }

  return (
    <div className="mx-auto mb-30 w-full max-w-7xl">
      <h3 className="section-title text-center">
        Filtrez par domaine d&apos;activité
      </h3>

      <DomainSelectFilter
        fields={fields}
        selectedFieldId={selectedField?.id ?? null}
      />

      {exams.length === 0 ? (
        <p className="text-text-paragraph">
          {selectedField
            ? `Aucune épreuve n'a encore été ajoutée pour ${selectedField.name}.`
            : "Aucune épreuve n'a encore été ajoutée."}
        </p>
      ) : (
        <div className="mb-4 grid grid-cols-1 justify-center gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exams.map((exam) => (
            <EpreuveCard {...toEpreuveCardProps(exam)} key={exam.id} />
          ))}
        </div>
      )}

      <button className="bg-background-accent text-text-primary my-2 ml-auto flex items-center gap-2 rounded-lg px-3 py-2 font-semibold">
        Voir le catalogue <FiArrowRight />
      </button>
    </div>
  );
}
