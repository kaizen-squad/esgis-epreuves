import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import PageNumberList from "@/components/ui/PageNumberList";

/** Pagination par liens (`?page=`), qui conserve les autres parametres de l'URL (recherche). */
export default function Pagination({
  page,
  pageCount,
  params,
}: {
  page: number;
  pageCount: number;
  /** Parametres a conserver dans les liens (ex. `q`). */
  params: Record<string, string>;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const search = new URLSearchParams(params);
    if (target > 1) search.set("page", String(target));
    else search.delete("page");
    const query = search.toString();
    return query ? `?${query}` : "?";
  };

  const arrowClass =
    "flex size-9 items-center justify-center rounded-control border border-border-default";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          aria-label="Page précédente"
          className={`${arrowClass} hover:bg-background-default`}
        >
          <FiChevronLeft />
        </Link>
      ) : (
        <span aria-hidden className={`${arrowClass} opacity-40`}>
          <FiChevronLeft />
        </span>
      )}

      <PageNumberList
        page={page}
        pageCount={pageCount}
        renderPage={(item) => (
          <Link
            key={item}
            href={href(item)}
            aria-current={item === page ? "page" : undefined}
            className={`rounded-control flex size-9 items-center justify-center text-sm font-medium ${item === page ? "bg-background-accent text-text-primary" : "hover:bg-background-default"}`}
          >
            {item}
          </Link>
        )}
      />

      {page < pageCount ? (
        <Link
          href={href(page + 1)}
          aria-label="Page suivante"
          className={`${arrowClass} hover:bg-background-default`}
        >
          <FiChevronRight />
        </Link>
      ) : (
        <span aria-hidden className={`${arrowClass} opacity-40`}>
          <FiChevronRight />
        </span>
      )}
    </nav>
  );
}
