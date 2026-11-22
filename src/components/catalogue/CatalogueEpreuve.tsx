"use client";

import ExamCard, { ExamCardProps } from "@/components/exams/ExamCard";
import CatalogueFilter from "@/components/catalogue/CatalogueFilter";
import ActiveFilters from "@/components/catalogue/filter/ActiveFilters";
import { FiFilter } from "react-icons/fi";
import { useRef, useState } from "react";
import CataloguePagination from "@/components/catalogue/CataloguePagination";
import { useCatalogueFilters } from "@/components/exams/useCatalogueFilters";
import type { CatalogueFilterOptions } from "@/components/exams/catalogueFilters";

type CatalogueEpreuvesProps = {
  data: ExamCardProps[];
  /** Total cote serveur (toutes pages confondues) pour les filtres en cours. */
  total: number;
  /** Page affichee et taille de page, telles que renvoyees par le serveur. */
  page: number;
  pageSize: number;
  filterOptions: CatalogueFilterOptions;
  /** Espace BDE : cartes avec menu de gestion. */
  manageable?: boolean;
};

const CatalogueEpreuves = ({
  data,
  total,
  page,
  pageSize,
  filterOptions,
  manageable = false,
}: CatalogueEpreuvesProps) => {
  const [open, setOpen] = useState<boolean>(true);
  const filters = useCatalogueFilters();
  const topRef = useRef<HTMLDivElement>(null);

  // Nouvelle page : on remonte en haut du catalogue (pas de la page, qui commence par l'en-tete).
  const handlePageChange = (next: number) => {
    filters.goToPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div
        ref={topRef}
        className="mb-6 flex scroll-mt-6 items-center justify-between gap-4 border-b border-gray-200 pb-4"
      >
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
          <ActiveFilters options={filterOptions} filters={filters} />
          {data.length === 0 ? (
            <div className="text-text-paragraph text-center">
              {filters.get("search") ? (
                <p>
                  Aucune épreuve ne correspond à «&nbsp;
                  {filters.get("search")}&nbsp;».
                </p>
              ) : (
                <p>Aucune épreuve ne correspond à ces filtres.</p>
              )}
              <button
                type="button"
                onClick={filters.reset}
                className="text-text-default mt-2 cursor-pointer font-medium hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
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
          <CataloguePagination
            page={page}
            pageSize={pageSize}
            total={total}
            shown={data.length}
            disabled={filters.isPending}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default CatalogueEpreuves;
