"use client";

import Link from "next/link";
import { FiCompass } from "@/components/icons";
import { useClasseur } from "@/features/classeur/useClasseur";

/**
 * Lien "Ma filiere" de l'accueil (R-11) : vers la filiere epinglee quand il y en a une, vers la
 * liste des filieres sinon. Le repli s'affiche aussi au rendu serveur (etat vide), donc pas
 * d'erreur d'hydratation.
 */
export default function MaFiliereLink() {
  const { state } = useClasseur();
  const pinned = state.pinnedField;

  return (
    <Link
      href={pinned ? `/filieres/${pinned.id}` : "/filieres"}
      className="text-text-default inline-flex items-center gap-2 text-sm font-medium hover:underline"
    >
      <FiCompass size={16} />{" "}
      {pinned ? `Ma filière : ${pinned.name}` : "Ma filière"}
    </Link>
  );
}
