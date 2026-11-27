import { getRecentExams } from "@/features/exams/queries";
import Slider from "@/components/ui/Slider";
import ExamCard from "@/components/exams/ExamCard";
import { toExamCardProps } from "@/components/exams/toExamCardProps";

export function RecentlyAddedSkeleton() {
  return (
    <div className="mx-auto mb-16 max-w-7xl animate-pulse">
      <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-card h-72 bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

type RecentlyAddedProps = {
  title: string;
  /** Espace BDE : cartes avec menu de gestion. */
  manageable?: boolean;
};

export default async function RecentlyAdded({
  title,
  manageable = false,
}: RecentlyAddedProps) {
  const exams = await getRecentExams();

  if (exams.length === 0) {
    return (
      <div className="mx-auto mb-16 max-w-7xl">
        <h3 className="section-title">{title}</h3>
        <p className="text-text-paragraph">
          Aucune épreuve n&apos;a encore été ajoutée.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-16 max-w-7xl">
      <h3 className="section-title">{title}</h3>
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
    </div>
  );
}
