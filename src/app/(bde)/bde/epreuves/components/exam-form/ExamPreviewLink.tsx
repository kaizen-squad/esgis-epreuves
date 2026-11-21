import Link from "next/link";

/** Lien vers le PDF d'une epreuve (route de telechargement), dans un nouvel onglet. */
export default function ExamPreviewLink({
  exam,
}: {
  exam: { slug: string; title: string };
}) {
  return (
    <Link
      href={`/api/exams/${exam.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold underline"
    >
      {exam.title}
    </Link>
  );
}
