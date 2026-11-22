"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiMoreVertical } from "@/components/icons";

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

type MenuPosition = {
  top: number;
  left?: number;
  right?: number;
};

export default function Menu({
  children,
  label = "Options",
  align = "right",
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setIsOpen(false);
    setPosition(null);
  };

  const toggle = () => {
    if (isOpen) {
      close();
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPosition({
      top: rect.bottom + 8,
      ...(align === "right"
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
    });
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !dropdownRef.current?.contains(target)
      ) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={label}
        className="hover:bg-background-default rounded p-2"
      >
        <FiMoreVertical size={20} />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <div
            ref={dropdownRef}
            role="menu"
            onClick={close}
            style={position}
            className="bg-background-primary fixed z-50 min-w-48 overflow-hidden rounded-lg border border-gray-200 shadow-lg"
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}
