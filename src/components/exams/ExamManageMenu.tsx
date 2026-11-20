"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CgSpinner } from "react-icons/cg";
import { FiFileText, FiRotateCcw, FiTrash } from "react-icons/fi";
import Menu, { MenuItem } from "@/components/ui/Menu";
import { deleteExam } from "@/features/exams/actions";

type ExamManageMenuProps = {
  id: string;
  slug: string;
  name: string;
};

/**
 * Actions de gestion d'une epreuve, affichees sur `ExamCard` dans l'espace BDE (`manageable`).
 * Modifier et Remplacer menent aux pages dediees ; Supprimer demande une confirmation puis
 * appelle `deleteExam` et recharge les donnees de la page.
 */
export default function ExamManageMenu({
  id,
  slug,
  name,
}: ExamManageMenuProps) {
  const router = useRouter();
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Supprimer définitivement l'épreuve « ${name} » ? Cette action est irréversible.`,
    );
    if (!confirmed) return;

    startDelete(async () => {
      const result = await deleteExam(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (isDeleting) {
    return (
      <span
        className="flex items-center gap-1 p-2"
        role="status"
        aria-live="polite"
      >
        <CgSpinner className="animate-spin" size={16} />
        Suppression…
      </span>
    );
  }

  return (
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
        onClick={handleDelete}
        name={
          <span className="text-background-accent flex items-center gap-2 text-sm">
            Supprimer l&apos;épreuve <FiTrash />
          </span>
        }
      />
    </Menu>
  );
}
