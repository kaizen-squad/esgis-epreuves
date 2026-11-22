import Slider from "@/components/ui/Slider";
import ExamCard from "@/components/exams/ExamCard";
import { toExamCardProps } from "@/components/exams/toExamCardProps";
import { getExams } from "@/features/exams/queries";
import type { ExamFilters } from "@/features/exams/types";

const RELATED_EXAMS_LIMIT = 9;

/**
 * Suite de lecture sur la fiche d'une epreuve (R-10) : d'autres epreuves qui partagent un
 * critere avec celle consultee (meme matiere, ou meme filiere et niveau), l'epreuve courante
 * exclue. Rien ne s'affiche quand aucune autre epreuve ne correspond.
 */
export default async function RelatedExams({
  title,
  filters,
  excludeSlug,
  manageable = false,
}: {
  title: string;
  filters: ExamFilters;
  excludeSlug: string;
  manageable?: boolean;
}) {
  const { exams } = await getExams({
    ...filters,
    pageSize: RELATED_EXAMS_LIMIT,
  });
  const related = exams.filter((exam) => exam.slug !== excludeSlug);
  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-text-secondary mb-4 text-xl font-semibold">
        {title}
      </h2>
      <Slider>
        {related.map((exam) => (
          <div
            key={exam.id}
            className="relative w-full shrink-0 snap-start md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
          >
            <ExamCard {...toExamCardProps(exam)} manageable={manageable} />
          </div>
        ))}
      </Slider>
    </section>
  );
}
