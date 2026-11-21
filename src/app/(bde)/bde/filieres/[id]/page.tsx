import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import FieldExamsView from "@/components/fields/FieldExamsView";
import { BDE_BASE_PATH } from "@/components/layout/spaces";

export default async function BDEFilierePage({
  params,
  searchParams,
}: PageProps<"/bde/filieres/[id]">) {
  await requireBdeSession();
  const { id } = await params;

  return (
    <FieldExamsView
      fieldId={id}
      searchParams={await searchParams}
      basePath={BDE_BASE_PATH}
    />
  );
}
