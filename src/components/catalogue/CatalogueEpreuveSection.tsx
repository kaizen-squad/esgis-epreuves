import { getExams } from "@/features/exams/queries";
import {
  getFields,
  getLevels,
  getSubjects,
} from "@/features/referentials/queries";
import CatalogueEpreuves from "@/components/catalogue/CatalogueEpreuve";
import { toExamCardProps } from "@/components/exams/toExamCardProps";
import {
  toExamFilters,
  type CatalogueSearchParams,
} from "@/components/exams/catalogueFilters";

const CatalogueEpreuveSection = async ({
  searchParams,
  manageable = false,
}: {
  searchParams: CatalogueSearchParams;
  /** Espace BDE : cartes avec menu de gestion. */
  manageable?: boolean;
}) => {
  const [result, fields, levels, subjects] = await Promise.all([
    getExams(toExamFilters(searchParams)),
    getFields(),
    getLevels(),
    getSubjects(),
  ]);

  return (
    <section className="mx-auto mb-20 w-full max-w-7xl px-4 lg:px-6">
      <CatalogueEpreuves
        data={result.exams.map(toExamCardProps)}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        filterOptions={{ fields, levels, subjects }}
        manageable={manageable}
      />
    </section>
  );
};

export default CatalogueEpreuveSection;
