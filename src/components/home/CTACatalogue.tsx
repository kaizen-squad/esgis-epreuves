import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

/** `catalogueHref` : catalogue cible du bouton (`/bde/catalogue` cote BDE). */
const CTACatalogue = ({
  catalogueHref = "/catalogue",
}: {
  catalogueHref?: string;
}) => {
  return (
    <div className="bg-background-primary mx-auto flex max-w-7xl flex-col rounded-[var(--radius-card)] px-6 pt-6 pb-10">
      <h3 className="text-text-secondary mb-3 text-center text-3xl font-semibold text-balance">
        Préparez vos examens dès aujourd&apos;hui !
      </h3>
      <p className="mb-5 text-center text-base leading-6 font-light">
        Entraînez-vous efficacement sur des annales complètes et prenez le
        contrôle de vos résultats académiques.
      </p>
      <Link
        href={catalogueHref}
        className="bg-background-accent text-text-primary border-background-secondary mx-auto flex w-fit items-center gap-2 rounded-[var(--radius-control)] border px-3 py-2 font-semibold transition-colors hover:opacity-90"
      >
        Voir le Catalogue <FiArrowRight />
      </Link>
    </div>
  );
};

export default CTACatalogue;
