"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiFileText, FiRotateCcw, FiTrash } from "react-icons/fi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Menu, { MenuItem } from "@/components/ui/Menu";
import { deleteExam } from "@/features/exams/actions";

type ExamManageMenuProps = {
  id: string;
  slug: string;
  name: string;
};

/**
 * Actions de gestion d'une epreuve, affichees sur `ExamCard` dans l'espace BDE (`manageable`).
 * Modifier et Remplacer menent aux pages dediees. Supprimer ouvre une fenetre de confirmation :
 * en cas de succes elle se ferme et la page se recharge, en cas d'echec l'erreur s'affiche dans
 * la fenetre, qui reste ouverte pour reessayer ou annuler.
 */
export default function ExamManageMenu({
  id,
  slug,
  name,
}: ExamManageMenuProps) {
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
      const result = await deleteExam(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Menu label={`Gérer l'épreuve ${name}`}>
        <MenuItem
          href={`/bde/epreuves/${slug}/modifier`}
          name={
            <span className="flex items-center gap-2 text-sm">
              <span>Modifier les données</span> <FiFileText />
            </span>
          }
        />
        <MenuItem
          href={`/bde/epreuves/${slug}/remplacer`}
          name={
            <span className="flex items-center gap-2 text-sm">
              Remplacer l&apos;épreuve <FiRotateCcw />
            </span>
          }
        />
        <MenuItem
          onClick={openConfirm}
          name={
            <span className="text-background-accent flex items-center gap-2 text-sm">
              Supprimer l&apos;épreuve <FiTrash />
            </span>
          }
        />
      </Menu>

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
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
