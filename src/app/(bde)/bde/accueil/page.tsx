import { Suspense } from "react";
import BDEWelcomeSection from "./components/BDEWelcomeSection";
import Research from "@/components/exams/Research";
import RecentlyAdded, {
  RecentlyAddedSkeleton,
} from "@/components/exams/RecentlyAdded";
import DomainFilter, {
  DomainFilterSkeleton,
} from "@/components/exams/DomainFilter";
import ResultsResume from "@/components/home/ResultsResume";
import CTACatalogue from "@/components/home/CTACatalogue";
import Filieres from "@/components/fields/Filieres";
import FilieresSkeleton from "@/components/fields/FilieresSkeleton";

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
