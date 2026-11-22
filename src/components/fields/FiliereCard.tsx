import type { CSSProperties } from "react";
import Link from "next/link";
import { FiArrowRight } from "@/components/icons";

export type FiliereCardData = {
  level: string;
  field: string;
  examCount: number;
  href: string;
};

interface FiliereProps {
  className?: string;
  data: FiliereCardData;
  /** Rang du niveau dans sa filiere : place la languette (cinq crans, voir `.divider-tab`). */
  step: number;
}

/**
 * Intercalaire d'un couple niveau x filiere (voir `.divider-card` dans `globals.css`) : la
 * languette porte le niveau, la tranche des feuilles classees derriere depasse sous la carte.
 */
const FiliereCard = ({
  data: { level, field, examCount, href },
  step,
  // "block" (ou son equivalent responsive) vient toujours d'ici, jamais aussi du gabarit ci-dessous :
  // deux classes d'affichage sans prefixe sur le meme element se disputeraient la cascade.
  className = "block",
}: FiliereProps) => {
  return (
    <Link
      href={href}
      data-pile={Math.min(examCount, 3)}
      style={{ "--tab-step": step % 5 } as CSSProperties}
      className={`${className} divider-card group bg-background-primary rounded-card relative mt-10 px-5 py-4`}
    >
      <span className="binder-tab divider-tab text-text-secondary absolute bottom-full max-w-[calc(100%-2*var(--tab-inset))] px-4 py-1.5 text-lg leading-7 font-bold">
        {/* Troncature sur un enfant : sur la languette, `overflow` couperait ses conges. */}
        <span className="block truncate">{level}</span>
      </span>
      <span className="flex items-center justify-between gap-4">
        <span className="min-w-0">
          <span className="text-text-secondary group-hover:decoration-background-accent block truncate text-lg font-semibold uppercase underline decoration-transparent decoration-2 underline-offset-[0.3em] transition-colors">
            {field}
          </span>
          <span className="text-text-paragraph block text-sm">
            {examCount} fichier{examCount > 1 ? "s" : ""}
          </span>
        </span>
        <FiArrowRight
          aria-hidden="true"
          size={22}
          className="text-background-accent shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
};

export default FiliereCard;
