"use client";

import { FiCompass } from "@/components/icons";
import { useClasseur } from "@/features/classeur/useClasseur";
import type { PinnedField } from "@/features/classeur/types";

/** Epingle ou desepingle cette filiere comme "Ma filiere" sur l'accueil (R-11). */
export default function PinFieldButton({ field }: { field: PinnedField }) {
  const { state, pinField } = useClasseur();
  const isPinned = state.pinnedField?.id === field.id;

  return (
    <button
      type="button"
      aria-pressed={isPinned}
      onClick={() => pinField(isPinned ? null : field)}
      className="text-text-default mx-auto mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
    >
      <FiCompass size={16} />
      {isPinned ? "Filière épinglée" : "Épingler cette filière"}
    </button>
  );
}
