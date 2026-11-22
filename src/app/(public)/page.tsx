import { Suspense } from "react";
import MaFiliereLink from "@/components/classeur/MaFiliereLink";
import Filieres from "@/components/fields/Filieres";
import FilieresSkeleton from "@/components/fields/FilieresSkeleton";
import RecentlyAdded, {
  RecentlyAddedSkeleton,
} from "@/components/exams/RecentlyAdded";
import Research from "@/components/exams/Research";
import WelcomeSection from "./accueil/components/WelcomeSection";

export default function Accueil() {
  return (
    <>
      <WelcomeSection />
      <Research />
      <div className="mb-8 px-6 text-center">
        <MaFiliereLink />
      </div>
      <div className="px-6">
        <Suspense fallback={<RecentlyAddedSkeleton />}>
          <RecentlyAdded title="Nouveaux versements" />
        </Suspense>
        <Suspense fallback={<FilieresSkeleton />}>
          <Filieres />
        </Suspense>
      </div>
    </>
  );
}
