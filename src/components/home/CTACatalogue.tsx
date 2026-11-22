import Link from "next/link";
import { FiArrowRight } from "@/components/icons";
import { BDE_BASE_PATH } from "@/components/layout/spaces";

/**
 * `catalogueHref` : catalogue cible du bouton (`/bde/catalogue` cote BDE), et sert aussi a
 * choisir le registre (tutoiement cote public, vouvoiement cote BDE, R-02).
 */
const CTACatalogue = ({
  catalogueHref = "/catalogue",
}: {
  catalogueHref?: string;
}) => {
  const isPublic = !catalogueHref.startsWith(BDE_BASE_PATH);

  return (
    <div className="bg-background-primary rounded-card mx-auto flex max-w-7xl flex-col px-6 pt-6 pb-10">
      <h3 className="text-text-secondary mb-3 text-center text-3xl font-semibold text-balance">
        {isPublic
          ? "Prépare tes examens dès aujourd'hui !"
          : "Préparez vos examens dès aujourd'hui !"}
      </h3>
      <p className="mb-5 text-center text-base leading-6 font-light">
        {isPublic
          ? "Entraîne-toi efficacement sur des annales complètes et prends le contrôle de tes résultats académiques."
          : "Entraînez-vous efficacement sur des annales complètes et prenez le contrôle de vos résultats académiques."}
      </p>
      <Link
        href={catalogueHref}
        className="bg-background-accent text-text-primary border-background-secondary rounded-control mx-auto flex w-fit items-center gap-2 border px-3 py-2 font-semibold transition-colors hover:opacity-90"
      >
        Voir le Catalogue <FiArrowRight />
      </Link>
    </div>
  );
};

export default CTACatalogue;
