"use client";

import { FiFilter } from "react-icons/fi";
import DomainSelectFilter from "../../components/DomainSelectFilter";

const CatalogueEpreuve = () => {
  return (
    <div className="px-4">
      <DomainSelectFilter />
      <div className="">
        <button className="text-text-secondary mt-auto flex cursor-pointer gap-2 text-xl font-semibold">
          <FiFilter size={22} color="#c41c2d" />
          Filtres
        </button>
      </div>
    </div>
  );
};

export default CatalogueEpreuve;
