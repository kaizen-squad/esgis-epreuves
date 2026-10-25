"use client";

import DomainSelectFilter from "../../components/DomainSelectFilter";
import {
  EPREUVE_GRID_CLASSES,
  epreuvesMock,
} from "../../constants/epreuve.constants";
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
          className={`text-text-secondary mt-auto mb-6 hidden cursor-pointer items-center gap-2 text-xl font-semibold lg:flex ${open ? "hidden" : "block"}`}
        >
          <FiFilter size={22} color="#c41c2d" />
          Filtres
        </button>
        <div className="gap-3 lg:flex">
          <CatalogueFilter
            mode={isDesktop ? "desktop" : "mobile"}
            isDesktopOpen={isDesktop && open}
          />
          <div
            className={`${EPREUVE_GRID_CLASSES} min-w-0 flex-1 justify-center sm:justify-start ${open ? "lg:ml-72" : ""}`}
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
