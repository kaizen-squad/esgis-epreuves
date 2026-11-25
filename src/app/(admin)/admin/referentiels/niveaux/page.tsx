import type { Metadata } from "next";
import {
  createLevel,
  setLevelActive,
  updateLevel,
} from "@/features/referentials/actions";
import {
  getExamCountsByColumn,
  getLevels,
} from "@/features/referentials/queries";
import AdminPageHeader from "../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../lib/requireAdminSession";
import ReferentialManager from "../components/ReferentialManager";
import ReferentialTabs from "../components/ReferentialTabs";

export const metadata: Metadata = { title: "Niveaux · Référentiels · Admin" };

export default async function NiveauxPage() {
  await requireAdminSession();
  const [levels, examCounts] = await Promise.all([
    getLevels({ includeInactive: true }),
    getExamCountsByColumn("level_id"),
  ]);

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
        examCounts={examCounts}
        create={createLevel}
        update={updateLevel}
        setActive={setLevelActive}
      />
    </>
  );
}
