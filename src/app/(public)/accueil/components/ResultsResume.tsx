import { SiSatellite } from "react-icons/si";
import ResumeCard from "./ResumeCard";
import Image from "next/image";

const ResultsResume = () => {
  return (
    <div className="mb-20 flex flex-col gap-10 lg:flex-row lg:gap-20 xl:px-30">
      <div className="lg:flex lg:flex-col lg:justify-between">
        <div>
          <h2 className="text-text-secondary mb-8 text-start text-4xl leading-7 font-semibold lg:text-5xl lg:leading-10">
            Progrès <br className="lg:hidden" />
            constants, réussite garantie
          </h2>
          <p className="text-text-default mb-8 w-2/3 text-sm font-light lg:text-base xl:text-lg">
            La plateforme réunit tous vos sujets d&apos;examen pour vous
            entraîner facilement et booster vos notes. <br /> Des annales de
            qualité vous ouvrent la voie vers des diplômes réussis.
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <ResumeCard
            icon={<SiSatellite size={20} />}
            title="Ressources exhaustives"
            text="Accédez à notre sélection de sujets et ressources clés pour réussir vos examens."
          />
          <ResumeCard
            icon={<SiSatellite size={20} />}
            title="Ressources exhaustives"
            text="Accédez à notre sélection de sujets et ressources clés pour réussir vos examens."
          />
        </div>
      </div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
        <Image
          src="/images/resume_image.png"
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
