import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { getExamBySlug } from "@/features/exams/queries";
import ExamFileReplaceForm from "../../components/ExamFileReplaceForm";

export default async function RemplacerEpreuvePage({
  params,
}: PageProps<"/bde/epreuves/[slug]/remplacer">) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <Link
        href="/bde/accueil"
        className="text-text-paragraph mb-6 flex w-fit items-center gap-2 text-sm"
      >
        <FiArrowLeft /> Retour à l&apos;accueil
      </Link>
      <h1 className="section-title">Remplacer l&apos;épreuve</h1>
      <p className="text-text-default mb-2">
        {exam.title} · {exam.subject} · {exam.level} · {exam.academicYear}
      </p>
      <p className="text-text-paragraph mb-8 text-sm">
        Les données de l&apos;épreuve sont conservées, seul le PDF est remplacé.{" "}
        <Link
          href={`/api/exams/${exam.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Voir le fichier actuel
        </Link>
      </p>
      <ExamFileReplaceForm examId={exam.id} />
    </div>
  );
}
