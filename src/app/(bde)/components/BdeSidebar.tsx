"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiFolder,
  FiHome,
  FiMenu,
  FiSettings,
  FiUpload,
  FiX,
} from "@/components/icons";
import LogoutButton from "@/components/layout/LogoutButton";
import { BDE_BASE_PATH, filieresHref } from "@/components/layout/spaces";
import { useMobileDrawer } from "@/components/layout/useMobileDrawer";

const BDE_MES_EPREUVES_HREF = `${BDE_BASE_PATH}/mes-epreuves`;
const BDE_FILIERES_HREF = filieresHref(BDE_BASE_PATH);

type BdeLink = {
  name: string;
  href: string;
  icon: IconType;
  isActive: (pathname: string) => boolean;
};

const BDE_LINKS: BdeLink[] = [
  {
    name: "Accueil",
    href: "/bde/accueil",
    icon: FiHome,
    isActive: (pathname) => pathname === "/bde/accueil",
  },
  {
    // Vocabulaire deja etabli par l'accueil BDE (« Verser une epreuve », BDEWelcomeSection),
    // repris ici plutot qu'un nouveau synonyme.
    name: "Verser",
    href: "/bde/epreuves/ajouter",
    icon: FiUpload,
    isActive: (pathname) => pathname === "/bde/epreuves/ajouter",
  },
  {
    // Versements du membre connecte (modifier, remplacer, supprimer) : actif aussi sur les pages
    // d'une epreuve precise, qui ne s'atteignent qu'en partant de cette liste (#192, corrige le
    // lien qui pointait vers le catalogue de toute l'equipe).
    name: "Mes épreuves",
    href: BDE_MES_EPREUVES_HREF,
    icon: FiFolder,
    isActive: (pathname) =>
      pathname === BDE_MES_EPREUVES_HREF ||
      (pathname.startsWith("/bde/epreuves/") &&
        pathname !== "/bde/epreuves/ajouter"),
  },
  {
    name: "Épreuves manquantes",
    href: BDE_FILIERES_HREF,
    icon: FiAlertCircle,
    isActive: (pathname) => pathname.startsWith(BDE_FILIERES_HREF),
  },
];

const SIDEBAR_ID = "bde-sidebar";

/**
 * Navigation de l'espace BDE, passee de header horizontal (#175) a sidebar verticale : onglets
 * de travail par priorite (dont "Accueil", absent du header public retire par #175 mais qui
 * renvoie ici a l'accueil de l'espace BDE, pas au site public), puis Reglages/Deconnexion
 * separes, repris du pattern deja accessible de `AdminSidebar` (meme marine
 * `background-secondary`, pas la DA « Archives »).
 */
export default function BdeSidebar() {
  const pathname = usePathname();
  const { open, setOpen, asideRef, openButtonRef, closeButtonRef } =
    useMobileDrawer();

  // Tiroir mobile accessible : verrouille le defilement de la page, ferme sur Echap, piege
  // Tab/Shift+Tab a l'interieur et se referme si la fenetre passe a `lg` pendant qu'il est ouvert
  // (sinon le defilement resterait bloque sans aucun moyen visible de le refermer au-dela de ce
  // point de rupture). Focus deplace dedans a l'ouverture.
  const reglagesActive = pathname.startsWith("/bde/reglages");

  return (
    <>
      <header className="bg-background-secondary flex items-center justify-between px-4 py-4 lg:hidden">
        <Link
          href="/bde/accueil"
          className="text-text-primary text-xl font-extrabold"
        >
          Alexandria<span className="text-background-accent">.</span>
        </Link>
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls={SIDEBAR_ID}
          className="bg-background-accent rounded-control cursor-pointer p-2"
        >
          <FiMenu size={22} className="text-text-primary" />
        </button>
      </header>

      {open ? (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="bg-background-secondary/60 fixed inset-0 z-40 lg:hidden"
        />
      ) : null}

      <aside
        id={SIDEBAR_ID}
        ref={asideRef}
        className={`bg-background-secondary fixed inset-y-0 left-0 z-50 flex w-64 flex-col px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-10 flex items-center justify-between px-2">
          <div>
            <Link
              href="/bde/accueil"
              className="text-text-primary text-2xl font-extrabold"
            >
              Alexandria<span className="text-background-accent">.</span>
            </Link>
            <p className="text-text-primary/60 mb-0 text-xs font-medium tracking-wide uppercase">
              Espace BDE
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="text-text-primary/70 rounded-control hover:bg-text-primary/10 cursor-pointer p-1 lg:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav aria-label="Navigation BDE" className="flex-1">
          <ul className="flex flex-col gap-1">
            {BDE_LINKS.map(({ name, href, icon: Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <li key={href} className="relative">
                  {active ? (
                    <span
                      aria-hidden
                      className="bg-background-accent absolute inset-y-1 left-0 w-0.5 rounded-full"
                    />
                  ) : null}
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-control flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "text-text-primary bg-text-primary/10"
                        : "text-text-primary/70 hover:text-text-primary hover:bg-text-primary/5"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? "text-background-accent" : ""}
                    />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="border-text-primary/10 mt-4 border-t pt-4">
            <Link
              href="/bde/reglages"
              onClick={() => setOpen(false)}
              aria-current={reglagesActive ? "page" : undefined}
              className={`rounded-control flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                reglagesActive
                  ? "text-text-primary bg-text-primary/10"
                  : "text-text-primary/70 hover:text-text-primary hover:bg-text-primary/5"
              }`}
            >
              <FiSettings
                size={18}
                className={reglagesActive ? "text-background-accent" : ""}
              />
              Réglages
            </Link>
          </div>
        </nav>

        <div className="border-text-primary/10 border-t pt-4">
          <LogoutButton className="w-full justify-center" tone="dark" />
        </div>
      </aside>
    </>
  );
}
