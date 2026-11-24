import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import {
  getFields,
  getLevels,
  getOptions,
  getSubjects,
} from "@/features/referentials/queries";
import ExamWelcomeSection from "../components/ExamWelcomeSection";
import AddExamFlow from "../components/exam-form/AddExamFlow";

export default async function AjouterEpreuvePage() {
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

  return (
    <div>
      <ExamWelcomeSection title="Ajouter une Épreuve" />
      <AddExamFlow
        fields={fields}
        levels={levels}
        subjects={availableSubjects}
        options={options}
      />
    </div>
  );
}
