"use client";

import Image from "next/image";
import { FiArrowRight } from "react-icons/fi";
import ImageHandler from "@/components/ui/ImageHandler";
import Link from "next/link";

const WelcomeSection = () => {
  return (
    <div className="mb-16 w-full text-center">
      <h1 className="sub-title">Bienvenue sur Alexandria</h1>
      <h2 className="head-title">Tes révisions commencent ici...</h2>
      <p className="text-text-default mb-7">
        Booste tes révisions grâce à nos annales et prends en main ton avenir
        académique en réussissant tous tes examens.
      </p>

      <Link
        href="/catalogue"
        className="bg-background-accent text-text-primary border-background-secondary rounded-control mx-auto mb-10 flex w-fit items-center gap-2 border px-4 py-2 transition-colors hover:opacity-90"
      >
        Voir le Catalogue <FiArrowRight />
      </Link>

      <ImageHandler
        image_url="/images/accueil_image3.png"
        image_alt="Esgis Image Accueil"
        image_className="object-cover object-top"
      />

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
        gratuits et accessibles même sans compte pour préparer{" "}
        <div className="relative my-auto hidden h-10 w-25 align-middle lg:inline-block">
          <Image
            src="/images/study.png"
            alt="Paragraphe image 1"
            className="hidden rounded-full object-cover lg:inline-block"

            fill
            sizes="(max-width: 768px) 100%, (max-width: 1200px) 100%"
          />
        </div>{" "}
        tes examens.
      </div>
    </div>
  );
};

export default WelcomeSection;
