import {
  createSubject,
  setSubjectActive,
  updateSubject,
} from "@/features/referentials/actions";
import {
  getFields,
  getLevels,
  getSubjects,
} from "@/features/referentials/queries";
import AdminPageHeader from "../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../lib/requireAdminSession";
import ReferentialManager from "../components/ReferentialManager";
import ReferentialTabs from "../components/ReferentialTabs";

/** `#ajouter` ouvre directement sur le formulaire de création, pour un lien marque-page. */
export default async function MatieresPage() {
  await requireAdminSession();
  const [subjects, fields, levels] = await Promise.all([
    getSubjects({ includeInactive: true }),
    getFields({ includeInactive: true }),
    getLevels({ includeInactive: true }),
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
        create={createSubject}
        update={updateSubject}
        setActive={setSubjectActive}
        anchorId="ajouter"
      />
    </>
  );
}
