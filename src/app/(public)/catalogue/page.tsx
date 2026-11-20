import React from "react";
import CatalogueWelcomeSection from "./components/CatalogueWelcomeSection";
import Research from "@/components/exams/Research";
import ResultsResume from "@/components/home/ResultsResume";
import CTACatalogue from "@/components/home/CTACatalogue";
import CatalogueEpreuveSection from "@/components/catalogue/CatalogueEpreuveSection";
import type { CatalogueSearchParams } from "@/components/exams/catalogueFilters";

const Catalogue = async ({
  searchParams,
}: {
  searchParams: Promise<CatalogueSearchParams>;
}) => {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.search)
    ? params.search[0]
    : params.search;

  return (
    <>
      <CatalogueWelcomeSection />
      <Research live initialQuery={initialQuery} />
      <p className="text-text-default text-center">
        Choisissez votre domaine d&apos;activité pour retrouver les annales de
        votre spécialité.
        <br />
        Accédez directement aux examens qui comptent pour votre année.
      </p>

      <CatalogueEpreuveSection searchParams={params} />
      <div className="px-6">
        <ResultsResume />
        <CTACatalogue />
      </div>
    </>
  );
};

export default Catalogue;
