import { getRecentExams } from "@/features/exams/queries";
import Slider from "@/components/ui/Slider";
import { connection } from "next/server";
import EpreuveCard from "@/components/exams/EpreuveCard";
import { toEpreuveCardProps } from "@/components/exams/toEpreuveCardProps";

export function RecentlyAddedSkeleton() {
  return (
    <div className="mx-auto mb-16 max-w-7xl animate-pulse">
      <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-72 rounded-xl bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default async function RecentlyAdded({ title }: { title: string }) {
  await connection();
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
            <EpreuveCard {...toEpreuveCardProps(exam)} />
          </div>
        ))}
      </Slider>
    </div>
  );
}
