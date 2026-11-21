import type { ExamCardProps } from "@/components/exams/ExamCard";
import CatalogueEpreuves from "@/components/catalogue/CatalogueEpreuve";
import DomainSelectFilter from "@/components/exams/DomainSelectFilter";
import type { CatalogueFilterOptions } from "@/components/exams/catalogueFilters";

type FiliereCatalogueSectionProps = {
  exams: ExamCardProps[];
  total: number;
  page: number;
  pageSize: number;
  filterOptions: CatalogueFilterOptions;
};

const FiliereCatalogueSection = ({
  exams,
  total,
  page,
  pageSize,
  filterOptions,
}: FiliereCatalogueSectionProps) => {
  return (
    <section className="mx-auto mb-20 w-full max-w-7xl px-4 lg:px-6">
      <DomainSelectFilter />
      <CatalogueEpreuves
        data={exams}
        total={total}
        page={page}
        pageSize={pageSize}
        filterOptions={filterOptions}
      />
    </section>
  );
};

export default FiliereCatalogueSection;
