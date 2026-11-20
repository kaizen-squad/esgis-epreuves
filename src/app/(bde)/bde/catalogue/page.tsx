import CatalogueEpreuveSection from "@/components/catalogue/CatalogueEpreuveSection";
import Research from "@/components/exams/Research";

export default async function BDECataloguePage({
  searchParams,
}: PageProps<"/bde/catalogue">) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.search)
    ? params.search[0]
    : params.search;

  return (
    <>
      <div className="mb-8 px-6 text-center">
        <h1 className="head-title">Catalogue des épreuves</h1>
        <p className="text-text-default">
          Retrouvez toutes les épreuves déposées, filtrez-les et gérez-les
          depuis leur menu : modifier les données, remplacer le fichier ou
          supprimer l&apos;épreuve.
        </p>
      </div>
      <Research live initialQuery={initialQuery} />
      <CatalogueEpreuveSection searchParams={params} manageable />
    </>
  );
}
