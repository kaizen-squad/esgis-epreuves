import { SiSatellite } from "react-icons/si";
import ResumeCard from "./ResumeCard";

const ResultsResume = () => {
  return (
    <div>
      <div>
        <div>
          <h2 className="text-text-secondary mb-8 text-start text-4xl leading-7 font-semibold">
            Progrès <br />
            constants, réussite garantie
          </h2>
          <p className="text-text-default mb-8">
            La plateforme réunit tous vos sujets d&apos;examen pour vous
            entraîner facilement et booster vos notes. <br /> Des annales de
            qualité vous ouvrent la voie vers des diplômes réussis.
          </p>
        </div>
        <div className="flex flex-col gap-6">
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
      <div></div>
    </div>
  );
};

export default ResultsResume;
