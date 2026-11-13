import CatalogueEpreuves from "../../catalogue/components/CatalogueEpreuve";
import DomainSelectFilter from "../../components/DomainSelectFilter";
import { epreuvesMock } from "../../constants/epreuve.constants";

const FiliereCatalogueSection = () => {
  return (
    <section className="mx-auto mb-20 w-full max-w-7xl px-4 lg:px-6">
      <DomainSelectFilter />
      <CatalogueEpreuves data={epreuvesMock} />
    </section>
  );
};

export default FiliereCatalogueSection;
