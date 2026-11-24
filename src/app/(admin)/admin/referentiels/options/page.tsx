import {
  createOption,
  setOptionActive,
  updateOption,
} from "@/features/referentials/actions";
import {
  getExamCountsByColumn,
  getFields,
  getOptions,
} from "@/features/referentials/queries";
import AdminPageHeader from "../../../components/AdminPageHeader";
import { requireAdminSession } from "../../../lib/requireAdminSession";
import ReferentialManager from "../components/ReferentialManager";
import ReferentialTabs from "../components/ReferentialTabs";

export default async function OptionsPage() {
  await requireAdminSession();
  const [options, fields, examCounts] = await Promise.all([
    getOptions({ includeInactive: true }),
    getFields({ includeInactive: true }),
    getExamCountsByColumn("option_id"),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Référentiels"
        description="Gérez les filières, niveaux, matières et options utilisés par le catalogue."
      />
      <ReferentialTabs active="/admin/referentiels/options" />
      <ReferentialManager
        kind="option"
        items={options}
        fields={fields}
        examCounts={examCounts}
        create={createOption}
        update={updateOption}
        setActive={setOptionActive}
      />
    </>
  );
}
