import Link from "next/link";
import {
  FiCalendar,
  FiDownload,
  FiEye,
  FiFileText,
  GoDotFill,
} from "@/components/icons";
import { formatFileSize, formatFileType } from "@/lib/file-format";
import { BDE_BASE_PATH, examHref } from "@/components/layout/spaces";
import Cote from "./Cote";
import ExamManageMenu from "./ExamManageMenu";
import ExamThumbnail from "./ExamThumbnail";

export interface ExamCardProps {
  /** Identifiant de l'epreuve, absent des donnees factices. */
  id?: string;
  /** Haut de la premiere page du fichier (`/api/exams/[slug]/preview`). */
  preview_src: string;
  name: string;
  year: number;
  matter: string;
  subjectId: string;
  class: string;
  levelId: string;
  /** Absente des niveaux de tronc commun (L1/L2). */
  option: string | null;
  field: string;
  fieldId: string;
  academicYear: string;
  type: string;
  slug?: string;
  /** Taille reelle du fichier, en octets. */
  fileSize: number;
  mimeType: string;
  /** Espace BDE : affiche le menu de gestion (modifier, remplacer, supprimer). */
  manageable?: boolean;
}

const ExamCard = (data: ExamCardProps) => {
  // Espace BDE (cartes gerables) : la page de l'epreuve reste dans l'espace BDE.
  const basePath = data.manageable ? BDE_BASE_PATH : "";
  const previewHref = data.slug ? examHref(basePath, data.slug) : null;
  const downloadHref = data.slug ? `/api/exams/${data.slug}?dl=1` : null;

  return (
    <article className="group bg-background-primary flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg">
      <div className="relative aspect-2/1 w-full shrink-0 overflow-hidden border-b border-gray-200 bg-gray-100">
        <ExamThumbnail src={data.preview_src} />
        <span className="text-text-default absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
          <FiFileText size={12} /> {formatFileType(data.mimeType)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <Cote
            field={data.field}
            fieldId={data.fieldId}
            level={data.class}
            levelId={data.levelId}
            option={data.option}
            subject={data.matter}
            subjectId={data.subjectId}
            academicYear={data.academicYear}
            basePath={basePath}
            className="text-text-paragraph min-w-0 flex-wrap text-xs font-medium tracking-wide"
          />
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
            <span>{formatFileSize(data.fileSize)}</span>
          </div>
          {data.manageable && data.id && data.slug ? (
            <ExamManageMenu id={data.id} slug={data.slug} name={data.name} />
          ) : null}
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
          {previewHref ? (
            <Link
              href={previewHref}
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
            <a
              href={downloadHref}
              className="bg-background-secondary text-text-primary flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              <FiDownload size={16} />
              Télécharger
            </a>
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
