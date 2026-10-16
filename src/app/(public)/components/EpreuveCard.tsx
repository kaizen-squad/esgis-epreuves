import Image from "next/image";
import { FiDownload, FiEye, FiFile } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";

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
    <div className="bg-background-primary w-full overflow-hidden rounded-lg border border-gray-300 pb-1">
      <div className="relative aspect-2/1 w-full bg-red-300">
        <span className="bg-background-primary absolute top-3 right-2 z-1 flex items-center gap-1 rounded-full px-2 py-1 text-sm">
          <span className="flex items-center gap-1">
            <FiFile /> PDF
          </span>{" "}
          - <span>3 pages</span>
        </span>
        <Image
          src="/images/study.png"
          alt="Epreuve Image"
          fill
          loading="eager"
          className="z-0 object-cover"
        />
      </div>
      <div className="px-4 py-2">
        <div className="-2 mb-4 flex items-center justify-between text-sm lg:text-base">
          <div className="flex items-center gap-2">
            <span>Licence 2</span>
            <GoDotFill size={10} />
            <span>AL</span>
          </div>
          <span className="rounded-full border border-red-500 px-2 font-medium">
            Rattrapages
          </span>
        </div>
        <p className="mb-4 line-clamp-1 text-xl font-semibold lg:text-2xl">
          {data.name}
        </p>
        <div className="mb-4 flex items-center gap-2 text-sm lg:text-base">
          <span>2024-2025</span>
          <GoDotFill size={10} />
          <span>1,6 Mo</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <button className="border-background-secondary text-text-default flex w-1/2 cursor-pointer items-center justify-center gap-1 rounded-lg border py-2">
            <FiEye size={20} />
            Visualiser
          </button>
          <button className="border-background-secondary bg-background-secondary text-text-primary flex w-1/2 cursor-pointer items-center justify-center gap-1 rounded-lg border py-2">
            <FiDownload />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
};

export default EpreuveCard;
