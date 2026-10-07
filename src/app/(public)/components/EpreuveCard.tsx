import Image from "next/image";
import { FiArrowRight, FiBook, FiClock, FiDownload } from "react-icons/fi";

interface EpreuveCard {
  img_src: string;
  name: string;
  year: number;
  matter: string;
  class: string;
  type: string;
}

const EpreuveCard = (data: EpreuveCard) => {
  return (
    <div className="bg-background-primary mb-6 w-full rounded-lg p-2 lg:w-1/3">
      <div className="relative mb-4 h-72 w-full">
        <Image
          src={data.img_src}
          alt={data.name}
          fill
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-base">
          <FiClock /> {`${data.year - 1} - ${data.year}`}
        </p>
        <p className="flex items-center gap-1.5 text-base">
          <FiBook />
          Gestion financière
        </p>
      </div>
      <p className="mb-4 text-xl font-medium">Devoir de gestion de Money</p>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium uppercase">L3 GESTION</p>
        <p className="font-medium text-gray-500">Rattrapes</p>
      </div>

      <div className="flex items-center justify-between">
        <button className="flex items-center">
          Télécharger <FiDownload />
        </button>
        <button>
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default EpreuveCard;
