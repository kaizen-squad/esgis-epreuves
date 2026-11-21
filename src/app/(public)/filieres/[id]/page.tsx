import FieldExamsView from "@/components/fields/FieldExamsView";

export default async function FilierePage({
  params,
  searchParams,
}: PageProps<"/filieres/[id]">) {
  const { id } = await params;

  return (
    <FieldExamsView
      fieldId={id}
      searchParams={await searchParams}
      basePath=""
    />
  );
}
