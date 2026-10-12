import Image from "next/image";
import { FiArrowRightCircle } from "react-icons/fi";

interface FiliereProps {
  className?: string;
  data: {
    id: number;
    name: string;
    num_epreuve: number;
  };
}

const FiliereCard = ({
  data: { name, num_epreuve },
  className,
}: FiliereProps) => {
  return (
    <div className={`${className} relative h-100 w-full`}>
      <div className="text-text-primary absolute top-[52%] left-[18%] z-10">
        <p className="mb-2 text-xl font-semibold uppercase">{name}</p>
        <p className="text-lg font-medium text-gray-400">Épreuves</p>
      </div>
      <Image
        src="/images/filierecard.svg"
        alt="Filiere Carte"
        className="z-0 object-cover md:object-contain"
        fill
        loading="eager"
      />
      <div className="text-text-primary absolute bottom-[8%] left-[50%] flex translate-x-[-50%] items-center justify-between gap-30">
        <div>
          <p className="whitespace-nowrap">
            <span className="text-4xl font-semibold">{num_epreuve} </span>
            <span>fichiers</span>
          </p>
        </div>
        <FiArrowRightCircle
          className="bg-background-accent text-text-default rounded-full"
          size={40}
        />
      </div>
    </div>
  );
};

export default FiliereCard;
