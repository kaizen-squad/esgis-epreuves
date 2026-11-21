/** Pages affichees : la premiere, la derniere, et les voisines de la page courante. */
export function visiblePages(
  page: number,
  pageCount: number,
): (number | "…")[] {
  const pages: (number | "…")[] = [];
  for (let n = 1; n <= pageCount; n++) {
    if (n === 1 || n === pageCount || Math.abs(n - page) <= 1) pages.push(n);
    else if (pages.at(-1) !== "…") pages.push("…");
  }
  return pages;
}

export function pageCountOf(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
