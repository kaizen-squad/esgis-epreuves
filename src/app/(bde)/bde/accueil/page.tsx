import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
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
import { BDE_BASE_PATH, catalogueHref } from "@/components/layout/spaces";

const BDE_CATALOGUE_HREF = catalogueHref(BDE_BASE_PATH);

const BDEAccueil = async () => {
  await requireBdeSession();

  return (
    <>
      <BDEWelcomeSection />
      <Research catalogueHref={BDE_CATALOGUE_HREF} />
      <div className="px-6">
        <Suspense fallback={<RecentlyAddedSkeleton />}>
          <RecentlyAdded title="Epreuves ajoutées" manageable />
        </Suspense>
        <Suspense fallback={<DomainFilterSkeleton />}>
          <DomainFilter manageable catalogueHref={BDE_CATALOGUE_HREF} />
        </Suspense>
        <Suspense fallback={<FilieresSkeleton />}>
          <Filieres basePath={BDE_BASE_PATH} />
        </Suspense>
        <ResultsResume basePath={BDE_BASE_PATH} />
        <CTACatalogue catalogueHref={BDE_CATALOGUE_HREF} />
      </div>
    </>
  );
};

export default BDEAccueil;
