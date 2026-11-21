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
  /** Espace BDE : cartes avec menu de gestion. */
  manageable?: boolean;
};

const FiliereCatalogueSection = ({
  exams,
  total,
  page,
  pageSize,
  filterOptions,
  manageable = false,
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
        manageable={manageable}
      />
    </section>
  );
};

export default FiliereCatalogueSection;
