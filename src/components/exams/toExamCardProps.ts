import type { Exam } from "@/features/exams/types";
import type { ExamCardProps } from "@/components/exams/ExamCard";

export function toExamCardProps(exam: Exam): ExamCardProps {
  const endYear = exam.academicYear.split("-")[1] ?? exam.academicYear;

  return {
    id: exam.id,
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
