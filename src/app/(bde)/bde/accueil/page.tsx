import BDEWelcomeSection from "./components/BDEWelcomeSection";
import Research from "@/components/exams/Research";
import ResultsResume from "@/app/(public)/accueil/components/ResultsResume";
import CTACatalogue from "@/app/(public)/accueil/components/CTACatalogue";
import Filieres from "@/app/(public)/accueil/components/Filieres";
import AddedExams from "./components/AddedExams";
import DomainFilter from "./components/DomainFilter";

const BDEAccueil = () => {
  return (
    <>
      <BDEWelcomeSection />
      <Research />
      <AddedExams title="Epreuves ajoutées" />
      <DomainFilter />
      <Filieres />
      <ResultsResume />
      <CTACatalogue />
    </>
  );
};

export default BDEAccueil;
