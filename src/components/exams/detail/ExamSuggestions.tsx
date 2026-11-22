import { getExams } from "@/features/exams/queries";
import ExamSuggestionList from "./ExamSuggestionList";

const SUGGESTIONS_LIMIT = 9;

/**
 * Suite de lecture sur la fiche d'une epreuve (R-10) : deux listes, meme matiere (autres
 * annees que celle consultee) et meme filiere/niveau. La 2e exclut les epreuves deja montrees
 * dans la 1re (une matiere appartient a une seule filiere/niveau, les deux se recoupent sinon).
 * Fetch des deux listes en parallele ; composant asynchrone entier, a isoler dans un
 * `<Suspense>` par l'appelant pour ne pas retarder le reste de la fiche.
 */
export default async function ExamSuggestions({
  subjectId,
  fieldId,
  levelId,
  academicYear,
  excludeSlug,
  manageable = false,
}: {
  subjectId: string;
  fieldId: string;
  levelId: string;
  academicYear: string;
  excludeSlug: string;
  manageable?: boolean;
}) {
  const [bySubject, byFieldLevel] = await Promise.all([
    getExams({ subjectId, pageSize: SUGGESTIONS_LIMIT }),
    getExams({ fieldId, levelId, pageSize: SUGGESTIONS_LIMIT }),
  ]);

  const sameSubject = bySubject.exams.filter(
    (exam) => exam.slug !== excludeSlug && exam.academicYear !== academicYear,
  );
  const shownIds = new Set(sameSubject.map((exam) => exam.id));
  const sameFieldLevel = byFieldLevel.exams.filter(
    (exam) => exam.slug !== excludeSlug && !shownIds.has(exam.id),
  );

  return (
    <>
      <ExamSuggestionList
        title="Même matière, autres années"
        exams={sameSubject}
        manageable={manageable}
      />
      <ExamSuggestionList
        title="Même filière et niveau"
        exams={sameFieldLevel}
        manageable={manageable}
      />
    </>
  );
}
