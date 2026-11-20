import { Suspense } from "react";
import BDEWelcomeSection from "./components/BDEWelcomeSection";
import Research from "@/components/exams/Research";
import RecentlyAdded, {
  RecentlyAddedSkeleton,
} from "@/components/exams/RecentlyAdded";
import DomainFilter, {
  DomainFilterSkeleton,
} from "@/components/exams/DomainFilter";
import ResultsResume from "@/app/(public)/accueil/components/ResultsResume";
import CTACatalogue from "@/app/(public)/accueil/components/CTACatalogue";
import Filieres from "@/app/(public)/accueil/components/Filieres";
import FilieresSkeleton from "@/app/(public)/accueil/components/FilieresSkeleton";

const BDEAccueil = () => {
  return (
    <>
      <BDEWelcomeSection />
      <Research />
      <div className="px-6">
        <Suspense fallback={<RecentlyAddedSkeleton />}>
          <RecentlyAdded title="Epreuves ajoutées" manageable />
        </Suspense>
        <Suspense fallback={<DomainFilterSkeleton />}>
          <DomainFilter manageable />
        </Suspense>
        <Suspense fallback={<FilieresSkeleton />}>
          <Filieres />
        </Suspense>
        <ResultsResume />
        <CTACatalogue />
      </div>
    </>
  );
};

export default BDEAccueil;
