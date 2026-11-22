import Link from "next/link";
import { Suspense } from "react";
import { FiCompass } from "@/components/icons";
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
        <Link
          href="/filieres"
          className="text-text-default inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <FiCompass size={16} /> Ma filière
        </Link>
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
