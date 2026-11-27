"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { FiList, FiMenu, FiUsers, FiUserPlus, FiX } from "react-icons/fi";
import LogoutButton from "@/components/layout/LogoutButton";
import { useMobileDrawer } from "@/components/layout/useMobileDrawer";

type AdminLink = {
  name: string;
  href: string;
  icon: IconType;
  isActive: (pathname: string) => boolean;
};

const ADMIN_LINKS: AdminLink[] = [
  {
    // Renomme de "Dashboard" (#166) : cet ecran ne gere que les comptes BDE, pas un tableau de
    // bord du fonds, et son nom doit le dire.
    name: "Membres",
    href: "/admin",
    icon: FiUsers,
    isActive: (pathname) => pathname === "/admin",
  },
  {
    // Mene directement au formulaire, pas a une liste : le libelle le dit maintenant explicitement
    // (#163), et l'etat actif ne se declenche plus que sur ce formulaire precis (plus de faux
    // positif sur l'edition d'un membre ou une 404 sous /admin/membres/*).
    name: "Ajouter un membre",
    href: "/admin/membres/ajouter",
    icon: FiUserPlus,
    isActive: (pathname) => pathname === "/admin/membres/ajouter",
  },
  {
    name: "Référentiels",
    href: "/admin/referentiels",
    icon: FiList,
    isActive: (pathname) => pathname.startsWith("/admin/referentiels"),
  },
];

const SIDEBAR_ID = "admin-sidebar";

/**
 * Navigation de l'espace Admin (#163) : barre laterale sombre fixe sur grand ecran, tiroir ouvert
 * par un bouton sur mobile. Le marine (`background-secondary`) est le meme que celui deja utilise
 * par le footer et les coques publique/BDE : une identite propre a l'Admin sans en inventer une
 * nouvelle, et sans la DA « Archives » (classeur, grain papier) qui n'a pas sa place dans un outil
 * ponctuel et technique.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const { open, setOpen, asideRef, openButtonRef, closeButtonRef } =
    useMobileDrawer();

  return (
    <>
      <header className="bg-background-secondary flex items-center justify-between px-4 py-4 lg:hidden">
        <Link
          href="/admin"
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
              href="/admin"
              className="text-text-primary text-2xl font-extrabold"
            >
              Alexandria<span className="text-background-accent">.</span>
            </Link>
            <p className="text-text-primary/60 mb-0 text-xs font-medium tracking-wide uppercase">
              Espace administrateur
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

        <nav aria-label="Navigation administrateur" className="flex-1">
          <ul className="flex flex-col gap-1">
            {ADMIN_LINKS.map(({ name, href, icon: Icon, isActive }) => {
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
        </nav>

        <div className="border-text-primary/10 border-t pt-4">
          <LogoutButton className="w-full justify-center" tone="dark" />
        </div>
      </aside>
    </>
  );
}
