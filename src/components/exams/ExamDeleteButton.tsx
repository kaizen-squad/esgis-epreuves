"use client";

import { useRouter } from "next/navigation";
import { FiTrash } from "react-icons/fi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useDeleteExamConfirm } from "./useDeleteExamConfirm";

/**
 * Supprimer l'epreuve depuis le bloc "Gestion" de sa propre fiche (#176) : jusqu'ici possible
 * seulement depuis le menu de la carte dans les listes.
 */
export default function ExamDeleteButton({
  id,
  name,
  className,
  redirectTo,
}: {
  id: string;
  name: string;
  className: string;
  /**
   * Page de la fiche elle-meme : un succes ne peut pas se contenter d'un `router.refresh()` (la
   * fiche n'existe plus, 404 au lieu de confirmer la suppression). On redirige plutot ici.
   */
  redirectTo: string;
}) {
  const router = useRouter();
  const {
    confirmOpen,
    error,
    isDeleting,
    openConfirm,
    handleConfirm,
    closeConfirm,
  } = useDeleteExamConfirm(id, () => router.replace(redirectTo));

  return (
    <>
      <button type="button" onClick={openConfirm} className={className}>
        <FiTrash size={16} /> Supprimer l&apos;épreuve
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer l'épreuve ?"
        description={
          <p>
            L&apos;épreuve{" "}
            <strong className="text-text-default">« {name} »</strong> et son
            fichier PDF seront supprimés définitivement. Cette action est
            irréversible.
          </p>
        }
        confirmLabel={isDeleting ? "Suppression…" : "Supprimer"}
        tone="danger"
        pending={isDeleting}
        error={error}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
}
