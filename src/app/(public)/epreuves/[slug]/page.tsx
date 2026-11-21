import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { formatFileSize } from "@/components/exams/ExamCard";
import { getExamBySlug, getExamR2Key } from "@/features/exams/queries";
import { examFileExists } from "@/lib/r2/exists";
import ExamFilePreview from "../components/ExamFilePreview";
import ShareExamButton from "../components/ShareExamButton";

// Partagee entre generateMetadata et la page : une seule lecture par requete.
const getExam = cache(getExamBySlug);

const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

export async function generateMetadata({
  params,
}: PageProps<"/epreuves/[slug]">): Promise<Metadata> {
  const exam = await getExam((await params).slug);
  if (!exam) return { title: "Épreuve introuvable · Alexandria" };

  const description = `${exam.subject} · ${exam.level} ${exam.field} · ${exam.examType}, ${exam.session} ${exam.academicYear}.`;
  return {
    title: `${exam.title} · Alexandria`,
    description,
    openGraph: { title: exam.title, description, type: "article" },
  };
}

/**
 * Page de consultation d'une epreuve (lien partageable) : details, apercu du PDF, partage et
 * telechargement. Le telechargement passe par `/api/exams/[slug]?dl=1` (URL R2 presignee).
 */
export default async function ExamPage({
  params,
}: PageProps<"/epreuves/[slug]">) {
  const { slug } = await params;
  const [exam, r2Key] = await Promise.all([getExam(slug), getExamR2Key(slug)]);
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
    { label: "Format", value: `PDF · ${formatFileSize(exam.fileSize)}` },
    {
      label: "Ajoutée le",
      value: dateFormat.format(new Date(exam.createdAt)),
    },
  ];

  return (
    <article className="mx-auto w-full max-w-7xl px-4 lg:px-6">
      <Link
        href="/catalogue"
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
          <span className="bg-background-primary text-text-paragraph rounded-full border border-gray-200 px-2.5 py-0.5">
            {exam.academicYear}
          </span>
        </div>
        <h1 className="text-text-secondary mb-2 text-3xl leading-tight font-semibold md:text-4xl">
          {exam.title}
        </h1>
        <p className="text-text-paragraph mb-0">
          {exam.subject} · {exam.level} {exam.field}
        </p>
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
            <ShareExamButton path={`/epreuves/${exam.slug}`} />
          </div>

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
