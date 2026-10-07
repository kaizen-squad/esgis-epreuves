"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

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
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="px-4 py-8">
      <nav className="md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center justify-between">
          <Link
            className="text text-text-title justify-self-start text-2xl font-extrabold"
            href="/"
          >
            Alexandria.
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-background-accent rounded p-2 md:hidden"
          >
            {isOpen ? (
              <FiX size={24} color="#fff" />
            ) : (
              <FiMenu size={24} color="#fff" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="flex flex-col">
            {navLinks.map((link) => {
              const isActive = pathname === link.link;
              return (
                <Link
                  key={link.name}
                  className={`${isActive ? "underline" : ""} hover hover:bg-background-default py-2 text-center`}
                  href={link.link}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
