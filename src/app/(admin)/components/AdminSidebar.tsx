"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { IconType } from "react-icons";
import { FiGrid, FiList, FiMenu, FiUserPlus, FiX } from "react-icons/fi";
import LogoutButton from "@/components/layout/LogoutButton";

type AdminLink = {
  name: string;
  href: string;
  icon: IconType;
  isActive: (pathname: string) => boolean;
};

const ADMIN_LINKS: AdminLink[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: FiGrid,
    isActive: (pathname) => pathname === "/admin",
  },
  {
    name: "Membre BDE",
    href: "/admin/membres/ajouter",
    icon: FiUserPlus,
    isActive: (pathname) => pathname.startsWith("/admin/membres"),
  },
  {
    name: "Référentiels",
    href: "/admin/referentiels",
    icon: FiList,
    isActive: (pathname) => pathname.startsWith("/admin/referentiels"),
  },
];

/**
 * Navigation de l'espace Admin : barre laterale fixe sur grand ecran, tiroir ouvert par un bouton
 * sur mobile. Le bouton de deconnexion reste en bas de la barre.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="bg-background-primary flex items-center justify-between border-b border-gray-200 px-4 py-4 lg:hidden">
        <Link href="/admin" className="text-text-title text-xl font-extrabold">
          Alexandria.
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="bg-background-accent cursor-pointer rounded p-2"
        >
          <FiMenu size={22} color="#fff" />
        </button>
      </header>

      {open ? (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      ) : null}

      <aside
        className={`bg-background-primary fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 px-4 py-6 transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-10 flex items-center justify-between px-2">
          <div>
            <Link
              href="/admin"
              className="text-text-title text-2xl font-extrabold"
            >
              Alexandria.
            </Link>
            <p className="text-text-paragraph mb-0 text-xs font-medium tracking-wide uppercase">
              Espace administrateur
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="text-text-paragraph cursor-pointer rounded p-1 hover:bg-gray-100 lg:hidden"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav aria-label="Navigation administrateur" className="flex-1">
          <ul className="flex flex-col gap-1">
            {ADMIN_LINKS.map(({ name, href, icon: Icon, isActive }) => {
              const active = isActive(pathname);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-control flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-background-accent text-text-primary" : "text-text-default hover:bg-background-default"}`}
                  >
                    <Icon size={18} />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-gray-200 pt-4">
          <LogoutButton className="w-full justify-center" />
        </div>
      </aside>
    </>
  );
}
