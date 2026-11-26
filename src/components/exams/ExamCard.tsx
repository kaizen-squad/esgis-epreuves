import Link from "next/link";
import { FiDownload, FiFileText } from "@/components/icons";
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
  /** Inconnue sur une vieille epreuve deposee sans annee academique (#196). */
  year: number | null;
  matter: string;
  subjectId: string;
  class: string;
  levelId: string;
  /** Absente d'une matiere de tronc commun (L1, ou une matiere de L2 anterieure a l'option, #195). */
  option: string | null;
  field: string;
  /** Sigle d'affichage de la filiere (#198), prefere au nom complet quand renseigne. */
  fieldShortName: string | null;
  fieldId: string;
  /** Inconnue sur une vieille epreuve deposee sans cette information (#196). */
  academicYear: string | null;
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
    <article className="group bg-background-primary relative flex h-full w-full flex-row overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-lg md:flex-col md:hover:-translate-y-1">
      {/* Toute la carte mene a la fiche ; les controles au-dessus (telechargement, menu BDE)
          restent cliquables car places apres dans l'ordre d'empilement. */}
      {previewHref ? (
        <Link
          href={previewHref}
          aria-label={`Voir la fiche de ${data.name}`}
          className="absolute inset-0 z-10"
        />
      ) : null}

      <div className="relative aspect-square w-24 shrink-0 overflow-hidden border-r border-gray-200 bg-gray-100 md:aspect-2/1 md:w-full md:border-r-0 md:border-b">
        <ExamThumbnail src={data.preview_src} />
        <span className="text-text-default absolute top-1.5 right-1.5 flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm md:top-3 md:right-3 md:px-2.5 md:text-xs">
          <FiFileText size={12} /> {formatFileType(data.mimeType)}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 md:gap-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <Cote
            field={data.field}
            fieldShortName={data.fieldShortName}
            fieldId={data.fieldId}
            level={data.class}
            levelId={data.levelId}
            option={data.option}
            subject={data.matter}
            subjectId={data.subjectId}
            academicYear={data.academicYear}
            basePath={basePath}
            className="text-text-paragraph relative z-20 min-w-0 flex-wrap text-xs font-medium tracking-wide"
          />
          <span className="text-background-accent shrink-0 rounded-full border border-current px-2 py-0.5 text-xs font-medium">
            {data.type}
          </span>
        </div>

        <h4 className="text-text-title line-clamp-2 text-sm leading-snug font-semibold md:min-h-[2lh] md:text-base">
          {data.name}
        </h4>

        <div className="text-text-paragraph mt-auto flex items-center justify-between gap-2 text-xs">
          {/* L'annee academique est deja dans la Cote ci-dessus : l'afficher encore ici la
              doublait (#179). */}
          <span>{formatFileSize(data.fileSize)}</span>
          <div className="relative z-20 flex items-center gap-1">
            {downloadHref ? (
              <a
                href={downloadHref}
                aria-label={`Télécharger ${data.name}`}
                className="text-text-default hover:bg-background-default flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-colors md:hidden"
              >
                <FiDownload size={16} />
              </a>
            ) : null}
            {data.manageable && data.id && data.slug ? (
              <ExamManageMenu id={data.id} slug={data.slug} name={data.name} />
            ) : null}
          </div>
        </div>

        <div className="hidden items-center gap-2 border-t border-gray-100 pt-3 md:flex">
          {downloadHref ? (
            <a
              href={downloadHref}
              className="bg-background-secondary text-text-primary relative z-20 flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              <FiDownload size={16} />
              Télécharger
            </a>
          ) : (
            <button className="bg-background-secondary text-text-primary relative z-20 flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90">
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
