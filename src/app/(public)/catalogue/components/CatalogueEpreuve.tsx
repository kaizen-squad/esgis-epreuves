"use client";

import DomainSelectFilter from "../../components/DomainSelectFilter";
import { epreuvesMock } from "../../constants/epreuve.constants";
import EpreuveCard from "../../components/EpreuveCard";
import CatalogueFilter from "./CatalogueFilter";

const CatalogueEpreuve = () => {
  return (
    <div className="mb-20 px-4">
      <DomainSelectFilter />
      <div className="">
        <CatalogueFilter />
        <div className="grid grid-cols-1 gap-10">
          {epreuvesMock.map((epreuve) => (
            <EpreuveCard {...epreuve} key={epreuve.name} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogueEpreuve;
