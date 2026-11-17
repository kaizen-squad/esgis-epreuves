import { Suspense } from "react";
import CTACatalogue from "./accueil/components/CTACatalogue";
import DomainFilter from "./accueil/components/DomainFilter";
import Filieres from "./accueil/components/Filieres";
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
        <DomainFilter />
        <Filieres />
        <ResultsResume />
        <CTACatalogue />
      </div>
    </PublicLayout>
  );
}
