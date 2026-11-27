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

/** Liste des filieres de l'espace (`/filieres` ou `/bde/filieres`). */
export function filieresHref(basePath: SpaceBasePath): string {
  return `${basePath}/filieres`;
}

/** Page de consultation d'une epreuve dans l'espace. */
export function examHref(basePath: SpaceBasePath, slug: string): string {
  return `${basePath}/epreuves/${slug}`;
}

/** Lien de partage d'une epreuve : toujours la page publique, lisible sans compte. */
export function publicExamPath(slug: string): string {
  return examHref("", slug);
}

/**
 * Lien vers la route de previsualisation/telechargement (`/api/exams/[slug]`). Porte l'espace
 * d'origine (`?space=bde`) pour que, si le fichier est absent de R2, la redirection de repli
 * mene a la fiche du meme espace plutot que toujours a la fiche publique.
 */
export function examFileHref(
  basePath: SpaceBasePath,
  slug: string,
  download = false,
): string {
  const params = new URLSearchParams();
  if (basePath === BDE_BASE_PATH) params.set("space", "bde");
  if (download) params.set("dl", "1");
  const query = params.toString();
  return `/api/exams/${slug}${query ? `?${query}` : ""}`;
}

/**
 * Un lien de navigation est actif sur sa propre page et sur ses sous-pages (ex. `/filieres`
 * reste actif sur `/filieres/[id]`), jamais par simple prefixe de chaine qui ferait correspondre
 * `/f` a `/filieres`.
 *
 * `usePathname()` resout la racine `/` en chaine vide `""` (pas `"/"`) sur un rendu statique fige
 * au build (ISR), contrairement aux autres routes : `/` restait donc jamais mise en avant au
 * premier chargement direct (hors navigation cote client, qui la resout correctement).
 *
 * `/index` s'y ajoute (#189 bis) : en prod sur Vercel, la route racine est invoquee en interne
 * via l'en-tete `x-matched-path: /index` (nom de la fonction serverless, visible dans
 * `vercel inspect` : `λ index`) ; Next normalise `/index` en `/` seulement sur une requete HTTP
 * directe passant par ce chemin (voir `node_modules/next/dist/server/base-server.js`,
 * "ensure /index path is normalized for prerender in minimal mode"), pas lors de la
 * regeneration ISR en tache de fond, qui recree alors une page statique ou l'onglet Accueil
 * n'est jamais actif. Non reproductible avec `next build && next start` (ce mecanisme n'existe
 * qu'en mode minimal de Vercel).
 */
export function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/")
    return pathname === "/" || pathname === "" || pathname === "/index";
  return pathname === href || pathname.startsWith(`${href}/`);
}
