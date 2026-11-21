import ImageHandler from "@/components/ui/ImageHandler";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const BDEWelcomeSection = () => {
  return (
    <div className="mb-16 w-full text-center">
      <h1 className="sub-title">Bienvenue sur Alexandria</h1>
      <h2 className="head-title">
        Simplifiez le gestion <br className="hidden md:block" />
        des Epreuves
      </h2>
      <p className="text-text-default mb-7">
        Enrichissez notre banque d&apos;épreuves pour offrir aux étudiants un
        outil de révision idéal et <br className="hidden md:block" />
        maximiser leur réussite.
      </p>

      <Link
        href="/bde/epreuves/ajouter"
        className="bg-background-accent text-text-primary mx-auto mb-10 flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-black px-4 py-2"
      >
        Ajouter une épreuve <FiArrowRight />
      </Link>

      <ImageHandler
        image_url="/images/accueil_image3.png"
        image_alt="Esgis Image Accueil"
        image_className="object-cover object-top"
      />

      <div className="mb-8 w-full px-6 text-center text-lg md:text-2xl lg:text-3xl">
        Une gestion{" "}
        <div className="relative hidden h-10 w-17.5 align-middle lg:inline-block">
          <Image
            src="/images/accueil_span_page.jpeg"
            alt="Paragraphe image 1"
            className="hidden rounded-full object-cover align-middle lg:inline-block"
            fill
            sizes="(max-width: 768px) 100%, (max-width: 1200px): 100%"
          />
        </div>{" "}
        simple et rapide de toutes <br className="hidden lg:block" /> les
        annales pour aider{" "}
        <div className="relative my-auto hidden h-10 w-25 align-middle lg:inline-block">
          <Image
            src="/images/study.png"
            alt="Paragraphe image 1"
            className="hidden rounded-full object-cover lg:inline-block"

            fill
            sizes="(max-width: 768px) 100%, (max-width: 1200px) 100%"
          />
        </div>{" "}
        vos étudiants.
      </div>
    </div>
  );
};

export default BDEWelcomeSection;
