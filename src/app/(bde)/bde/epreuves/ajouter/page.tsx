import type { Metadata } from "next";
import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import {
  getFields,
  getLevels,
  getOptions,
  getSubjects,
} from "@/features/referentials/queries";
import ExamWelcomeSection from "../components/ExamWelcomeSection";
import AddExamFlow from "../components/exam-form/AddExamFlow";

export const metadata: Metadata = { title: "Verser une épreuve · Espace BDE" };

export default async function AjouterEpreuvePage({
  searchParams,
}: PageProps<"/bde/epreuves/ajouter">) {
  await requireBdeSession();
  const [fields, levels, subjects, options] = await Promise.all([
    getFields(),
    getLevels(),
    getSubjects(),
    getOptions(),
  ]);
  // `fields`/`levels` ne contiennent deja que les actifs : une matiere dont la filiere ou le
  // niveau a ete desactive depuis l'admin ne doit pas rester proposee ici (le champ n'existe
  // plus dans aucun des deux `<select>`).
  const fieldIds = new Set(fields.map((f) => f.id));
  const levelIds = new Set(levels.map((l) => l.id));
  const availableSubjects = subjects.filter(
    (s) => fieldIds.has(s.fieldId) && levelIds.has(s.levelId),
  );

  // Une lacune du fonds (#174, FieldCoverageMatrix) ouvre l'ajout prerempli avec sa matiere : les
  // ids de la matiere font foi, jamais ceux de `searchParams` directement (coherence garantie).
  const params = await searchParams;
  const subjectIdParam = Array.isArray(params.subjectId)
    ? params.subjectId[0]
    : params.subjectId;
  const prefilledSubject = availableSubjects.find(
    (s) => s.id === subjectIdParam,
  );

  return (
    <div>
      <ExamWelcomeSection title="Verser une épreuve" />
      <AddExamFlow
        fields={fields}
        levels={levels}
        subjects={availableSubjects}
        options={options}
        initialSubject={
          prefilledSubject
            ? {
                fieldId: prefilledSubject.fieldId,
                levelId: prefilledSubject.levelId,
                subjectId: prefilledSubject.id,
              }
            : undefined
        }
      />
    </div>
  );
}
