import { FiCompass, FiLayers } from "@/components/icons";
import ResumeCard from "@/components/home/ResumeCard";
import Image from "next/image";

const ResultsResume = () => {
  return (
    <div className="mx-auto mb-20 flex w-fit flex-col items-center gap-10 lg:flex-row lg:gap-20">
      <div className="lg:flex lg:flex-col lg:justify-between">
        <div>
          <h2 className="text-text-secondary mb-8 text-start text-4xl leading-7 font-semibold text-balance lg:text-5xl lg:leading-10">
            Progrès constants, réussite garantie
          </h2>
          <p className="text-text-default mb-8 w-2/3 text-sm font-light lg:text-base xl:text-lg">
            La plateforme réunit tous vos sujets d&apos;examen pour vous
            entraîner facilement et booster vos notes. Des annales de qualité
            vous ouvrent la voie vers des diplômes réussis.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <ResumeCard
            icon={<FiLayers size={20} />}
            title="Ressources exhaustives"
            text="Accédez à notre sélection de sujets et ressources clés pour réussir vos examens."
          />
          <ResumeCard
            icon={<FiCompass size={20} />}
            title="Un parcours adapté"
            text="Notre espace propose des épreuves, adaptées à votre parcours."
          />
        </div>
      </div>
      <div className="relative aspect-square w-full max-w-145 overflow-hidden rounded-2xl">
        <Image
          src="/images/resume_image2.png"
          alt="Esgis Résumé Image"
          fill
          sizes="(max-width: 768px) 100%"
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default ResultsResume;
