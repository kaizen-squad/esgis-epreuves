import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { getFieldByIdCached } from "@/features/referentials/queries";
import { fieldDisplayName } from "@/components/fields/fieldLabel";
import FieldCoverageMatrix from "@/components/fields/FieldCoverageMatrix";
import FieldBreadcrumb from "@/components/fields/FieldBreadcrumb";
import { BDE_BASE_PATH } from "@/components/layout/spaces";

export async function generateMetadata({
  params,
}: PageProps<"/bde/filieres/[id]">): Promise<Metadata> {
  const field = await getFieldByIdCached((await params).id);
  return {
    title: `Épreuves manquantes · ${field ? fieldDisplayName(field.name) : "filière introuvable"} · Espace BDE`,
  };
}

export default async function BDEFilierePage({
  params,
}: PageProps<"/bde/filieres/[id]">) {
  await requireBdeSession();
  const { id } = await params;
  const field = await getFieldByIdCached(id);
  if (!field) notFound();

  return (
    <div className="mx-auto mb-16 max-w-7xl px-6">
      <FieldBreadcrumb fieldName={field.name} basePath={BDE_BASE_PATH} />
      <h1 className="section-title mb-6 text-center">
        Épreuves manquantes : {fieldDisplayName(field.name)}
      </h1>
      <FieldCoverageMatrix fieldId={field.id} fieldName={field.name} />
    </div>
  );
}
