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
    <div className="bg-background-primary mb-6 w-full rounded-lg p-3 lg:w-1/3">
      <div className="relative mb-4 h-64 w-full">
        <Image
          src={data.img_src}
          alt={data.name}
          fill
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <div className="mb-3 flex items-start justify-between">
        <p className="flex w-1/2 shrink-0 items-center gap-1.5 text-sm">
          <FiClock size={18} className="shrink-0" />{" "}
          {`${data.year - 1} - ${data.year}`}
        </p>
        <span
          className="flex min-w-0 items-start gap-1.5 truncate text-sm"
          title={data.matter}
        >
          <FiBook size={18} className="shrink-0" />
          {data.matter}
        </span>
      </div>
      <p className="mb-4 line-clamp-2 max-w-2/3 text-base font-medium">
        {data.name}
      </p>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-medium uppercase">L3 GESTION</p>
        <p className="font-medium text-gray-500">{data.type}</p>
      </div>

      <div className="flex items-center justify-between">
        <button className="bg-background-accent text-text-primary flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1">
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
