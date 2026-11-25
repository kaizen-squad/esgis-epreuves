import type { Metadata } from "next";
import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { notFound } from "next/navigation";
import { getExamCached } from "@/features/exams/queries";
import {
  getFields,
  getLevels,
  getOptions,
  getSubjects,
} from "@/features/referentials/queries";
import ExamWelcomeSection from "../../components/ExamWelcomeSection";
import EditExamFlow from "../../components/exam-form/EditExamFlow";

export async function generateMetadata({
  params,
}: PageProps<"/bde/epreuves/[slug]/modifier">): Promise<Metadata> {
  const exam = await getExamCached((await params).slug);
  return {
    title: `Modifier ${exam?.title ?? "une épreuve introuvable"} · Espace BDE`,
  };
}

export default async function ModifierEpreuvePage({
  params,
}: PageProps<"/bde/epreuves/[slug]/modifier">) {
  await requireBdeSession();
  const { slug } = await params;
  const [exam, fields, levels, subjects, options] = await Promise.all([
    getExamCached(slug),
    getFields(),
    getLevels(),
    getSubjects(),
    getOptions(),
  ]);
  if (!exam) notFound();

  // `fields`/`levels` ne contiennent deja que les actifs : une matiere dont la filiere ou le
  // niveau a ete desactive depuis l'admin ne doit plus etre proposee pour un nouveau choix,
  // mais la matiere actuelle de l'epreuve reste visible meme si elle n'est plus proposable.
  const fieldIds = new Set(fields.map((f) => f.id));
  const levelIds = new Set(levels.map((l) => l.id));
  const availableSubjects = subjects.filter(
    (s) =>
      s.id === exam.subjectId ||
      (fieldIds.has(s.fieldId) && levelIds.has(s.levelId)),
  );

  return (
    <div>
      <ExamWelcomeSection title="Modifier une Épreuve" />
      <EditExamFlow
        exam={exam}
        fields={fields}
        levels={levels}
        subjects={availableSubjects}
        options={options}
      />
    </div>
  );
}
