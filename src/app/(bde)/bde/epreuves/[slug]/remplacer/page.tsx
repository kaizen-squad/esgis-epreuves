import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { notFound } from "next/navigation";
import { getExamBySlug } from "@/features/exams/queries";
import ExamWelcomeSection from "../../components/ExamWelcomeSection";
import ReplaceExamFileFlow from "../../components/exam-form/ReplaceExamFileFlow";

export default async function RemplacerEpreuvePage({
  params,
}: PageProps<"/bde/epreuves/[slug]/remplacer">) {
  await requireBdeSession();
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) notFound();

  return (
    <div>
      <ExamWelcomeSection title="Remplacer le Fichier" />
      <ReplaceExamFileFlow exam={exam} />
    </div>
  );
}
