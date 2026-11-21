/**
 * Prefixe des routes d'un espace : `""` pour l'espace public, `"/bde"` pour l'espace BDE. Les
 * composants partages (cartes de filiere, cartes d'epreuve, page d'une filiere) construisent
 * leurs liens avec, pour qu'un membre du BDE reste dans son espace.
 */
export type SpaceBasePath = "" | "/bde";

export const BDE_BASE_PATH: SpaceBasePath = "/bde";

/** Catalogue de l'espace (`/catalogue` ou `/bde/catalogue`). */
export function catalogueHref(basePath: SpaceBasePath): string {
  return `${basePath}/catalogue`;
}

/** Page de consultation d'une epreuve dans l'espace. */
export function examHref(basePath: SpaceBasePath, slug: string): string {
  return `${basePath}/epreuves/${slug}`;
}

/** Lien de partage d'une epreuve : toujours la page publique, lisible sans compte. */
export function publicExamPath(slug: string): string {
  return examHref("", slug);
}
