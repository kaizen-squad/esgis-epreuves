import { Suspense } from "react";
import CTACatalogue from "@/components/home/CTACatalogue";
import Research from "@/components/exams/Research";
import FiliereCategories from "@/components/fields/FiliereCategories";
import FiliereCategoriesSkeleton from "@/components/fields/FiliereCategoriesSkeleton";

const Filieres = () => {
  return (
    <>
      <div className="text-center">
        <h1 className="head-title">Filtre selon ta filière</h1>
        <p className="mb-6">
          Recherche rapidement un sujet spécifique et télécharge le fichier en
          un instant. Notre interface fluide simplifie tes révisions avant
          l&apos;examen.
        </p>
      </div>
      <Research />
      <Suspense fallback={<FiliereCategoriesSkeleton />}>
        <FiliereCategories />
      </Suspense>
      <CTACatalogue />
    </>
  );
};

export default Filieres;
