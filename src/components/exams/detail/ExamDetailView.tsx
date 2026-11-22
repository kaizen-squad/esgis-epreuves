import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { FiArrowLeft, FiDownload, FiEdit2, FiRefreshCw } from "react-icons/fi";
import {
  BDE_BASE_PATH,
  catalogueHref,
  publicExamPath,
  type SpaceBasePath,
} from "@/components/layout/spaces";
import { getExamBySlug, getExamR2Key } from "@/features/exams/queries";
import { formatFileSize, formatFileType } from "@/lib/file-format";
import { examFileExists } from "@/lib/r2/exists";
import Cote from "@/components/exams/Cote";
import ExamFilePreview from "./ExamFilePreview";
import ShareExamButton from "./ShareExamButton";

/** Epreuve par slug, memoisee par requete : partagee entre `generateMetadata` et la vue. */
export const getExamCached = cache(getExamBySlug);

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

const MANAGE_LINK_CLASS =
  "text-text-default flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100";

/**
 * Page de consultation d'une epreuve, partagee par l'espace public (`/epreuves/[slug]`) et
 * l'espace BDE (`/bde/epreuves/[slug]`) : details, apercu du PDF, partage et telechargement
 * (`/api/exams/[slug]?dl=1`, URL R2 presignee). Le lien partage pointe toujours vers la page
 * publique ; cote BDE, le retour mene au catalogue BDE et des liens de gestion s'ajoutent.
 */
export default async function ExamDetailView({
  slug,
  basePath,
}: {
  slug: string;
  basePath: SpaceBasePath;
}) {
  const [exam, r2Key] = await Promise.all([
    getExamCached(slug),
    getExamR2Key(slug),
  ]);
  if (!exam) notFound();
  const available = r2Key ? await examFileExists(r2Key) : false;

  const details = [
    { label: "Filière", value: exam.field },
    { label: "Niveau", value: exam.level },
    ...(exam.option ? [{ label: "Option", value: exam.option }] : []),
    { label: "Matière", value: exam.subject },
    { label: "Année académique", value: exam.academicYear },
    { label: "Session", value: exam.session },
    { label: "Type", value: exam.examType },
    {
      label: "Format",
      value: `${formatFileType(exam.mimeType)} · ${formatFileSize(exam.fileSize)}`,
    },
    {
      label: "Ajoutée le",
      value: dateFormat.format(new Date(exam.createdAt)),
    },
  ];

  return (
    <article className="mx-auto w-full max-w-7xl px-4 lg:px-6">
      <Link
        href={catalogueHref(basePath)}
        className="text-text-paragraph mb-6 inline-flex items-center gap-2 text-sm hover:underline"
      >
        <FiArrowLeft /> Retour au catalogue
      </Link>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="text-background-accent rounded-full border border-current px-2.5 py-0.5">
            {exam.examType}
          </span>
          <span className="bg-background-primary text-text-paragraph rounded-full border border-gray-200 px-2.5 py-0.5">
            {exam.session}
          </span>
        </div>
        <h1 className="text-text-secondary mb-2 text-3xl leading-tight font-semibold md:text-4xl">
          {exam.title}
        </h1>
        <Cote
          field={exam.field}
          fieldId={exam.fieldId}
          level={exam.level}
          levelId={exam.levelId}
          option={exam.option}
          subject={exam.subject}
          subjectId={exam.subjectId}
          academicYear={exam.academicYear}
          basePath={basePath}
          className="text-text-paragraph text-sm"
        />
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <ExamFilePreview
          slug={exam.slug}
          title={exam.title}
          available={available}
        />

        <aside className="bg-background-primary flex flex-col gap-6 rounded-xl border border-gray-200 p-6 shadow-sm lg:sticky lg:top-6">
          <div className="flex flex-col gap-3">
            {available ? (
              <a
                href={`/api/exams/${exam.slug}?dl=1`}
                className="bg-background-accent text-text-primary flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-opacity hover:opacity-90"
              >
                <FiDownload size={18} /> Télécharger l&apos;épreuve
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="bg-background-accent text-text-primary flex cursor-not-allowed items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium opacity-50"
              >
                <FiDownload size={18} /> Télécharger l&apos;épreuve
              </button>
            )}
            <ShareExamButton path={publicExamPath(exam.slug)} />
          </div>

          {basePath === BDE_BASE_PATH ? (
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-5">
              <h2 className="text-text-secondary mb-1 text-sm font-semibold">
                Gestion
              </h2>
              <Link
                href={`/bde/epreuves/${exam.slug}/modifier`}
                className={MANAGE_LINK_CLASS}
              >
                <FiEdit2 size={16} /> Modifier les données
              </Link>
              <Link
                href={`/bde/epreuves/${exam.slug}/remplacer`}
                className={MANAGE_LINK_CLASS}
              >
                <FiRefreshCw size={16} /> Remplacer le fichier
              </Link>
            </div>
          ) : null}

          <div>
            <h2 className="text-text-secondary mb-4 text-lg font-semibold">
              Détails de l&apos;épreuve
            </h2>
            <dl className="divide-y divide-gray-100 text-sm">
              {details.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-text-paragraph">{label}</dt>
                  <dd className="text-text-default text-right font-medium">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </article>
  );
}
