"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { FiCheckCircle, FiSlash } from "react-icons/fi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { ActionResult } from "@/lib/action-result";

/**
 * Bouton « Désactiver » (element actif) ou « Activer » (element desactive) d'une ligne de
 * tableau, generique a tout element admin dote d'un `is_active` (membre BDE, filiere, niveau,
 * matiere, option). Ouvre une confirmation ; en cas de succes la liste est rechargee, en cas
 * d'echec l'erreur s'affiche dans la fenetre pour reessayer.
 */
export default function ActiveToggleButton({
  id,
  name,
  isActive,
  setActive,
  title,
  description,
}: {
  id: string;
  name: string;
  isActive: boolean;
  setActive: (id: string, isActive: boolean) => Promise<ActionResult<unknown>>;
  title: (active: boolean) => string;
  description: (active: boolean) => ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const label = isActive ? "Désactiver" : "Activer";
  const Icon = isActive ? FiSlash : FiCheckCircle;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      let result;
      try {
        result = await setActive(id, !isActive);
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
        className={`rounded-control flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-xs font-medium ${
          isActive
            ? "border-red-200 text-red-700 hover:bg-red-50"
            : "border-green-200 text-green-700 hover:bg-green-50"
        }`}
      >
        <Icon size={13} /> {label}
      </button>

      <ConfirmDialog
        open={open}
        title={title(isActive)}
        description={description(isActive)}
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
