import type {
  FieldDirectory,
  FieldDirectoryEntry,
  FieldLevelSummary,
  SubjectCoverage,
  YearSpan,
} from "./types";

/** Cle d'un couple filiere x niveau, partagee avec la lecture des annees. */
export function coupleKey(fieldId: string, levelId: string): string {
  return `${fieldId}:${levelId}`;
}

/** Plage qui couvre les deux (les annees "2022-2023" se comparent comme des chaines). */
function mergeYears(a: YearSpan | null, b: YearSpan | null): YearSpan | null {
  if (!a || !b) return a ?? b;
  return {
    first: a.first < b.first ? a.first : b.first,
    last: a.last > b.last ? a.last : b.last,
  };
}

/**
 * Repertoire de la page /filieres, assemble a partir de lectures deja en cache : couples niveau x
 * filiere (tries par filiere puis niveau), couverture par matiere de chaque filiere, annees
 * extremes de chaque couple. Les colonnes reunissent tous les niveaux rencontres, pour qu'un meme
 * niveau tombe dans la meme colonne d'une filiere a l'autre.
 */
export function buildFieldDirectory(
  summaries: FieldLevelSummary[],
  coverageByField: Map<string, SubjectCoverage[]>,
  yearsByCouple: Map<string, YearSpan>,
): FieldDirectory {
  const columns = new Map<string, string>();
  const fields = new Map<string, FieldDirectoryEntry>();

  for (const summary of summaries) {
    columns.set(summary.levelId, summary.levelName);

    const subjects = (coverageByField.get(summary.fieldId) ?? [])
      .filter((s) => s.levelId === summary.levelId && s.examCount > 0)
      .sort(
        (a, b) =>
          b.examCount - a.examCount ||
          a.subjectName.localeCompare(b.subjectName),
      );
    const years =
      yearsByCouple.get(coupleKey(summary.fieldId, summary.levelId)) ?? null;

    const field = fields.get(summary.fieldId) ?? {
      fieldId: summary.fieldId,
      fieldName: summary.fieldName,
      fieldShortName: summary.fieldShortName,
      examCount: 0,
      subjectCount: 0,
      years: null,
      levels: [],
    };
    field.examCount += summary.examCount;
    field.subjectCount += subjects.length;
    field.years = mergeYears(field.years, years);
    field.levels.push({ ...summary, subjects, years });
    fields.set(summary.fieldId, field);
  }

  return {
    columns: [...columns]
      .map(([levelId, levelName]) => ({ levelId, levelName }))
      .sort((a, b) => a.levelName.localeCompare(b.levelName)),
    fields: [...fields.values()],
  };
}
