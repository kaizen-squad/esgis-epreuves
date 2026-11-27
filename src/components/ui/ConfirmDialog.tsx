"use client";

import type { ReactNode } from "react";
import { CgSpinner } from "react-icons/cg";
import Modal from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` : action destructrice, bouton de confirmation en couleur d'accent. */
  tone?: "default" | "danger";
  /** Operation en cours : boutons desactives, fermeture bloquee. */
  pending?: boolean;
  /** Echec de l'operation, affiche dans la fenetre pour permettre de reessayer. */
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Fenetre de confirmation, remplace `window.confirm` et l'`alert` d'erreur qui le suivait. */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Annuler",
  tone = "default",
  pending = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmClassName =
    tone === "danger" ? "btn-primary" : "btn-primary bg-background-secondary";

  return (
    <Modal open={open} onClose={onCancel} title={title} dismissible={!pending}>
      <div className="text-text-paragraph text-sm">{description}</div>

      {error ? (
        <p
          role="alert"
          className="rounded-control border-error/30 bg-error/10 text-error mt-4 border p-3 text-sm"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="btn-secondary"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={confirmClassName}
        >
          {confirmLabel}
          {pending ? <CgSpinner className="animate-spin" size={16} /> : null}
        </button>
      </div>
    </Modal>
  );
}
