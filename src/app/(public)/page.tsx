import { Suspense } from "react";
import CTACatalogue from "./accueil/components/CTACatalogue";
import DomainFilter, {
  DomainFilterSkeleton,
} from "./accueil/components/DomainFilter";
import Filieres, { FilieresSkeleton } from "./accueil/components/Filieres";
import RecentlyAdded, {
  RecentlyAddedSkeleton,
} from "./accueil/components/RecentlyAdded";
import Research from "./accueil/components/Research";
import ResultsResume from "./accueil/components/ResultsResume";
import WelcomeSection from "./accueil/components/WelcomeSection";
import PublicLayout from "./components/PublicLayout";

export default function Accueil() {
  return (
    <PublicLayout>
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
    </PublicLayout>
  );
}
