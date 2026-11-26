import type { CSSProperties } from "react";
import Link from "next/link";
import { FiArrowRight } from "@/components/icons";
import {
  fieldDisplayName,
  levelCycle,
  yearSpanLabel,
} from "@/components/fields/fieldLabel";
import { getFieldDirectory } from "@/features/exams/queries";
import type {
  FieldDirectory as Directory,
  FieldDirectoryEntry,
  FieldDirectoryLevel,
} from "@/features/exams/types";

/** Matieres inscrites sur une fiche avant le renvoi "+ N autres". */
const LISTED_SUBJECTS = 4;

/** Grille des fiches : une colonne par niveau des 1280px, alignee d'une filiere a l'autre. */
export const DIRECTORY_GRID_CLASS =
  "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-(--levels) xl:gap-4";

export function directoryGridStyle(columns: number): CSSProperties {
  return {
    "--levels": `repeat(${columns}, minmax(0, 1fr))`,
  } as CSSProperties;
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count > 1 ? "s" : ""}`;
}

/** Niveaux consecutifs d'un meme cycle (L1 a L3 : Licence), pour l'accolade au-dessus des colonnes. */
function cycleSpans(columns: Directory["columns"]) {
  const spans: { label: string | null; span: number }[] = [];
  for (const column of columns) {
    const label = levelCycle(column.levelName);
    const last = spans.at(-1);
    if (last && last.label === label) last.span += 1;
    else spans.push({ label, span: 1 });
  }
  return spans;
}

/**
 * Fiche bristol d'un niveau (`.index-card`) : le niveau en tete, le nombre d'epreuves, les matieres
 * deja archivees inscrites sur les lignes, les annees couvertes au pied. Toute la fiche mene a la
 * page de la filiere filtree sur ce niveau ; sans epreuve, elle reste vierge et ne mene nulle part.
 */
function LevelIndexCard({
  level,
  fieldName,
}: {
  level: FieldDirectoryLevel;
  fieldName: string;
}) {
  const isEmpty = level.examCount === 0;
  const listed = level.subjects.slice(0, LISTED_SUBJECTS);
  const hidden = level.subjects.length - listed.length;

  return (
    <article
      className={`index-card focus-ring-within group rounded-card flex h-full flex-col overflow-hidden ${
        isEmpty ? "bg-background-default" : "bg-background-primary"
      }`}
    >
      <header
        className={`flex items-end justify-between gap-3 border-b px-4 pt-3 pb-2 ${
          isEmpty ? "border-text-secondary/20" : "border-background-accent/80"
        }`}
      >
        <h3
          className={`text-5xl leading-[0.85] font-extrabold tracking-tight font-stretch-condensed ${
            isEmpty ? "text-text-secondary/45" : "text-text-secondary"
          }`}
        >
          {isEmpty ? (
            <>
              {level.levelName}
              <span className="sr-only"> {fieldName}</span>
            </>
          ) : (
            // Lien etire sur toute la fiche (`after:inset-0`) : la fiche entiere est cliquable,
            // et le lecteur d'ecran annonce "L2 IRT" plutot que tout le contenu de la fiche.
            <Link
              href={`/filieres/${level.fieldId}?levelId=${level.levelId}`}
              className="after:rounded-card after:absolute after:inset-0"
            >
              {level.levelName}
              <span className="sr-only"> {fieldName}</span>
            </Link>
          )}
        </h3>
        <p className="text-text-paragraph pb-0.5 text-sm whitespace-nowrap">
          <span className="text-text-default text-base font-bold tabular-nums">
            {level.examCount}
          </span>{" "}
          épreuve{level.examCount > 1 ? "s" : ""}
        </p>
      </header>

      {isEmpty ? (
        <p className="index-card-lines text-text-paragraph min-h-14 flex-1 px-4 text-sm/(--index-rule) sm:min-h-28">
          Aucune épreuve archivée pour l&apos;instant.
        </p>
      ) : (
        <ul
          aria-label="Matières archivées"
          className="index-card-lines min-h-14 flex-1 text-sm/(--index-rule) sm:min-h-28"
        >
          {listed.map((subject) => (
            <li
              key={subject.subjectId}
              className="flex items-baseline justify-between gap-3 px-4"
            >
              <span className="text-text-default min-w-0 text-pretty">
                {subject.subjectName}
              </span>
              <span className="text-text-paragraph shrink-0 tabular-nums">
                <span className="sr-only">: </span>
                {subject.examCount}
              </span>
            </li>
          ))}
          {hidden > 0 ? (
            <li className="text-text-paragraph px-4">
              + {plural(hidden, "autre matière")}
            </li>
          ) : null}
        </ul>
      )}

      <footer className="flex min-h-10 items-center justify-between gap-3 px-4 py-2">
        <p className="text-text-paragraph text-xs tabular-nums">
          {level.years ? (
            <>
              <span className="sr-only">Années : </span>
              {yearSpanLabel(level.years)}
            </>
          ) : null}
        </p>
        {isEmpty ? null : (
          <FiArrowRight
            aria-hidden="true"
            size={18}
            className="text-background-accent shrink-0 transition-transform duration-300 group-has-[a:hover]:translate-x-1"
          />
        )}
      </footer>
    </article>
  );
}

/** Rangee d'une filiere : son sigle, ses totaux, le lien vers toutes ses epreuves, puis ses fiches. */
function FieldRow({
  field,
  columns,
}: {
  field: FieldDirectoryEntry;
  columns: Directory["columns"];
}) {
  const displayName = fieldDisplayName(field.fieldName, field.fieldShortName);
  const headingId = `filiere-${field.fieldId}`;
  const levels = new Map(field.levels.map((level) => [level.levelId, level]));
  const facts = [
    plural(field.examCount, "épreuve"),
    plural(field.subjectCount, "matière"),
    field.years ? yearSpanLabel(field.years) : null,
  ].filter(Boolean);

  return (
    <section
      aria-labelledby={headingId}
      className="border-text-secondary/15 border-t py-8 first-of-type:border-t-0 first-of-type:pt-2 lg:py-10"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="text-text-secondary text-5xl leading-[0.9] font-extrabold tracking-tight break-words uppercase font-stretch-condensed sm:text-6xl lg:text-7xl"
          >
            {displayName}
            {displayName !== field.fieldName ? (
              <span className="sr-only"> ({field.fieldName})</span>
            ) : null}
          </h2>
          <p className="text-text-paragraph mt-2 text-sm text-pretty sm:text-base">
            {displayName !== field.fieldName ? (
              <span aria-hidden="true" className="text-text-default">
                {field.fieldName}
                <span className="px-2">:</span>
              </span>
            ) : null}
            <span className="tabular-nums">{facts.join(", ")}</span>
          </p>
        </div>
        <Link
          href={`/filieres/${field.fieldId}`}
          className="text-text-default hover:decoration-background-accent inline-flex shrink-0 items-center gap-2 font-semibold underline decoration-transparent decoration-2 underline-offset-[0.4em] transition-colors"
        >
          Toutes les épreuves {displayName}
          <FiArrowRight aria-hidden="true" className="text-background-accent" />
        </Link>
      </div>

      <ol
        aria-label={`Niveaux ${displayName}`}
        className={DIRECTORY_GRID_CLASS}
        style={directoryGridStyle(columns.length)}
      >
        {columns.map((column) => {
          const level = levels.get(column.levelId);
          return level ? (
            <li key={column.levelId}>
              <LevelIndexCard level={level} fieldName={displayName} />
            </li>
          ) : (
            // Niveau absent de cette filiere : son emplacement reste vide, pour que les niveaux
            // des autres filieres restent dans leur colonne.
            <li
              key={column.levelId}
              aria-hidden="true"
              className="rounded-card border-text-secondary/15 hidden border border-dashed xl:block"
            />
          );
        })}
      </ol>
    </section>
  );
}

/**
 * Repertoire de la page /filieres (distinct de la grille compacte de l'accueil) : une rangee par
 * filiere, une fiche bristol par niveau, alignees en colonnes sous l'accolade de leur cycle.
 */
export default async function FieldDirectory() {
  const { columns, fields } = await getFieldDirectory();

  if (fields.length === 0) {
    return (
      <p className="text-text-paragraph mx-auto mb-16 max-w-7xl text-center">
        Aucune filière n&apos;a encore été ajoutée.
      </p>
    );
  }

  return (
    <div className="mx-auto mb-16 max-w-7xl">
      {/* Accolades de cycle au-dessus des colonnes : collees en haut de l'ecran pendant qu'on
          parcourt les filieres, comme l'en-tete d'un registre. Seulement quand les colonnes
          sont alignees (des 1280px). */}
      <div
        aria-hidden="true"
        className="bg-background-primary sticky top-0 z-10 hidden gap-4 py-3 xl:grid xl:grid-cols-(--levels)"
        style={directoryGridStyle(columns.length)}
      >
        {cycleSpans(columns).map((cycle, index) => (
          <div
            key={index}
            style={{ gridColumn: `span ${cycle.span}` }}
            className="text-text-secondary flex flex-col gap-1.5"
          >
            <span className="text-sm font-semibold tracking-wide uppercase">
              {cycle.label}
            </span>
            <span className="border-text-secondary/35 h-2 rounded-t-sm border-x border-t" />
          </div>
        ))}
      </div>

      {fields.map((field) => (
        <FieldRow key={field.fieldId} field={field} columns={columns} />
      ))}
    </div>
  );
}
