"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

/**
 * Lien "Annuler" des trois flux d'epreuve (#171) : navigue directement si rien n'a ete saisi,
 * sinon confirme l'abandon pour ne pas perdre une saisie (et les fichiers choisis) sans prevenir.
 */
export default function CancelAction({
  href,
  isDirty,
  label = "Annuler",
}: {
  href: string;
  /** Des donnees ont ete saisies (ou un fichier choisi) depuis l'ouverture du formulaire. */
  isDirty: boolean;
  label?: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => (isDirty ? setConfirmOpen(true) : router.push(href))}
        className="text-text-paragraph cursor-pointer px-2 py-2 hover:underline"
      >
        {label}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        title="Abandonner la saisie ?"
        description="Les données saisies et les fichiers choisis seront perdus."
        confirmLabel="Abandonner"
        tone="danger"
        onConfirm={() => router.push(href)}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
