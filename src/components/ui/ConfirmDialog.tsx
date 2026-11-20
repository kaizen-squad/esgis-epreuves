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
    tone === "danger"
      ? "bg-background-accent text-text-primary"
      : "bg-background-secondary text-text-primary";

  return (
    <Modal open={open} onClose={onCancel} title={title} dismissible={!pending}>
      <div className="text-text-paragraph text-sm">{description}</div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="text-text-default cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={`${confirmClassName} flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {confirmLabel}
          {pending ? <CgSpinner className="animate-spin" size={16} /> : null}
        </button>
      </div>
    </Modal>
  );
}
