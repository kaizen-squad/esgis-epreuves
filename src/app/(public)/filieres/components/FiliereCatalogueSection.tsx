import type { EpreuveCardProps } from "../../components/EpreuveCard";
import CatalogueEpreuves from "../../catalogue/components/CatalogueEpreuve";
import DomainSelectFilter from "../../components/DomainSelectFilter";

type FiliereCatalogueSectionProps = {
  exams: EpreuveCardProps[];
  total: number;
};

const FiliereCatalogueSection = ({
  exams,
  total,
}: FiliereCatalogueSectionProps) => {
  return (
    <section className="mx-auto mb-20 w-full max-w-7xl px-4 lg:px-6">
      <DomainSelectFilter />
      {exams.length === 0 ? (
        <p className="text-text-paragraph text-center">
          Aucune épreuve n&apos;a encore été ajoutée pour cette filière.
        </p>
      ) : (
        <CatalogueEpreuves data={exams} total={total} />
      )}
    </section>
  );
};

export default FiliereCatalogueSection;
