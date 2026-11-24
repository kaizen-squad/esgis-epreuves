import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { BDE_BASE_PATH, examHref } from "@/components/layout/spaces";

/**
 * Lien vers la page de l'epreuve dans l'espace BDE (apercu, details, gestion), nouvel onglet,
 * signale par une icone et un texte pour lecteur d'ecran (#171).
 */
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
      className="inline-flex items-center gap-1 font-semibold underline"
    >
      {exam.title}
      <FiExternalLink size={12} aria-hidden="true" />
      <span className="sr-only">(nouvel onglet)</span>
    </Link>
  );
}
