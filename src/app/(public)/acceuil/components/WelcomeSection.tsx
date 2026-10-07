"use client";

import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

const WelcomeSection = () => {
  const width = window.innerWidth;
  return (
    <div className="mb-10 w-full text-center">
      <h1 className="text-text-title text- mb-8 font-medium">
        Bienvenue sur Alexandria
      </h1>
      <h2 className="text-text-secondary mb-6 text-3xl leading-9 font-semibold">
        Tes révisions commencent ici...
      </h2>
      <p className="text-text-default mb-7">
        Boostez vos révisions grâce à nos annales et prenez en main votre avenir
        académique en réussissant tous vos examens.
      </p>

      <button className="bg-background-accent text-text-primary mx-auto mb-6 flex items-center gap-2 rounded-lg border border-black px-4 py-2">
        Voir le Catalogue <FiArrowRight />
      </button>

      <div className="relative">
        <Image
          src="/images/accueil_image.png"
          alt="Esgis Image Accueil"
          width={width}
          height={50}
        />
      </div>
    </div>
  );
};

export default WelcomeSection;
