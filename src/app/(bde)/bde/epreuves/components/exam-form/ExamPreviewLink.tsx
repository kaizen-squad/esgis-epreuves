import Link from "next/link";
import { BDE_BASE_PATH, examHref } from "@/components/layout/spaces";

/** Lien vers la page de l'epreuve dans l'espace BDE (apercu, details, gestion), nouvel onglet. */
export default function ExamPreviewLink({
  exam,
}: {
  exam: { slug: string; title: string };
}) {
  return (
    <Link
      href={examHref(BDE_BASE_PATH, exam.slug)}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold underline"
    >
      {exam.title}
    </Link>
  );
}
