export const HOME_CARDS_LIMIT = 6;
export const MOBILE_VISIBLE_CARDS = 3;

/** Grille des intercalaires, dans leur logement (`.filing-tray`) : accueil et son squelette. */
export const TRAY_CLASS =
  "filing-tray rounded-[calc(var(--radius-card)+0.5rem)] px-3 pt-3 pb-8 sm:px-5 sm:pt-5";
// Interligne : la pile de feuilles depasse de 19px sous chaque carte (`data-pile="3"`).
export const GRID_CLASS =
  "grid grid-cols-1 gap-x-5 gap-y-7 md:grid-cols-2 lg:grid-cols-3";

export function cardVisibilityClass(index: number): string {
  return index >= MOBILE_VISIBLE_CARDS ? "hidden md:flex" : "flex";
}
