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

/** Pas de searchParams/cookies/headers ici : rendu statique avec la meme fenetre que le cache de donnees (#157). */
export const revalidate = 60;

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
      <div className="px-6">
        <Faq />
      </div>
    </>
  );
}
