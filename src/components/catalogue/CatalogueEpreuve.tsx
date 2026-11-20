"use client";

import ExamCard, { ExamCardProps } from "@/components/exams/ExamCard";
import CatalogueFilter from "@/components/catalogue/CatalogueFilter";
import { FiFilter } from "react-icons/fi";
import { useState } from "react";
import { useCatalogueFilters } from "@/components/exams/useCatalogueFilters";
import type { CatalogueFilterOptions } from "@/components/exams/catalogueFilters";

type CatalogueEpreuvesProps = {
  data: ExamCardProps[];
  /** Total cote serveur (toutes pages confondues) pour les filtres en cours. */
  total: number;
  filterOptions: CatalogueFilterOptions;
  /** Espace BDE : cartes avec menu de gestion. */
  manageable?: boolean;
};

const CatalogueEpreuves = ({
  data,
  total,
  filterOptions,
  manageable = false,
}: CatalogueEpreuvesProps) => {
  const [open, setOpen] = useState<boolean>(true);
  const filters = useCatalogueFilters();

  return (
    <>
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
        <CatalogueFilter
          mode="mobile"
          options={filterOptions}
          filters={filters}
          total={total}
        />
        <p className="text-text-paragraph text-sm">
          <span className="text-text-title font-semibold">{total}</span>{" "}
          épreuves trouvées
        </p>
      </div>

      <div
        className={`lg:grid lg:items-start lg:gap-8 ${open ? "lg:grid-cols-[18rem_minmax(0,1fr)]" : ""}`}
      >
        {open && (
          <CatalogueFilter
            mode="desktop"
            onClose={() => setOpen(false)}
            options={filterOptions}
            filters={filters}
            total={total}
          />
        )}
        <div
          aria-busy={filters.isPending}
          className={`transition-opacity ${filters.isPending ? "opacity-50" : ""}`}
        >
          {data.length === 0 ? (
            <p className="text-text-paragraph text-center">
              Aucune épreuve ne correspond à ces filtres.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(17rem,100%),1fr))] gap-6">
              {data.map((epreuve) => (
                <ExamCard
                  {...epreuve}
                  manageable={manageable}
                  key={epreuve.slug ?? epreuve.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CatalogueEpreuves;
