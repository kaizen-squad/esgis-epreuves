import { FiArrowRight } from "react-icons/fi";
import FiliereCard from "../../components/FiliereCard";
import Link from "next/link";
import { connection } from "next/server";
import { getFieldLevelSummaries } from "@/features/exams/queries";
import { fieldDisplayName } from "../../utils/fieldLabel";

const HOME_CARDS_LIMIT = 6;
const MOBILE_VISIBLE_CARDS = 3;

const GRID_CLASS =
  "mb-6 grid grid-cols-1 grid-rows-3 gap-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3";

function cardVisibilityClass(index: number): string {
  return index >= MOBILE_VISIBLE_CARDS ? "hidden md:block" : "block";
}

export function FilieresSkeleton() {
  return (
    <div className="mx-auto mb-30 max-w-7xl" aria-busy="true">
      <div className="section-title mx-auto h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className={GRID_CLASS}>
        {Array.from({ length: HOME_CARDS_LIMIT }).map((_, index) => (
          <div
            key={index}
            className={`${cardVisibilityClass(index)} aspect-square w-full animate-pulse rounded-xl bg-gray-200`}
          />
        ))}
      </div>
      <div className="ml-auto h-10 w-52 animate-pulse rounded-lg bg-gray-200" />
    </div>
  );
}

export default async function Filieres() {
  await connection();
  const summaries = (await getFieldLevelSummaries()).slice(0, HOME_CARDS_LIMIT);

  if (summaries.length === 0) {
    return (
      <div className="mx-auto mb-16 max-w-7xl">
        <h3 className="section-title text-center">
          Selectionnez votre <br />
          filière
        </h3>
        <p className="text-text-paragraph text-center">
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
      <div className={GRID_CLASS}>
        {summaries.map((summary, index) => (
          <FiliereCard
            key={`${summary.fieldId}-${summary.levelId}`}
            data={{
              label: `${summary.levelName} ${fieldDisplayName(summary.fieldName)}`,
              examCount: summary.examCount,
              href: `/filieres/${summary.fieldId}?levelId=${summary.levelId}`,
            }}
            className={cardVisibilityClass(index)}
          />
        ))}
      </div>

      <Link
        href="/filieres"
        className="border-background-secondary text-text-primary bg-background-accent ml-auto flex w-fit items-center gap-2 rounded-lg border px-3 py-2 font-semibold"
      >
        Voir toutes les filières <FiArrowRight />
      </Link>
    </div>
  );
}
