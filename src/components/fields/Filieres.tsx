import { FiArrowRight } from "react-icons/fi";
import FiliereCard from "@/components/fields/FiliereCard";
import Link from "next/link";
import { connection } from "next/server";
import { getFieldLevelSummaries } from "@/features/exams/queries";
import { toFiliereCardData } from "@/components/fields/fieldLabel";
import type { SpaceBasePath } from "@/components/layout/spaces";

const HOME_CARDS_LIMIT = 6;
const MOBILE_VISIBLE_CARDS = 3;

/** Apercu des filieres de l'accueil ; `basePath` garde les liens dans l'espace courant (BDE). */
export default async function Filieres({
  basePath = "",
}: {
  basePath?: SpaceBasePath;
}) {
  // Rendu a la requete, pas au build : la CI build sans variables Supabase (meme raison que RecentlyAdded).
  await connection();
  const summaries = (await getFieldLevelSummaries()).slice(0, HOME_CARDS_LIMIT);

  if (summaries.length === 0) {
    return (
      <div className="mx-auto mb-16 max-w-7xl">
        <h3 className="section-title text-center">
          Selectionnez votre <br />
          filière
        </h3>
        <p className="text-text-paragraph">
          Aucune filière n&apos;a encore été ajoutée.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-30 max-w-7xl">
      <h3 className="section-title text-center">
        Selectionnez votre <br />
        filière
      </h3>
      <div className="mb-6 grid grid-cols-1 grid-rows-3 gap-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3">
        {summaries.map((summary, index) => (
          <FiliereCard
            key={`${summary.fieldId}-${summary.levelId}`}
            data={toFiliereCardData(summary, basePath)}
            className={
              index >= MOBILE_VISIBLE_CARDS ? "hidden md:block" : "block"
            }
          />
        ))}
      </div>

      <Link
        href={`${basePath}/filieres`}
        className="border-background-secondary text-text-primary bg-background-accent ml-auto flex w-fit items-center gap-2 rounded-lg border px-3 py-2 font-semibold"
      >
        Voir toutes les filières <FiArrowRight />
      </Link>
    </div>
  );
}
