import {
  createField,
  setFieldActive,
  updateField,
} from "@/features/referentials/actions";
import { getFields } from "@/features/referentials/queries";
import AdminPageHeader from "../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../lib/requireAdminSession";
import ReferentialManager from "../components/ReferentialManager";
import ReferentialTabs from "../components/ReferentialTabs";

export default async function FilieresPage() {
  await requireAdminSession();
  const fields = await getFields({ includeInactive: true });

  return (
    <>
      <AdminPageHeader
        title="Référentiels"
        description="Gérez les filières, niveaux, matières et options utilisés par le catalogue."
      />
      <ReferentialTabs active="/admin/referentiels/filieres" />
      <ReferentialManager
        kind="field"
        items={fields}
        create={createField}
        update={updateField}
        setActive={setFieldActive}
      />
    </>
  );
}
