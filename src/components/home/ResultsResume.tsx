import { FiCompass, FiLayers } from "@/components/icons";
import ResumeCard from "@/components/home/ResumeCard";
import type { SpaceBasePath } from "@/components/layout/spaces";
import Image from "next/image";

/**
 * Tutoiement cote public, vouvoiement cote BDE (lexique fixe par R-02) : partage entre les deux
 * espaces, le registre suit `basePath` plutot qu'un texte fige.
 */
const ResultsResume = ({ basePath = "" }: { basePath?: SpaceBasePath }) => {
  const isPublic = basePath === "";

  return (
    <div className="mx-auto mb-20 flex w-fit flex-col items-center gap-10 lg:flex-row lg:gap-20">
      <div className="lg:flex lg:flex-col lg:justify-between">
        <div>
          <h2 className="text-text-secondary mb-8 text-start text-4xl leading-7 font-semibold text-balance lg:text-5xl lg:leading-10">
            Des annales classées, pas éparpillées
          </h2>
          <p className="text-text-default mb-8 w-2/3 text-sm font-light lg:text-base xl:text-lg">
            {isPublic ? (
              <>
                Chaque épreuve est rangée par filière, niveau, matière, année et
                session : tu retrouves en quelques secondes exactement ce
                qu&apos;il te faut pour réviser.
              </>
            ) : (
              <>
                Chaque épreuve est rangée par filière, niveau, matière, année et
                session : vous retrouvez en quelques secondes exactement ce
                qu&apos;il vous faut.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <ResumeCard
            icon={<FiLayers size={20} />}
            title="Toutes les années, toutes les sessions"
            text={
              isPublic
                ? "Contrôles continus, rattrapages, plusieurs années : de quoi varier tes révisions."
                : "Contrôles continus, rattrapages, plusieurs années : de quoi varier vos révisions."
            }
          />
          <ResumeCard
            icon={<FiCompass size={20} />}
            title="Filtré par filière et niveau"
            text={
              isPublic
                ? "Sélectionne ta filière et ton niveau : seules les épreuves qui te concernent s'affichent."
                : "Sélectionnez votre filière et votre niveau : seules les épreuves qui vous concernent s'affichent."
            }
          />
        </div>
      </div>
      <div className="relative aspect-square w-full max-w-145 overflow-hidden rounded-2xl">
        <Image
          src="/images/resume_image_bureau.png"
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
