import type { Metadata } from "next";
import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { notFound } from "next/navigation";
import { getExamCached } from "@/features/exams/queries";
import ExamWelcomeSection from "../../components/ExamWelcomeSection";
import ReplaceExamFileFlow from "../../components/exam-form/ReplaceExamFileFlow";

export async function generateMetadata({
  params,
}: PageProps<"/bde/epreuves/[slug]/remplacer">): Promise<Metadata> {
  const exam = await getExamCached((await params).slug);
  return {
    title: `Remplacer le fichier de ${exam?.title ?? "une épreuve introuvable"} · Espace BDE`,
  };
}

export default async function RemplacerEpreuvePage({
  params,
}: PageProps<"/bde/epreuves/[slug]/remplacer">) {
  await requireBdeSession();
  const { slug } = await params;
  const exam = await getExamCached(slug);
  if (!exam) notFound();

  return (
    <div>
      <ExamWelcomeSection title="Remplacer le fichier" />
      <ReplaceExamFileFlow exam={exam} />
    </div>
  );
}
