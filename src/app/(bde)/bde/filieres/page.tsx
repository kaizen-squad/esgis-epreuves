import { Suspense } from "react";
import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import Research from "@/components/exams/Research";
import FiliereCategories from "@/components/fields/FiliereCategories";
import FiliereCategoriesSkeleton from "@/components/fields/FiliereCategoriesSkeleton";
import CTACatalogue from "@/components/home/CTACatalogue";
import { BDE_BASE_PATH, catalogueHref } from "@/components/layout/spaces";

const BDEFilieresPage = async () => {
  await requireBdeSession();

  return (
    <>
      <div className="text-center">
        <h1 className="head-title">Filtrez selon la filière</h1>
        <p className="mb-6">
          Retrouvez les épreuves de chaque filière et de chaque niveau, puis
          gérez-les depuis leur menu.
        </p>
      </div>
      <Research catalogueHref={catalogueHref(BDE_BASE_PATH)} />
      <Suspense fallback={<FiliereCategoriesSkeleton />}>
        <FiliereCategories basePath={BDE_BASE_PATH} />
      </Suspense>
      <CTACatalogue catalogueHref={catalogueHref(BDE_BASE_PATH)} />
    </>
  );
};

export default BDEFilieresPage;
