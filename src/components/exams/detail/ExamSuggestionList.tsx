import Slider from "@/components/ui/Slider";
import ExamCard from "@/components/exams/ExamCard";
import { toExamCardProps } from "@/components/exams/toExamCardProps";
import type { Exam } from "@/features/exams/types";

/** Une des listes de suggestions de la fiche (R-10) : rien ne s'affiche si elle est vide. */
export default function ExamSuggestionList({
  title,
  exams,
  manageable = false,
}: {
  title: string;
  exams: Exam[];
  manageable?: boolean;
}) {
  if (exams.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-text-secondary mb-4 text-xl font-semibold">
        {title}
      </h2>
      <Slider>
        {exams.map((exam) => (
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
