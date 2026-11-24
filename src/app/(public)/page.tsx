import { Suspense } from "react";
import Filieres from "@/components/fields/Filieres";
import FilieresSkeleton from "@/components/fields/FilieresSkeleton";
import RecentlyAdded, {
  RecentlyAddedSkeleton,
} from "@/components/exams/RecentlyAdded";
import Research from "@/components/exams/Research";
import Faq from "@/components/home/Faq";
import ResultsResume from "@/components/home/ResultsResume";
import WelcomeSection from "./accueil/components/WelcomeSection";

export default function Accueil() {
  return (
    <>
      <WelcomeSection />
      <Research />
      <div className="px-6">
        <Suspense fallback={<RecentlyAddedSkeleton />}>
          <RecentlyAdded title="Récemment ajoutés" />
        </Suspense>
        <Suspense fallback={<FilieresSkeleton />}>
          <Filieres />
        </Suspense>
      </div>
      <div className="px-6">
        <ResultsResume />
      </div>
      <div className="sm:px-6">
        <Faq />
      </div>
    </>
  );
}
