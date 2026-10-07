"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    name: "Accueil",
    link: "/",
  },
  {
    name: "Catalogue",
    link: "/catalogue",
  },
  {
    name: "Filières",
    link: "/filiere",
  },
];

const Navbar = () => {
  const pathname = usePathname();
  return (
    <header className="px-4 py-8">
      <nav className="grid grid-cols-[1fr_auto_1fr] items-center">
        <Link
          className="text justify-self-start text-2xl font-extrabold"
          href="/"
        >
          Alexandria.
        </Link>

        <div className="flex gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.link;
            return (
              <Link
                key={link.name}
                className={`${isActive ? "underline" : ""}`}
                href={link.link}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
