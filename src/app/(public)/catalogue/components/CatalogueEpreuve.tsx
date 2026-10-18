"use client";

import { FiFilter } from "react-icons/fi";
import DomainSelectFilter from "../../components/DomainSelectFilter";
import { epreuvesMock } from "../../constants/epreuve.constants";
import EpreuveCard from "../../components/EpreuveCard";
import { useState } from "react";

const CatalogueEpreuve = () => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="px-4">
      <DomainSelectFilter />
      <div className="">
        <button className="text-text-secondary mt-auto mb-6 flex cursor-pointer gap-2 text-xl font-semibold">
          <FiFilter size={22} color="#c41c2d" />
          Filtres
        </button>
        {isVisible && <div>Bro</div>}
        <div className="mb-10 grid grid-cols-1 gap-10">
          {epreuvesMock.map((epreuve) => (
            <EpreuveCard {...epreuve} key={epreuve.name} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogueEpreuve;
