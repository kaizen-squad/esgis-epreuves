import type { Metadata } from "next";
import ExamDetailView, {
  getExamCached,
} from "@/components/exams/detail/ExamDetailView";
import { getRecentExams } from "@/features/exams/queries";

/** Pas de searchParams/cookies/headers ici : rendu statique avec la meme fenetre que le cache de donnees (#157). */
export const revalidate = 60;

/**
 * Pre-rendu des epreuves les plus recentes (meme requete que l'accueil) ; les autres slugs
 * restent generes a la demande puis caches (`dynamicParams` par defaut), pas d'avance aveugle sur
 * tout le catalogue.
 */
export async function generateStaticParams() {
  const exams = await getRecentExams(20);
  return exams.map((exam) => ({ slug: exam.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/epreuves/[slug]">): Promise<Metadata> {
  const exam = await getExamCached((await params).slug);
  if (!exam) return { title: "Épreuve introuvable · Alexandria" };

  // Annee academique et session peuvent etre inconnues sur une vieille epreuve (#196) : omises
  // plutot qu'affichees telles quelles ("undefined"/"null") dans ces metadonnees publiques.
  const typeAndSession = [exam.examType, exam.session]
    .filter(Boolean)
    .join(", ");
  const description = `${exam.subject} · ${exam.level} ${exam.field} · ${typeAndSession}${exam.academicYear ? ` ${exam.academicYear}` : ""}.`;
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
