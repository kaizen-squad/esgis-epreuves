"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FiMenu } from "react-icons/fi";
import {
  FiAlertCircle,
  FiFolder,
  FiHome,
  FiSettings,
  FiUpload,
  FiX,
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
    name: "Accueil",
    href: "/bde/accueil",
    icon: FiHome,
    isActive: (pathname) => pathname === "/bde/accueil",
  },
  {
    // Vocabulaire deja etabli par l'accueil BDE (« Verser une epreuve », BDEWelcomeSection),
    // repris ici plutot qu'un nouveau synonyme. Priorite la plus haute : l'action principale.
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
    name: "Épreuves manquantes",
    href: BDE_FILIERES_HREF,
    icon: FiAlertCircle,
    isActive: (pathname) => pathname.startsWith(BDE_FILIERES_HREF),
  },
];

const SIDEBAR_ID = "bde-sidebar";

/**
 * Navigation de l'espace BDE, passee de header horizontal (#175) a sidebar verticale : meme
 * contenu et meme hierarchie (onglets de travail par priorite, puis Reglages/Deconnexion
 * separes), repris du pattern deja accessible de `AdminSidebar` (meme marine
 * `background-secondary`, pas la DA « Archives »).
 */
export default function BdeSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Rend le focus au bouton d'ouverture seulement en refermant le tiroir (transition true ->
  // false), jamais au premier rendu (ou `open` vaut deja `false`) : sinon chaque chargement d'une
  // page BDE sous `lg` volait le focus a ce bouton des le montage.
  const previousOpenRef = useRef(open);
  useEffect(() => {
    if (previousOpenRef.current && !open) openButtonRef.current?.focus();
    previousOpenRef.current = open;
  }, [open]);

  // Tiroir mobile accessible : verrouille le defilement de la page, ferme sur Echap, piege
  // Tab/Shift+Tab a l'interieur et se referme si la fenetre passe a `lg` pendant qu'il est ouvert
  // (sinon le defilement resterait bloque sans aucun moyen visible de le refermer au-dela de ce
  // point de rupture). Focus deplace dedans a l'ouverture.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const onDesktopChange = () => {
      if (desktopQuery.matches) setOpen(false);
    };
    desktopQuery.addEventListener("change", onDesktopChange);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        asideRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      desktopQuery.removeEventListener("change", onDesktopChange);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // `inert` retire les liens du tiroir ferme de l'ordre de tabulation sans dupliquer la logique
  // en CSS : au-dela de `lg`, le tiroir est toujours visible, `inert` ne s'applique donc qu'en
  // dessous via la media query du navigateur elle-meme.
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;
    const isMobileDrawerClosed = () =>
      !open && !window.matchMedia("(min-width: 1024px)").matches;
    const sync = () => {
      if (isMobileDrawerClosed()) aside.setAttribute("inert", "");
      else aside.removeAttribute("inert");
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [open]);

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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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
            className="text-text-primary/70 rounded-control cursor-pointer p-1 hover:bg-white/10 lg:hidden"
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
                        ? "text-text-primary bg-white/10"
                        : "text-text-primary/70 hover:text-text-primary hover:bg-white/5"
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

          <div className="mt-4 border-t border-white/10 pt-4">
            <Link
              href="/bde/reglages"
              onClick={() => setOpen(false)}
              aria-current={reglagesActive ? "page" : undefined}
              className={`rounded-control flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                reglagesActive
                  ? "text-text-primary bg-white/10"
                  : "text-text-primary/70 hover:text-text-primary hover:bg-white/5"
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

        <div className="border-t border-white/10 pt-4">
          <LogoutButton className="w-full justify-center" tone="dark" />
        </div>
      </aside>
    </>
  );
}
