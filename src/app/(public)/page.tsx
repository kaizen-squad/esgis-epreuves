import { Suspense } from "react";
import CTACatalogue from "@/components/home/CTACatalogue";
import DomainFilter, {
  DomainFilterSkeleton,
} from "@/components/exams/DomainFilter";
import Filieres from "@/components/fields/Filieres";
import RecentlyAdded, {
  RecentlyAddedSkeleton,
} from "@/components/exams/RecentlyAdded";
import Research from "@/components/exams/Research";
import ResultsResume from "@/components/home/ResultsResume";
import WelcomeSection from "./accueil/components/WelcomeSection";
import FilieresSkeleton from "@/components/fields/FilieresSkeleton";

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
