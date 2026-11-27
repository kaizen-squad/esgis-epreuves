"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** `false` pendant une operation en cours : Echap et clic sur le fond ne ferment plus. */
  dismissible?: boolean;
};

/**
 * Fenetre modale basee sur `<dialog>` + `showModal()` : le navigateur gere la couche
 * superieure, le fond, le piege du focus et son retour a l'element d'origine. Echap et un
 * clic sur le fond appellent `onClose` ; l'ouverture reste pilotee par `open`.
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  dismissible = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Echap : toujours bloque cote navigateur, la fermeture passe par `open`.
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        // Le contenu remplit la boite : un clic dont la cible est le <dialog> vient du fond.
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
      className="bg-background-primary rounded-card m-auto w-[calc(100%-2rem)] max-w-md p-0 shadow-xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <h2 id={titleId} className="text-text-title mb-3 text-lg font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
