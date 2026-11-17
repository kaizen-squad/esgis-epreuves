"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiMoreVertical } from "react-icons/fi";

type MenuItemProps = {
  name: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
};

export function MenuItem({ name, href, onClick, icon }: MenuItemProps) {
  const className =
    "flex w-full items-center gap-3 px-4 py-2 text-left text-text-default hover:bg-background-default";

  if (href) {
    return (
      <Link href={href} className={className} role="menuitem">
        {icon}
        <span>{name}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      role="menuitem"
    >
      {icon}
      <span>{name}</span>
    </button>
  );
}

type MenuProps = {
  children: React.ReactNode;
  label?: string;
  align?: "left" | "right";
};

export default function Menu({
  children,
  label = "Options",
  align = "right",
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        className="hover:bg-background-default rounded p-2"
      >
        <FiMoreVertical size={20} />
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`bg-background-primary absolute z-20 mt-2 min-w-48 overflow-hidden rounded-lg border border-gray-200 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
