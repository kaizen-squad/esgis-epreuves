import type { Metadata } from "next";
import {
  createField,
  setFieldActive,
  updateField,
} from "@/features/referentials/actions";
import {
  getExamCountsByColumn,
  getFields,
} from "@/features/referentials/queries";
import AdminPageHeader from "../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../lib/requireAdminSession";
import ReferentialManager from "../components/ReferentialManager";
import ReferentialTabs from "../components/ReferentialTabs";

export const metadata: Metadata = { title: "Filières · Référentiels · Admin" };

export default async function FilieresPage() {
  await requireAdminSession();
  const [fields, examCounts] = await Promise.all([
    getFields({ includeInactive: true }),
    getExamCountsByColumn("field_id"),
  ]);

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
        examCounts={examCounts}
        create={createField}
        update={updateField}
        setActive={setFieldActive}
      />
    </>
  );
}
