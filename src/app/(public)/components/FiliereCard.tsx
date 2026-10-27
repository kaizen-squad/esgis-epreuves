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
    <div className={`${className} @container relative aspect-square w-full`}>
      <div className="text-text-primary absolute inset-x-[20%] top-[52%] z-10">
        <p className="mb-2 text-[clamp(0.875rem,7cqw,1rem)] font-semibold uppercase">
          {name}
        </p>
        <p className="text-lg font-medium text-gray-400">Épreuves</p>
      </div>
      <Image
        src="/images/filierecard.svg"
        alt="Filiere Carte"
        className="z-0 object-contain"
        fill
        loading="eager"
      />
      <div className="text-text-primary absolute inset-x-[20%] bottom-[8%] flex items-center justify-between md:bottom-[10%]">
        <div>
          <p className="whitespace-nowrap">
            <span className="text-[clamp(1.5rem,12cqw,2.5rem)] font-semibold">
              {num_epreuve}{" "}
            </span>
            <span>fichiers</span>
          </p>
        </div>
        <button className="cursor-pointer transition-all ease-in-out hover:scale-105">
          <FiArrowRightCircle
            className="bg-background-accent text-text-default rounded-full"
            size={40}
          />
        </button>
      </div>
    </div>
  );
};

export default FiliereCard;
