import Link from "next/link";
import { FiArrowRight } from "@/components/icons";

const ACTION_CLASS =
  "bg-background-accent text-text-primary border-background-secondary rounded-control flex items-center justify-center gap-2 border px-4 py-3 font-medium transition-colors hover:opacity-90";

/**
 * Poste de travail BDE (R-15) : l'action de depot en premier ecran, pas de chrome visiteur.
 * "Verser une épreuve" et "Verser en lot" menaient a la meme page (le formulaire gere deja le
 * lot) : un seul bouton, par souci de simplicite (loi de Hick, #174).
 */
const BDEWelcomeSection = ({ gapCount }: { gapCount: number }) => {
  return (
    <div className="mb-10 w-full px-6 text-center">
      <h1 className="head-title mb-2">Bienvenue sur Alexandria</h1>
      <h2 className="sub-title">Versez vos épreuves</h2>

      <div className="mx-auto flex max-w-md flex-col gap-3">
        <Link href="/bde/epreuves/ajouter" className={ACTION_CLASS}>
          Verser une épreuve <FiArrowRight />
        </Link>
        {gapCount > 0 ? (
          <Link
            href="/bde/filieres"
            className="text-text-paragraph hover:text-text-default text-sm underline"
          >
            {gapCount} matière{gapCount > 1 ? "s" : ""} sans épreuve archivée
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default BDEWelcomeSection;
