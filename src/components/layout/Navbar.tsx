"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isNavLinkActive } from "./spaces";

export type NavLink = {
  name: string;
  link: string;
};

type NavbarProps = {
  links: NavLink[];
  /** Contenu affiche a droite du logo (ex. bouton de deconnexion de l'espace BDE). */
  endSlot?: ReactNode;
  /** Cible du logo : l'accueil de l'espace (`/bde/accueil` cote BDE). */
  homeHref?: string;
};

/**
 * Bande en surplomb facon couverture de classeur : chaque rubrique est l'intercalaire d'une
 * feuille, l'onglet actif est la languette de la page affichee juste en dessous (R-04, voir
 * `.binder-tab` dans `globals.css`). La profondeur d'un onglet inactif (1 ou 2) est sa distance
 * a l'onglet actif : plus il est loin, plus sa feuille est enfoncee dans la pile.
 *
 * Les onglets restent visibles sur mobile, sans menu burger : trois rubriques courtes tiennent
 * des 320px, et le classeur doit se lire des le premier ecran du telephone. Au-dela de quatre
 * rubriques, il faudra revoir cette largeur.
 *
 * L'etat actif suit `isNavLinkActive` : une sous-page (`/filieres/[id]`) garde l'onglet de sa
 * section actif, pas seulement sa racine.
 */
const Navbar = ({ links, endSlot, homeHref = "/" }: NavbarProps) => {
  const pathname = usePathname();
  const activeIndex = links.findIndex((link) =>
    isNavLinkActive(pathname, link.link),
  );

  return (
    // Pas de fond propre : la couverture marine vient de la mise en page, pour que la tranche
    // des feuilles du dessous (ombre portee de la page) reste visible sous les onglets.
    <header className="isolate px-4 pt-5 lg:px-14 lg:pt-8">
      <nav aria-label="Navigation principale" className="flex flex-col">
        {/* `flex-wrap` : sous 360px, le bouton de l'espace BDE passe sous le logo. */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 lg:pb-4">
          <Link
            className="text-text-primary text-3xl font-extrabold tracking-tight lg:text-4xl"
            href={homeHref}
          >
            Alexandria<span className="text-background-accent">.</span>
          </Link>

          {endSlot ? (
            <div className="bg-background-primary rounded-control flex shrink-0 items-center p-1">
              {endSlot}
            </div>
          ) : null}
        </div>

        {/* Marge droite : l'onglet le plus a droite et son conge restent sur le bord droit de
            la feuille, jamais au-dessus de son coin arrondi. */}
        <div className="mr-5 flex items-end justify-end lg:mr-4">
          {links.map((link, index) => {
            const isActive = index === activeIndex;
            const depth =
              activeIndex === -1
                ? 1
                : Math.min(Math.abs(index - activeIndex), 2);

            return (
              <Link
                key={link.name}
                href={link.link}
                aria-current={isActive ? "page" : undefined}
                data-depth={depth}
                className={`binder-tab group text-text-default not-first:-ml-2 lg:not-first:-ml-2.5 ${
                  isActive
                    ? "px-4 py-3 text-base font-semibold sm:px-5 lg:px-8 lg:py-4 lg:text-lg"
                    : `px-3 text-sm font-medium sm:px-4 lg:px-6 lg:text-base ${
                        // Feuille plus enfoncee : base 4px plus haut (voir `globals.css`),
                        // hauteur 4px plus courte pour garder les sommets alignes.
                        depth === 2 ? "py-2 lg:py-2.5" : "py-2.5 lg:py-3"
                      }`
                }`}
              >
                <span
                  className={`block ${
                    isActive
                      ? ""
                      : "text-text-default/75 group-hover:text-text-default transition-[color,translate] duration-300 group-hover:-translate-y-0.5"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
