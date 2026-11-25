import { useEffect, useRef, useState } from "react";

/**
 * Tiroir mobile accessible, partage par `AdminSidebar` et `BdeSidebar` (#163, #186) : verrouille
 * le defilement de la page a l'ouverture, ferme sur Echap, piege Tab/Shift+Tab a l'interieur, se
 * referme si la fenetre passe a `lg` pendant qu'il est ouvert (sinon le defilement resterait
 * bloque sans aucun moyen visible de le refermer au-dela de ce point de rupture), rend le focus au
 * bouton d'ouverture seulement en refermant (jamais au premier rendu, ou `open` vaut deja `false` :
 * sinon chaque chargement d'une page sous `lg` volerait le focus a ce bouton des le montage), et
 * retire du tiroir ferme les liens de l'ordre de tabulation via `inert` (au-dela de `lg`, le tiroir
 * est toujours visible, `inert` ne s'applique donc qu'en dessous via la media query elle-meme).
 */
export function useMobileDrawer() {
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const previousOpenRef = useRef(open);
  useEffect(() => {
    if (previousOpenRef.current && !open) openButtonRef.current?.focus();
    previousOpenRef.current = open;
  }, [open]);

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

  return { open, setOpen, asideRef, openButtonRef, closeButtonRef };
}
