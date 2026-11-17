export const HOME_CARDS_LIMIT = 6;
export const MOBILE_VISIBLE_CARDS = 3;

export const GRID_CLASS =
  "mb-6 grid grid-cols-1 grid-rows-3 gap-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3";

export function cardVisibilityClass(index: number): string {
  return index >= MOBILE_VISIBLE_CARDS ? "hidden md:block" : "block";
}
