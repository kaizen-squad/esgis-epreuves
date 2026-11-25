import type { Metadata } from "next";
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
import { getTotalSubjectGapCount } from "@/features/exams/queries";
import { BDE_BASE_PATH, catalogueHref } from "@/components/layout/spaces";

const BDE_CATALOGUE_HREF = catalogueHref(BDE_BASE_PATH);

export const metadata: Metadata = { title: "Accueil · Espace BDE" };

const BDEAccueil = async () => {
  await requireBdeSession();
  const gapCount = await getTotalSubjectGapCount();

  return (
    <>
      <BDEWelcomeSection gapCount={gapCount} />
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
