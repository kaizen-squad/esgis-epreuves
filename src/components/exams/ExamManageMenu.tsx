"use client";

import Menu, { MenuItem } from "@/components/ui/Menu";
import { FiFileText, FiRotateCcw, FiTrash } from "react-icons/fi";

/**
 * Actions de gestion d'une epreuve, affichees sur `ExamCard` dans l'espace BDE (`manageable`).
 * Entrees visuelles seulement pour l'instant : le branchement vers les formulaires de
 * modification/remplacement et la suppression viendra dans une etape dediee.
 */
export default function ExamManageMenu() {
  return (
    <Menu>
      <MenuItem
        name={
          <span className="flex items-center gap-2 text-sm">
            <span>Modifier les données</span> <FiFileText />
          </span>
        }
      />
      <MenuItem
        name={
          <span className="flex items-center gap-2 text-sm">
            Remplacer l&apos;épreuve <FiRotateCcw />
          </span>
        }
      />
      <MenuItem
        name={
          <span className="text-background-accent flex items-center gap-2 text-sm">
            Supprimer l&apos;épreuve <FiTrash />
          </span>
        }
      />
    </Menu>
  );
}
