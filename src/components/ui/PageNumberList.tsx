import type { ReactNode } from "react";
import { visiblePages } from "@/lib/pagination";

/**
 * Calcul des pages visibles et rendu des « … » partages par les deux paginations du site (Admin
 * en liens, catalogue en boutons, #165) : seul ce calcul etait duplique entre les deux, chaque
 * appelant garde son propre mode de navigation et son gabarit visuel pour le numero de page lui-meme.
 */
export default function PageNumberList({
  page,
  pageCount,
  renderPage,
}: {
  page: number;
  pageCount: number;
  renderPage: (pageNumber: number) => ReactNode;
}) {
  return (
    <>
      {visiblePages(page, pageCount).map((item, index) =>
        item === "…" ? (
          <span
            key={`gap-${index}`}
            aria-hidden
            className="text-text-paragraph px-1"
          >
            …
          </span>
        ) : (
          renderPage(item)
        ),
      )}
    </>
  );
}
