"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteExam } from "@/features/exams/actions";

/**
 * Suppression d'une epreuve avec confirmation, partagee par `ExamManageMenu` (menu de carte) et
 * `ExamDeleteButton` (bloc Gestion de la fiche, #176) : seul l'affichage du declencheur differe.
 */
export function useDeleteExamConfirm(id: string) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const openConfirm = () => {
    setError(null);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setError(null);
    startDelete(async () => {
      try {
        const result = await deleteExam(id);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setConfirmOpen(false);
        router.refresh();
      } catch {
        // #176 : une coupure reseau pendant la suppression faisait planter la page (pas de
        // try/catch) au lieu d'afficher l'erreur dans la fenetre, comme les autres actions.
        setError(
          "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.",
        );
      }
    });
  };

  return {
    confirmOpen,
    error,
    isDeleting,
    openConfirm,
    handleConfirm,
    closeConfirm: () => setConfirmOpen(false),
  };
}
