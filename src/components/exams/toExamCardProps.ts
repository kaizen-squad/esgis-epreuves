import type { Exam } from "@/features/exams/types";
import type { ExamCardProps } from "@/components/exams/ExamCard";

export function toExamCardProps(exam: Exam): ExamCardProps {
  const endYear = exam.academicYear?.split("-")[1] ?? exam.academicYear;

  return {
    id: exam.id,
    preview_src: `/api/exams/${exam.slug}/preview?v=${exam.fileVersion}`,
    name: exam.title,
    year: endYear ? Number.parseInt(endYear, 10) : null,
    matter: exam.subject,
    subjectId: exam.subjectId,
    class: exam.level,
    levelId: exam.levelId,
    option: exam.option,
    field: exam.field,
    fieldId: exam.fieldId,
    academicYear: exam.academicYear,
    type: exam.examType,
    slug: exam.slug,
    fileSize: exam.fileSize,
    mimeType: exam.mimeType,
  };
}
