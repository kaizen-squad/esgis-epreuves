import { FiArrowRight } from "@/components/icons";
import FiliereCard from "@/components/fields/FiliereCard";
import Link from "next/link";
import { getFieldLevelSummaries } from "@/features/exams/queries";
import { toFiliereCardData } from "@/components/fields/fieldLabel";
import {
  GRID_CLASS,
  HOME_CARDS_LIMIT,
  TRAY_CLASS,
  cardVisibilityClass,
} from "@/components/fields/filieresLayout";
import type { SpaceBasePath } from "@/components/layout/spaces";

/**
 * Apercu des filieres de l'accueil : un tiroir entrouvert, les premiers intercalaires en vue, la
 * poignee ("Voir toutes les filieres") accrochee a son bord avec le nombre total d'intercalaires.
 * `basePath` garde les liens dans l'espace courant (BDE).
 */
export default async function Filieres({
  basePath = "",
}: {
  basePath?: SpaceBasePath;
}) {
  const allSummaries = await getFieldLevelSummaries();
  const summaries = allSummaries.slice(0, HOME_CARDS_LIMIT);
  const title =
    basePath === "" ? "Sélectionne ta filière" : "Sélectionnez votre filière";

  if (summaries.length === 0) {
    return (
      <div className="mx-auto mb-16 max-w-7xl">
        <h3 className="section-title text-center">{title}</h3>
        <p className="text-text-paragraph">
          Aucune filière n&apos;a encore été ajoutée.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-30 max-w-7xl">
      <h3 className="section-title mb-4 text-center">{title}</h3>
      <div className={TRAY_CLASS}>
        <div className={GRID_CLASS}>
          {summaries.map((summary, index) => (
            <FiliereCard
              key={`${summary.fieldId}-${summary.levelId}`}
              data={toFiliereCardData(summary, basePath)}
              // Rang du niveau dans sa filiere (la liste est triee par filiere puis niveau).
              step={
                summaries
                  .slice(0, index)
                  .filter((other) => other.fieldId === summary.fieldId).length
              }
              className={cardVisibilityClass(index)}
            />
          ))}
        </div>
      </div>

      {/* Poignee du tiroir : chevauche son bord bas. */}
      <Link
        href={`${basePath}/filieres`}
        className="bg-background-accent text-text-primary rounded-control relative mx-auto -mt-5 flex w-fit items-center gap-2 px-3 py-2.5 text-sm font-semibold whitespace-nowrap shadow-(--shadow-elevated) transition-[filter] hover:brightness-110 sm:gap-3 sm:px-4 sm:text-base"
      >
        Voir toutes les filières
        <span className="bg-background-primary text-background-accent rounded-control px-1.5 text-sm leading-6 font-bold tabular-nums">
          <span className="sr-only">(</span>
          {allSummaries.length}
          <span className="sr-only"> au total)</span>
        </span>
        {/* Sous 640px, la fleche cede sa place au libelle : il tient sur une ligne des 320px. */}
        <FiArrowRight aria-hidden="true" className="hidden sm:block" />
      </Link>
    </div>
  );
}
