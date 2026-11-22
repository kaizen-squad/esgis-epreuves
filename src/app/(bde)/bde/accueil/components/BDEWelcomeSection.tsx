import Link from "next/link";
import { FiArrowRight, FiLayers } from "@/components/icons";

const ACTION_CLASS =
  "bg-background-accent text-text-primary border-background-secondary rounded-control flex items-center justify-center gap-2 border px-4 py-3 font-medium transition-colors hover:opacity-90";

/** Poste de travail BDE (R-15) : les deux actions de depot en premier ecran, pas de chrome visiteur. */
const BDEWelcomeSection = () => {
  return (
    <div className="mb-10 w-full px-6 text-center">
      <h1 className="sub-title">Bienvenue sur Alexandria</h1>
      <h2 className="head-title mb-6">Versez vos épreuves</h2>

      <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
        <Link href="/bde/epreuves/ajouter" className={`${ACTION_CLASS} flex-1`}>
          Verser une épreuve <FiArrowRight />
        </Link>
        <Link href="/bde/epreuves/ajouter" className={`${ACTION_CLASS} flex-1`}>
          <FiLayers size={18} /> Verser en lot
        </Link>
      </div>
    </div>
  );
};

export default BDEWelcomeSection;
