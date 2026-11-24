"use client";

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PageNumberList from "@/components/ui/PageNumberList";
import { pageCountOf } from "@/lib/pagination";

const ARROW_CLASS =
  "flex size-10 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-background-primary transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background-primary";

/** Pagination du catalogue : resume « x–y sur n » et numeros de page. Masquee sur une seule page. */
export default function CataloguePagination({
  page,
  pageSize,
  total,
  shown,
  disabled = false,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  /** Nombre d'epreuves affichees sur cette page. */
  shown: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  const pageCount = pageCountOf(total, pageSize);
  if (pageCount <= 1 || shown === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = first + shown - 1;

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
      <p className="text-text-paragraph mb-0 text-sm">
        Épreuves{" "}
        <span className="text-text-title font-semibold">
          {first} à {last}
        </span>{" "}
        sur {total}
      </p>

      <nav
        aria-label="Pagination du catalogue"
        className="flex items-center gap-1"
      >
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          aria-label="Page précédente"
          className={ARROW_CLASS}
        >
          <FiChevronLeft />
        </button>

        <PageNumberList
          page={page}
          pageCount={pageCount}
          renderPage={(item) => (
            <button
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              disabled={disabled}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={`flex size-10 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${item === page ? "bg-background-accent text-text-primary" : "hover:bg-gray-100"}`}
            >
              {item}
            </button>
          )}
        />

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= pageCount}
          aria-label="Page suivante"
          className={ARROW_CLASS}
        >
          <FiChevronRight />
        </button>
      </nav>
    </div>
  );
}
