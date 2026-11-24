import { redirect } from "next/navigation";
import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { createClient } from "@/lib/supabase/server";
import CatalogueEpreuveSection from "@/components/catalogue/CatalogueEpreuveSection";
import Research from "@/components/exams/Research";

/**
 * Historique complet des versements du membre connecte (#174) : "Voir tous mes versements" sur
 * l'accueil menait nulle part. Le deposant vient de la session, jamais de l'URL (securite, voir
 * `ExamFilters.createdBy`).
 */
export default async function MesEpreuvesPage({
  searchParams,
}: PageProps<"/bde/mes-epreuves">) {
  await requireBdeSession();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) redirect("/login");

  const params = await searchParams;
  const initialQuery = Array.isArray(params.search)
    ? params.search[0]
    : params.search;

  return (
    <>
      <div className="mb-8 px-6 text-center">
        <h1 className="head-title">Mes versements</h1>
        <p className="text-text-default">
          Toutes les épreuves que vous avez déposées, filtrez-les et gérez-les
          depuis leur menu.
        </p>
      </div>
      <Research live initialQuery={initialQuery} />
      <CatalogueEpreuveSection
        searchParams={params}
        manageable
        forcedCreatedBy={userId}
      />
    </>
  );
}
