import Image from "next/image";
import { FiCalendar, FiDownload, FiEye, FiFileText } from "react-icons/fi";
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
    <article className="group bg-background-primary flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg">
      <div className="relative aspect-2/1 w-full shrink-0 overflow-hidden bg-gray-100">
        <Image
          src={data.img_src}
          alt={data.name}
          fill
          loading="eager"
          sizes="20rem"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        <span className="text-text-default absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
          <FiFileText size={12} /> PDF · 3 p.
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-text-paragraph flex min-w-0 items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
            <span className="shrink-0">{data.class}</span>
            <GoDotFill size={6} className="shrink-0" />
            <span className="truncate">{data.matter}</span>
          </div>
          <span className="text-background-accent shrink-0 rounded-full border border-current px-2 py-0.5 text-xs font-medium">
            {data.type}
          </span>
        </div>

        <h4 className="text-text-title line-clamp-2 min-h-[2lh] text-base leading-snug font-semibold">
          {data.name}
        </h4>

        <div className="text-text-paragraph mt-auto flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <FiCalendar size={12} />
            {data.year - 1}-{data.year}
          </span>
          <GoDotFill size={6} />
          <span>1,6 Mo</span>
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
          <button className="text-text-default flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
            <FiEye size={16} />
            Visualiser
          </button>
          <button className="bg-background-secondary text-text-primary flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90">
            <FiDownload size={16} />
            Télécharger
          </button>
        </div>
      </div>
    </article>
  );
};

export default EpreuveCard;
