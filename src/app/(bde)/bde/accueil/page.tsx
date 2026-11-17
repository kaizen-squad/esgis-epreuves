import BDELayout from "@/app/(bde)/components/BDELayout";
import BDEWelcomeSection from "./components/BDEWelcomeSection";
import Research from "@/app/(public)/accueil/components/Research";
import RecentlyAdded from "@/app/(public)/accueil/components/RecentlyAdded";
import DomainFilter from "@/app/(public)/accueil/components/DomainFilter";
import ResultsResume from "@/app/(public)/accueil/components/ResultsResume";
import CTACatalogue from "@/app/(public)/accueil/components/CTACatalogue";
import Filieres from "@/app/(public)/accueil/components/Filieres";

const BDEAccueil = () => {
  return (
    <BDELayout>
      <BDEWelcomeSection />
      <Research />
      <RecentlyAdded title="Epreuves ajoutées" />
      <DomainFilter />
      <Filieres />
      <ResultsResume />
      <CTACatalogue />
    </BDELayout>
  );
};

export default BDEAccueil;
