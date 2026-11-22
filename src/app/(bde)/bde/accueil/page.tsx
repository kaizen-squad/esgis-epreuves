import { requireBdeSession } from "@/app/(bde)/lib/requireBdeSession";
import { Suspense } from "react";
import BDEWelcomeSection from "./components/BDEWelcomeSection";
import MyRecentUploads, {
  MyRecentUploadsSkeleton,
} from "./components/MyRecentUploads";
import Research from "@/components/exams/Research";
import RecentlyAdded, {
  RecentlyAddedSkeleton,
} from "@/components/exams/RecentlyAdded";
import { BDE_BASE_PATH, catalogueHref } from "@/components/layout/spaces";

const BDE_CATALOGUE_HREF = catalogueHref(BDE_BASE_PATH);

const BDEAccueil = async () => {
  await requireBdeSession();

  return (
    <>
      <BDEWelcomeSection />
      <Research catalogueHref={BDE_CATALOGUE_HREF} />
      <div className="px-6">
        <Suspense fallback={<MyRecentUploadsSkeleton />}>
          <MyRecentUploads />
        </Suspense>
        <Suspense fallback={<RecentlyAddedSkeleton />}>
          <RecentlyAdded title="Dernières épreuves de l'équipe" manageable />
        </Suspense>
      </div>
    </>
  );
};

export default BDEAccueil;
