"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteExam } from "@/features/exams/actions";

/**
 * Suppression d'une epreuve avec confirmation, partagee par `ExamManageMenu` (menu de carte) et
 * `ExamDeleteButton` (bloc Gestion de la fiche, #176) : seul l'affichage du declencheur differe.
 *
 * `onDeleted` decide de la suite apres un succes : la carte d'une liste se contente d'un
 * `router.refresh()` (defaut), mais la fiche de l'epreuve supprimee ne peut pas se contenter de
 * ca, `getExamCached` n'y trouvant plus rien, `notFound()` y renverrait une 404 au lieu de
 * confirmer la suppression (revue de code, #176, apres coup).
 */
export function useDeleteExamConfirm(id: string, onDeleted?: () => void) {
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
        if (onDeleted) onDeleted();
        else router.refresh();
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
