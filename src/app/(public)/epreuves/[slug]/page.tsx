import type { Metadata } from "next";
import ExamDetailView, {
  getExamCached,
} from "@/components/exams/detail/ExamDetailView";

export async function generateMetadata({
  params,
}: PageProps<"/epreuves/[slug]">): Promise<Metadata> {
  const exam = await getExamCached((await params).slug);
  if (!exam) return { title: "Épreuve introuvable · Alexandria" };

  const description = `${exam.subject} · ${exam.level} ${exam.field} · ${exam.examType}, ${exam.session} ${exam.academicYear}.`;
  return {
    title: `${exam.title} · Alexandria`,
    description,
    openGraph: { title: exam.title, description, type: "article" },
  };
}

/** Page publique de consultation d'une epreuve : c'est le lien que l'on partage. */
export default async function ExamPage({
  params,
}: PageProps<"/epreuves/[slug]">) {
  return <ExamDetailView slug={(await params).slug} basePath="" />;
}
