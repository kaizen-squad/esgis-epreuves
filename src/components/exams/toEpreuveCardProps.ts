import type { Exam } from "@/features/exams/types";
import type { EpreuveCardProps } from "@/components/exams/EpreuveCard";

export function toEpreuveCardProps(exam: Exam): EpreuveCardProps {
  const endYear = exam.academicYear.split("-")[1] ?? exam.academicYear;

  return {
    img_src: "/images/study.png",
    name: exam.title,
    year: Number.parseInt(endYear, 10),
    matter: exam.subject,
    class: exam.level,
    type: exam.examType,
    slug: exam.slug,
    fileSize: exam.fileSize,
  };
}
