"use client";

import DomainSelectFilter from "../../components/DomainSelectFilter";
import { epreuvesMock } from "../../constants/epreuve.constants";
import EpreuveCard from "../../components/EpreuveCard";
import CatalogueFilter from "./CatalogueFilter";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { FiFilter } from "react-icons/fi";
import { useState } from "react";

const CatalogueEpreuve = () => {
  const [open, setOpen] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return (
    <div className="mb-20 px-4">
      <DomainSelectFilter />
      <div>
        <button
          onClick={() => setOpen(true)}
          className="text-text-secondary mt-auto mb-6 flex cursor-pointer items-center gap-2 text-xl font-semibold"
        >
          <FiFilter size={22} color="#c41c2d" />
          Filtres
        </button>
        <div className="gap-3 lg:flex">
          <CatalogueFilter
            mode={isDesktop ? "desktop" : "mobile"}
            isMobileOpen={isDesktop && open}
          />
          <div
            className={`grid grid-cols-1 gap-10 ${open ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
          >
            {epreuvesMock.map((epreuve) => (
              <EpreuveCard {...epreuve} key={epreuve.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogueEpreuve;
