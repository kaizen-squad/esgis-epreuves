import type { Metadata } from "next";
import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import ExamDetailView, {
  getExamCached,
} from "@/components/exams/detail/ExamDetailView";
import { BDE_BASE_PATH } from "@/components/layout/spaces";

export async function generateMetadata({
  params,
}: PageProps<"/bde/epreuves/[slug]">): Promise<Metadata> {
  const exam = await getExamCached((await params).slug);
  return { title: `${exam?.title ?? "Épreuve introuvable"} · Espace BDE` };
}

/** Consultation d'une epreuve dans l'espace BDE, avec les liens de gestion. */
export default async function BDEExamPage({
  params,
}: PageProps<"/bde/epreuves/[slug]">) {
  await requireBdeSession();
  return <ExamDetailView slug={(await params).slug} basePath={BDE_BASE_PATH} />;
}
