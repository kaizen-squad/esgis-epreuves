"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState, type ReactNode } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { isNavLinkActive } from "./spaces";

export type NavLink = {
  name: string;
  link: string;
};

type NavbarProps = {
  links: NavLink[];
  /** Contenu affiche a droite de la barre (ex. bouton de deconnexion de l'espace BDE). */
  endSlot?: ReactNode;
  /** Cible du logo : l'accueil de l'espace (`/bde/accueil` cote BDE). */
  homeHref?: string;
};

/**
 * Bande en surplomb façon tranche de classeur : les rubriques sont des onglets intercalaires,
 * l'onglet actif "sorti" du bandeau sombre (R-04). L'etat actif suit `isNavLinkActive` : une
 * sous-page (`/filieres/[id]`) garde l'onglet de sa section active, pas seulement sa racine.
 */
const Navbar = ({ links, endSlot, homeHref = "/" }: NavbarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobilePanelId = useId();

  return (
    <header className="bg-background-secondary px-4 pt-4 pb-0 lg:px-10">
      <nav
        aria-label="Navigation principale"
        className="lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-end"
      >
        <div className="flex items-center justify-between pb-4">
          <Link
            className="text-text-primary justify-self-start text-2xl font-extrabold tracking-tight"
            href={homeHref}
          >
            Alexandria<span className="text-background-accent">.</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isOpen}
            aria-controls={mobilePanelId}
            className="bg-background-accent rounded-[var(--radius-control)] p-2 lg:hidden"
          >
            {isOpen ? (
              <FiX size={24} color="#fff" aria-hidden="true" />
            ) : (
              <FiMenu size={24} color="#fff" aria-hidden="true" />
            )}
          </button>
        </div>

        {/** Onglets intercalaires, desktop */}
        <div className="hidden gap-1 lg:flex">
          {links.map((link) => {
            const isActive = isNavLinkActive(pathname, link.link);
            return (
              <Link
                key={link.name}
                href={link.link}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "bg-background-primary text-text-default rounded-t-[var(--radius-control)] px-4 py-3 text-sm font-semibold"
                    : "text-text-primary/70 hover:text-text-primary rounded-t-[var(--radius-control)] px-4 py-3 text-sm font-medium transition-colors"
                }
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {endSlot ? (
          <div className="bg-background-primary mb-3 hidden items-center justify-end justify-self-end rounded-[var(--radius-control)] p-1 lg:flex">
            {endSlot}
          </div>
        ) : null}
      </nav>

      {/** Panneau mobile */}
      {isOpen ? (
        <div
          id={mobilePanelId}
          className="bg-background-primary flex flex-col rounded-t-[var(--radius-card)] py-4 lg:hidden"
        >
          {links.map((link) => {
            const isActive = isNavLinkActive(pathname, link.link);
            return (
              <Link
                key={link.name}
                href={link.link}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className={`py-2 text-center ${
                  isActive
                    ? "text-background-accent font-semibold"
                    : "text-text-default hover:bg-background-default"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {endSlot ? <div className="pt-2">{endSlot}</div> : null}
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
