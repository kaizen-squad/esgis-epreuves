import React from "react";
import CatalogueEpreuves from "./CatalogueEpreuve";
import { epreuvesMock } from "../../constants/epreuve.constants";

const CatalogueEpreuveSection = () => {
  return (
    <section className="mx-auto mb-20 w-full max-w-7xl px-4 lg:px-6">
      <CatalogueEpreuves data={epreuvesMock} />
    </section>
  );
};

export default CatalogueEpreuveSection;
