import { Suspense } from "react";
import CTACatalogue from "@/components/home/CTACatalogue";
import Research from "@/components/exams/Research";
import FIliereCategories from "./components/FIliereCategories";
import FiliereCategoriesSkeleton from "./components/FiliereCategoriesSkeleton";

const Filieres = () => {
  return (
    <>
      <div className="text-center">
        <h1 className="head-title">Filtrez selon votre filière</h1>
        <p className="mb-6">
          Recherchez rapidement un sujet spécifique et téléchargez le fichier en
          un instant. <br />
          Notre interface fluide simplifie vos révisions avant l&apos;examen.
        </p>
      </div>
      <Research />
      <Suspense fallback={<FiliereCategoriesSkeleton />}>
        <FIliereCategories />
      </Suspense>
      <CTACatalogue />
    </>
  );
};

export default Filieres;
