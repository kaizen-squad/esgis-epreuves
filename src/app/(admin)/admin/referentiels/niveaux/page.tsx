import {
  createLevel,
  setLevelActive,
  updateLevel,
} from "@/features/referentials/actions";
import { getLevels } from "@/features/referentials/queries";
import AdminPageHeader from "../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../lib/requireAdminSession";
import ReferentialManager from "../components/ReferentialManager";
import ReferentialTabs from "../components/ReferentialTabs";

export default async function NiveauxPage() {
  await requireAdminSession();
  const levels = await getLevels({ includeInactive: true });

  return (
    <>
      <AdminPageHeader
        title="Référentiels"
        description="Gérez les filières, niveaux, matières et options utilisés par le catalogue."
      />
      <ReferentialTabs active="/admin/referentiels/niveaux" />
      <ReferentialManager
        kind="level"
        items={levels}
        create={createLevel}
        update={updateLevel}
        setActive={setLevelActive}
      />
    </>
  );
}
