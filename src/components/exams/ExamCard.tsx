import Image from "next/image";
import Link from "next/link";
import { FiCalendar, FiDownload, FiEye, FiFileText } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";
import ExamManageMenu from "./ExamManageMenu";

export interface ExamCardProps {
  /** Identifiant de l'epreuve, absent des donnees factices. */
  id?: string;
  img_src: string;
  name: string;
  year: number;
  matter: string;
  class: string;
  type: string;
  slug?: string;
  fileSize?: number;
  /** Espace BDE : affiche le menu de gestion (modifier, remplacer, supprimer). */
  manageable?: boolean;
}

function formatFileSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) return `${megabytes.toFixed(1)} Mo`;
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

const ExamCard = (data: ExamCardProps) => {
  const previewHref = data.slug ? `/api/exams/${data.slug}` : null;
  const downloadHref = data.slug ? `/api/exams/${data.slug}?dl=1` : null;
  const sizeLabel =
    data.fileSize !== undefined ? formatFileSize(data.fileSize) : "1,6 Mo";

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
          <FiFileText size={12} /> PDF
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

        <div className="text-text-paragraph mt-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FiCalendar size={12} />
              {data.year - 1}-{data.year}
            </span>
            <GoDotFill size={6} />
            <span>{sizeLabel}</span>
          </div>
          {data.manageable ? <ExamManageMenu /> : null}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
          {previewHref ? (
            <Link
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-default flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
            >
              <FiEye size={16} />
              Visualiser
            </Link>
          ) : (
            <button className="text-text-default flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2 text-sm font-medium transition-colors hover:bg-gray-50">
              <FiEye size={16} />
              Visualiser
            </button>
          )}
          {downloadHref ? (
            <Link
              href={downloadHref}
              className="bg-background-secondary text-text-primary flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              <FiDownload size={16} />
              Télécharger
            </Link>
          ) : (
            <button className="bg-background-secondary text-text-primary flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90">
              <FiDownload size={16} />
              Télécharger
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ExamCard;
