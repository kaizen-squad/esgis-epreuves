"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiFolder,
  FiSettings,
  FiUpload,
} from "@/components/icons";
import LogoutButton from "@/components/layout/LogoutButton";
import {
  BDE_BASE_PATH,
  catalogueHref,
  filieresHref,
} from "@/components/layout/spaces";

const BDE_CATALOGUE_HREF = catalogueHref(BDE_BASE_PATH);
const BDE_FILIERES_HREF = filieresHref(BDE_BASE_PATH);

type BdeLink = {
  name: string;
  href: string;
  icon: IconType;
  isActive: (pathname: string) => boolean;
};

const BDE_LINKS: BdeLink[] = [
  {
    // Vocabulaire deja etabli par l'accueil BDE (« Verser une epreuve », BDEWelcomeSection),
    // repris ici plutot qu'un nouveau synonyme.
    name: "Verser",
    href: "/bde/epreuves/ajouter",
    icon: FiUpload,
    isActive: (pathname) => pathname === "/bde/epreuves/ajouter",
  },
  {
    // Gestion des epreuves deja deposees (modifier, remplacer, supprimer) : actif aussi sur les
    // pages d'une epreuve precise, qui ne s'atteignent qu'en partant de cette liste.
    name: "Mes épreuves",
    href: BDE_CATALOGUE_HREF,
    icon: FiFolder,
    isActive: (pathname) =>
      pathname === BDE_CATALOGUE_HREF ||
      (pathname.startsWith("/bde/epreuves/") &&
        pathname !== "/bde/epreuves/ajouter"),
  },
  {
    name: "Lacunes du fonds",
    href: BDE_FILIERES_HREF,
    icon: FiAlertCircle,
    isActive: (pathname) => pathname.startsWith(BDE_FILIERES_HREF),
  },
];

/**
 * Header de l'espace BDE (#175), reconstruit plutot que repris du nav public : les anciens
 * onglets (Accueil / Catalogue / Filières) recopiaient le vocabulaire de consultation du site
 * public sans rapport avec le travail de depot et de gestion du BDE, et portaient le chrome du
 * classeur (DA Archives) qui n'a pas sa place dans un outil de travail (voir decision
 * "DA Archives reservee aux interfaces visiteurs"). « Accueil » disparait comme onglet : le logo
 * y mene deja. Reglages et Deconnexion restent regroupes mais separes des onglets de travail par
 * une bordure, pour que la hierarchie (taches vs utilitaires de compte) se lise sans ambiguite.
 */
export default function BdeHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-background-secondary flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-start lg:gap-8">
        <Link
          href="/bde/accueil"
          className="text-text-primary text-xl font-extrabold lg:text-2xl"
        >
          Alexandria<span className="text-background-accent">.</span>
        </Link>

        <nav aria-label="Navigation BDE">
          <ul className="flex flex-wrap items-center gap-1">
            {BDE_LINKS.map(({ name, href, icon: Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-control flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "text-text-primary bg-white/10"
                        : "text-text-primary/70 hover:text-text-primary hover:bg-white/5"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={active ? "text-background-accent" : ""}
                    />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <Link
          href="/bde/reglages"
          aria-current={
            pathname.startsWith("/bde/reglages") ? "page" : undefined
          }
          className={`rounded-control flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
            pathname.startsWith("/bde/reglages")
              ? "text-text-primary bg-white/10"
              : "text-text-primary/70 hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <FiSettings size={16} aria-hidden="true" /> Réglages
        </Link>
        <LogoutButton tone="dark" />
      </div>
    </header>
  );
}
