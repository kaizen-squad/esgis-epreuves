import type { Metadata } from "next";
import {
  createSubject,
  setSubjectActive,
  updateSubject,
} from "@/features/referentials/actions";
import {
  getExamCountsByColumn,
  getFields,
  getLevels,
  getOptions,
  getSubjects,
} from "@/features/referentials/queries";
import AdminPageHeader from "../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../lib/requireAdminSession";
import ReferentialManager from "../components/ReferentialManager";
import ReferentialTabs from "../components/ReferentialTabs";

export const metadata: Metadata = { title: "Matières · Référentiels · Admin" };

/** `#ajouter` ouvre directement sur le formulaire de création, pour un lien marque-page. */
export default async function MatieresPage() {
  await requireAdminSession();
  const [subjects, fields, levels, options, examCounts] = await Promise.all([
    getSubjects({ includeInactive: true }),
    getFields({ includeInactive: true }),
    getLevels({ includeInactive: true }),
    getOptions({ includeInactive: true }),
    getExamCountsByColumn("subject_id"),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Référentiels"
        description="Gérez les filières, niveaux, matières et options utilisés par le catalogue."
      />
      <ReferentialTabs active="/admin/referentiels/matieres" />
      <ReferentialManager
        kind="subject"
        items={subjects}
        fields={fields}
        levels={levels}
        options={options}
        examCounts={examCounts}
        create={createSubject}
        update={updateSubject}
        setActive={setSubjectActive}
        anchorId="ajouter"
      />
    </>
  );
}
