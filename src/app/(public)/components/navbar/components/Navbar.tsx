"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { navLinks as defaultNavLinks } from "@/app/(public)/constants/navLinks";

type NavLink = {
  name: string;
  link: string;
};

type NavbarProps = {
  links?: NavLink[];
};

const Navbar = ({ links = defaultNavLinks }: NavbarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="px-4 py-8">
      <nav className="lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center justify-between">
          <Link
            className="text-text-title justify-self-start text-2xl font-extrabold"
            href="/"
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
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
