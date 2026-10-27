import { FiArrowRight } from "react-icons/fi";

const CTACatalogue = () => {
  return (
    <div className="bg-background-primary mx-auto flex max-w-7xl flex-col rounded-lg px-6 pt-6 pb-10">
      <h3 className="text-text-secondary mb-3 text-center text-3xl font-semibold">
        Préparez vos examens dès aujourd&apos;hui !
      </h3>
      <p className="mb-5 text-center text-base leading-6 font-extralight">
        Entraînez-vous efficacement sur des annales complètes et prenez le
        contrôle de vos résultats académiques.
      </p>
      <button className="bg-background-accent text-text-primary border-background-secondary mx-auto flex w-fit items-center gap-2 rounded-lg border px-3 py-2 font-semibold">
        Voir le Catalogue <FiArrowRight />
      </button>
    </div>
  );
};

export default CTACatalogue;
