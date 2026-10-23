import React from "react";
import PublicLayout from "../components/PublicLayout";
import CatalogueWelcomeSection from "./components/CatalogueWelcomeSection";
import Research from "../accueil/components/Research";
import CatalogueEpreuve from "./components/CatalogueEpreuve";
import ResultsResume from "../accueil/components/ResultsResume";
import CTACatalogue from "../accueil/components/CTACatalogue";

const Catalogue = () => {
  return (
    <PublicLayout>
      <CatalogueWelcomeSection />
      <Research />
      <p className="text-text-default text-center">
        Choisissez votre domaine d&apos;activité pour retrouver les annales de
        votre spécialité.
        <br />
        Accédez directement aux examens qui comptent pour votre année.
      </p>
      <CatalogueEpreuve />
      <div className="px-6">
        <ResultsResume />
        <CTACatalogue />
      </div>
    </PublicLayout>
  );
};

export default Catalogue;
