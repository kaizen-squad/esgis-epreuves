import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { notFound } from "next/navigation";
import { getExamBySlug } from "@/features/exams/queries";
import {
  getFields,
  getLevels,
  getOptions,
  getSubjects,
} from "@/features/referentials/queries";
import ExamWelcomeSection from "../../components/ExamWelcomeSection";
import EditExamFlow from "../../components/exam-form/EditExamFlow";

export default async function ModifierEpreuvePage({
  params,
}: PageProps<"/bde/epreuves/[slug]/modifier">) {
  await requireBdeSession();
  const { slug } = await params;
  const [exam, fields, levels, subjects, options] = await Promise.all([
    getExamBySlug(slug),
    getFields(),
    getLevels(),
    getSubjects(),
    getOptions(),
  ]);
  if (!exam) notFound();

  return (
    <div>
      <ExamWelcomeSection title="Modifier une Épreuve" />
      <EditExamFlow
        exam={exam}
        fields={fields}
        levels={levels}
        subjects={subjects}
        options={options}
      />
    </div>
  );
}
