"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiUserCheck, FiUserX } from "react-icons/fi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { setBdeMemberActive } from "@/features/members/actions";

/**
 * Bouton « Désactiver » (membre actif) ou « Activer » (membre désactivé) d'une ligne du tableau.
 * Ouvre une confirmation ; en cas de succès la liste est rechargée (le membre change de statut et
 * de place), en cas d'échec l'erreur s'affiche dans la fenêtre pour réessayer.
 */
export default function MemberStatusButton({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const label = isActive ? "Désactiver" : "Activer";
  const Icon = isActive ? FiUserX : FiUserCheck;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await setBdeMemberActive(id, !isActive);
      } catch {
        setError(
          "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.",
        );
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        aria-label={`${label} ${name}`}
        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
          isActive
            ? "border-red-200 text-red-700 hover:bg-red-50"
            : "border-green-200 text-green-700 hover:bg-green-50"
        }`}
      >
        <Icon size={13} /> {label}
      </button>

      <ConfirmDialog
        open={open}
        title={isActive ? "Désactiver ce membre ?" : "Réactiver ce membre ?"}
        description={
          isActive ? (
            <p className="mb-0">
              <strong>{name}</strong> ne pourra plus se connecter ni gérer les
              épreuves. Les épreuves déjà déposées restent en ligne. Vous
              pourrez réactiver ce compte à tout moment.
            </p>
          ) : (
            <p className="mb-0">
              <strong>{name}</strong> pourra de nouveau se connecter avec ses
              identifiants actuels et gérer les épreuves.
            </p>
          )
        }
        confirmLabel={label}
        tone={isActive ? "danger" : "default"}
        pending={pending}
        error={error}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
