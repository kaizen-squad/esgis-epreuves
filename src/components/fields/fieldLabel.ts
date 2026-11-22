import type { SpaceBasePath } from "@/components/layout/spaces";
import type { FieldLevelSummary } from "@/features/exams/types";

/** Abreviations d'affichage des filieres dont le nom complet est trop long pour une carte. */
const FIELD_ABBREVIATIONS: Record<string, string> = {
  "informatique, reseaux et telecommunication": "IRT",
};

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/s$/, "");
}

/** Nom affiche d'une filiere : "Informatique, Réseaux et Télécommunications" devient "IRT", les autres restent tels quels. */
export function fieldDisplayName(name: string): string {
  return FIELD_ABBREVIATIONS[normalize(name)] ?? name;
}

/** Donnees d'une FiliereCard ("L1 IRT", nombre d'epreuves, lien vers la page de la filiere filtree sur le niveau). */
export function toFiliereCardData(
  summary: FieldLevelSummary,
  basePath: SpaceBasePath = "",
) {
  return {
    label: `${summary.levelName} ${fieldDisplayName(summary.fieldName)}`,
    examCount: summary.examCount,
    href: `${basePath}/filieres/${summary.fieldId}?levelId=${summary.levelId}`,
  };
}

/** Niveaux du tronc commun : les epreuves n'y ont pas d'option. */
const COMMON_CORE_LEVELS = ["L1", "L2"];

/** "Architecture Logicielle (AL)" devient "AL" ; sans sigle entre parentheses, le nom reste entier. */
export function optionDisplayName(name: string): string {
  return /\(([^)]+)\)\s*$/.exec(name)?.[1] ?? name;
}

/**
 * Titre de la page d'une filiere : "L1 IRT – Tronc commun" en L1/L2, "L3 IRT – AL / SRS" ensuite
 * (options presentes dans les epreuves du niveau). Sans niveau : seulement l'abreviation de la filiere.
 */
export function fieldPageTitle(
  fieldName: string,
  levelName: string | null,
  optionNames: string[],
): string {
  const field = fieldDisplayName(fieldName);
  if (!levelName) return field;

  const suffix = COMMON_CORE_LEVELS.includes(levelName)
    ? "Tronc commun"
    : optionNames.map(optionDisplayName).join(" / ");

  return suffix ? `${levelName} ${field} – ${suffix}` : `${levelName} ${field}`;
}
