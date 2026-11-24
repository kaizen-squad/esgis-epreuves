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
  /** Rang du niveau dans sa filiere : teinte du bord de l'intercalaire (cinq tons, voir `.divider-edge`). */
  step: number;
}

/**
 * Intercalaire d'un couple niveau x filiere (voir `.divider-card` dans `globals.css`) : le niveau
 * est imprime sur son bord renforce, la tranche des feuilles classees derriere depasse sous la carte.
 */
const FiliereCard = ({
  data: { level, field, examCount, href },
  step,
  // "flex" (ou son equivalent responsive) vient toujours d'ici, jamais aussi du gabarit ci-dessous :
  // deux classes d'affichage sans prefixe sur le meme element se disputeraient la cascade.
  className = "flex",
}: FiliereProps) => {
  return (
    <Link
      href={href}
      data-pile={Math.min(examCount, 3)}
      style={{ "--tab-step": Math.min(step, 4) } as CSSProperties}
      className={`${className} divider-card divider-edge group rounded-card relative items-stretch`}
    >
      {/* Sous 640px, bord et marges se resserrent : "GESTION" tient en entier des 320px. */}
      <span className="text-text-secondary flex w-12 shrink-0 items-center justify-center pr-0.5 pl-1.5 text-lg leading-none font-bold tabular-nums sm:w-15 sm:pr-1 sm:pl-2 sm:text-xl">
        <span className="block truncate">{level}</span>
      </span>
      <span className="divider-sheet bg-background-primary rounded-card flex min-w-0 flex-1 items-center justify-between gap-2 py-4 pr-3 pl-3 sm:gap-4 sm:pr-5 sm:pl-4">
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
