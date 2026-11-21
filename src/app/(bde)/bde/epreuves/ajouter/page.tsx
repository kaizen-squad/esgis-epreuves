import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import {
  getFields,
  getLevels,
  getSubjects,
} from "@/features/referentials/queries";
import ExamWelcomeSection from "../components/ExamWelcomeSection";
import AddExamFlow from "../components/add-exam/AddExamFlow";

export default async function AjouterEpreuvePage() {
  await requireBdeSession();
  const [fields, levels, subjects] = await Promise.all([
    getFields(),
    getLevels(),
    getSubjects(),
  ]);

  return (
    <div>
      <ExamWelcomeSection title="Ajouter une Épreuve" />
      <AddExamFlow fields={fields} levels={levels} subjects={subjects} />
    </div>
  );
}
