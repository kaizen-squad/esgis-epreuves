import type { ExamCardProps } from "@/components/exams/ExamCard";
import CatalogueEpreuves from "../../catalogue/components/CatalogueEpreuve";
import DomainSelectFilter from "@/components/exams/DomainSelectFilter";
import type { CatalogueFilterOptions } from "../../utils/catalogueFilters";

type FiliereCatalogueSectionProps = {
  exams: ExamCardProps[];
  total: number;
  filterOptions: CatalogueFilterOptions;
};

const FiliereCatalogueSection = ({
  exams,
  total,
  filterOptions,
}: FiliereCatalogueSectionProps) => {
  return (
    <section className="mx-auto mb-20 w-full max-w-7xl px-4 lg:px-6">
      <DomainSelectFilter />
      <CatalogueEpreuves
        data={exams}
        total={total}
        filterOptions={filterOptions}
      />
    </section>
  );
};

export default FiliereCatalogueSection;
