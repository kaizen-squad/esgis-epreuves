import { Suspense } from "react";
import CTACatalogue from "./accueil/components/CTACatalogue";
import DomainFilter, {
  DomainFilterSkeleton,
} from "@/components/exams/DomainFilter";
import Filieres from "./accueil/components/Filieres";
import RecentlyAdded, {
  RecentlyAddedSkeleton,
} from "@/components/exams/RecentlyAdded";
import Research from "@/components/exams/Research";
import ResultsResume from "./accueil/components/ResultsResume";
import WelcomeSection from "./accueil/components/WelcomeSection";
import FilieresSkeleton from "./accueil/components/FilieresSkeleton";

export default function Accueil() {
  return (
    <>
      <WelcomeSection />
      <Research />
      <div className="px-6">
        <Suspense fallback={<RecentlyAddedSkeleton />}>
          <RecentlyAdded title="Recemment ajoutées" />
        </Suspense>
        <Suspense fallback={<DomainFilterSkeleton />}>
          <DomainFilter />
        </Suspense>
        <Suspense fallback={<FilieresSkeleton />}>
          <Filieres />
        </Suspense>
        <ResultsResume />
        <CTACatalogue />
      </div>
    </>
  );
}
