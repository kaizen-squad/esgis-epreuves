"use client";

import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";

const WelcomeSection = () => {
  return (
    <div className="mb-16 w-full text-center">
      <h1 className="text-text-title mb-6 font-medium">
        Bienvenue sur Alexandria
      </h1>
      <h2 className="text-text-secondary mb-6 text-3xl leading-10 font-semibold md:text-5xl md:leading-14 lg:text-7xl lg:leading-18">
        Tes révisions <br className="hidden md:block" />
        commencent ici...
      </h2>
      <p className="text-text-default mb-7">
        Boostez vos révisions grâce à nos annales et prenez en main votre avenir
        académique en <br className="hidden md:block" />
        réussissant tous vos examens.
      </p>

      <button className="bg-background-accent text-text-primary mx-auto mb-10 flex items-center gap-2 rounded-lg border border-black px-4 py-2">
        Voir le Catalogue <FiArrowRight />
      </button>

      <div className="relative mx-auto mb-16 h-90 w-full overflow-x-hidden md:h-180 lg:h-200">
        <Image
          src="/images/accueil_image2.png"
          alt="Esgis Image Accueil"
          fill
          className="object-cover object-top"
          sizes="(max-width: 1200px) 100%"
          loading="eager"
        />
      </div>

      <div className="mb-8 w-full px-6 text-center text-lg md:text-2xl lg:text-3xl">
        Des sujets{" "}
        <div className="relative hidden h-10 w-17.5 align-middle lg:inline-block">
          <Image
            src="/images/accueil_span_page.jpeg"
            alt="Paragraphe image 1"
            className="hidden rounded-full object-cover align-middle lg:inline-block"
            fill
            sizes="(max-width: 768px) 100%, (max-width: 1200px): 100%"
          />
        </div>{" "}
        gratuits et accessibles même <br className="hidden lg:block" /> sans
        compte pour préparer{" "}
        <div className="relative my-auto hidden h-10 w-25 align-middle lg:inline-block">
          <Image
            src="/images/study.png"
            alt="Paragraphe image 1"
            className="hidden rounded-full object-cover lg:inline-block"

            fill
            sizes="(max-width: 768px) 100%, (max-width: 1200px) 100%"
          />
        </div>{" "}
        vos examens.
      </div>
    </div>
  );
};

export default WelcomeSection;
