import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  FiArrowLeft,
  FiDownload,
  FiEdit2,
  FiRefreshCw,
} from "@/components/icons";
import {
  BDE_BASE_PATH,
  catalogueHref,
  publicExamPath,
  type SpaceBasePath,
} from "@/components/layout/spaces";
import {
  getExamCached,
  getExamDepositorName,
  getExamR2Key,
} from "@/features/exams/queries";
import { formatFileSize, formatFileType } from "@/lib/file-format";
import { examFileExists } from "@/lib/r2/exists";
import Cote from "@/components/exams/Cote";
import ExamDeleteButton from "@/components/exams/ExamDeleteButton";
import ExamFilePreview from "./ExamFilePreview";
import ExamSuggestions from "./ExamSuggestions";
import ShareExamButton from "./ShareExamButton";

export { getExamCached };

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
  // #157 : page publique en ISR, `strict` seulement ici (BDE reste dynamique, degradation
  // gracieuse suffisante) pour qu'un rate R2 passager ne soit jamais mis en cache.
  const available = r2Key
    ? await examFileExists(r2Key, { strict: basePath === "" })
    : false;
  // Depositaire lu a part, seulement cote BDE (#176) : jamais via un client anonyme (#157).
  const depositorName =
    basePath === BDE_BASE_PATH
      ? await getExamDepositorName(exam.createdBy)
      : null;

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
    ...(basePath === BDE_BASE_PATH
      ? [{ label: "Déposée par", value: depositorName ?? "Inconnu" }]
      : []),
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
          r2Key={r2Key}
          fileVersion={exam.fileVersion}
          fileSize={exam.fileSize}
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
            <ShareExamButton
              path={publicExamPath(exam.slug)}
              title={exam.title}
            />
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
              <ExamDeleteButton
                id={exam.id}
                name={exam.title}
                className={`${MANAGE_LINK_CLASS} text-background-accent cursor-pointer`}
              />
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

      <Suspense fallback={null}>
        <ExamSuggestions
          subjectId={exam.subjectId}
          fieldId={exam.fieldId}
          levelId={exam.levelId}
          academicYear={exam.academicYear}
          excludeSlug={exam.slug}
          manageable={basePath === BDE_BASE_PATH}
        />
      </Suspense>
    </article>
  );
}
