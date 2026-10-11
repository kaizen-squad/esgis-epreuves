import Image from "next/image";
import { FiBook, FiClock, FiDownload } from "react-icons/fi";

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
    <div className="w-full">
      <div className="relative mb-4 h-64 w-full">
        <Image
          src={data.img_src}
          alt={data.name}
          fill
          sizes="(max-width: 768px) auto, (max-width: 1200px) auto"
          className="rounded-lg object-cover"
          loading="eager"
        />
      </div>
      <div className="mb-4 flex items-start justify-between">
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
      <p className="mb-6 line-clamp-1 max-w-3/4 text-base font-medium">
        {data.name}
      </p>

      <div className="flex items-center justify-between">
        <p className="font-medium uppercase">L3 GESTION</p>
        <p className="font-medium text-gray-500">{data.type}</p>
        <button className="bg-background-accent text-text-primary flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1">
          Télécharger <FiDownload />
        </button>
      </div>
    </div>
  );
};

export default EpreuveCard;
