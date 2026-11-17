import BDELayout from "@/app/(bde)/components/BDELayout";
import BDEWelcomeSection from "./components/BDEWelcomeSection";
import Research from "@/app/(public)/accueil/components/Research";
import ResultsResume from "@/app/(public)/accueil/components/ResultsResume";
import CTACatalogue from "@/app/(public)/accueil/components/CTACatalogue";
import Filieres from "@/app/(public)/accueil/components/Filieres";
import AddedExams from "./components/AddedExams";
import DomainFilter from "./components/DomainFilter";

const BDEAccueil = () => {
  return (
    <BDELayout>
      <BDEWelcomeSection />
      <Research />
      <AddedExams title="Epreuves ajoutées" />
      <DomainFilter />
      <Filieres />
      <ResultsResume />
      <CTACatalogue />
    </BDELayout>
  );
};

export default BDEAccueil;
