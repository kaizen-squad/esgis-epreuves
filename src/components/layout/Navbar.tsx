"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { FiMenu, FiX } from "react-icons/fi";

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

const Navbar = ({ links, endSlot, homeHref = "/" }: NavbarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="px-4 py-8">
      <nav className="lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center justify-between">
          <Link
            className="text-text-title justify-self-start text-2xl font-extrabold"
            href={homeHref}
          >
            Alexandria.
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-background-accent rounded p-2 lg:hidden"
          >
            {isOpen ? (
              <FiX size={24} color="#fff" />
            ) : (
              <FiMenu size={24} color="#fff" />
            )}
          </button>
        </div>

        {/** Desktop Navbar */}
        <div className="hidden gap-6 lg:flex">
          {links.map((link) => {
            const isActive = pathname === link.link;
            return (
              <Link
                className={`${isActive ? "underline" : ""}`}
                href={link.link}
                key={link.name}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {endSlot ? (
          <div className="hidden items-center justify-end lg:flex">
            {endSlot}
          </div>
        ) : null}

        {/** Mobile Navbar */}
        {isOpen && (
          <div className="flex flex-col py-4">
            {links.map((link) => {
              const isActive = pathname === link.link;
              return (
                <Link
                  key={link.name}
                  className={`${isActive ? "underline" : ""} hover hover:bg-background-default py-2 text-center`}
                  href={link.link}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            {endSlot ? <div className="pt-2">{endSlot}</div> : null}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
