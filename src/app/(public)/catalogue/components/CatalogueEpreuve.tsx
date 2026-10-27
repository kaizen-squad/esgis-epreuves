"use client";

import DomainSelectFilter from "../../components/DomainSelectFilter";
import { epreuvesMock } from "../../constants/epreuve.constants";
import EpreuveCard from "../../components/EpreuveCard";
import CatalogueFilter from "./CatalogueFilter";
import { FiFilter } from "react-icons/fi";
import { useState } from "react";

const CatalogueEpreuve = () => {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <section className="mx-auto mb-20 w-full max-w-7xl px-4 lg:px-6">
      <DomainSelectFilter />

      <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="text-text-secondary hidden cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-gray-100 lg:flex"
        >
          <FiFilter size={20} color="#c41c2d" />
          {open ? "Masquer les filtres" : "Afficher les filtres"}
        </button>
        <CatalogueFilter mode="mobile" />
        <p className="text-text-paragraph text-sm">
          <span className="text-text-title font-semibold">
            {epreuvesMock.length}
          </span>{" "}
          épreuves trouvées
        </p>
      </div>

      <div
        className={`lg:grid lg:items-start lg:gap-8 ${open ? "lg:grid-cols-[18rem_minmax(0,1fr)]" : ""}`}
      >
        {open && (
          <CatalogueFilter mode="desktop" onClose={() => setOpen(false)} />
        )}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(17rem,100%),1fr))] gap-6">
          {epreuvesMock.map((epreuve) => (
            <EpreuveCard {...epreuve} key={epreuve.name} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CatalogueEpreuve;
