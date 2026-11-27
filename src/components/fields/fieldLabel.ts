import type { SpaceBasePath } from "@/components/layout/spaces";
import type { FieldLevelSummary } from "@/features/exams/types";
import type { FiliereCardData } from "@/components/fields/FiliereCard";

/**
 * Nom affiche d'une filiere : son sigle (#198, `fields.short_name`, modifiable depuis l'Admin)
 * quand il est renseigne, sinon son nom complet. Remplace l'ancienne table en dur ad hoc
 * ("Informatique, Réseaux et Télécommunications" -> "IRT"), qui ne couvrait que cette filiere et
 * ne pouvait jamais etre corrigee sans toucher au code.
 */
export function fieldDisplayName(
  name: string,
  shortName?: string | null,
): string {
  return shortName ?? name;
}

/** Donnees d'une FiliereCard (niveau "L1", filiere "IRT", nombre d'epreuves, lien vers la page de la filiere filtree sur le niveau). */
export function toFiliereCardData(
  summary: FieldLevelSummary,
  basePath: SpaceBasePath = "",
): FiliereCardData {
  return {
    level: summary.levelName,
    field: fieldDisplayName(summary.fieldName, summary.fieldShortName),
    examCount: summary.examCount,
    href: `${basePath}/filieres/${summary.fieldId}?levelId=${summary.levelId}`,
  };
}

/** Cycle d'un niveau d'apres son sigle ("L2" : Licence, "M1" : Master), `null` sinon. */
export function levelCycle(levelName: string): string | null {
  if (/^L\d/i.test(levelName)) return "Licence";
  if (/^M\d/i.test(levelName)) return "Master";
  return null;
}

/** "2022-2023 à 2024-2025", ou l'annee seule quand les deux bornes sont egales. */
export function yearSpanLabel({
  first,
  last,
}: {
  first: string;
  last: string;
}): string {
  return first === last ? first : `${first} à ${last}`;
}

/**
 * Niveau purement tronc commun (jamais d'option), pour les deux filieres reelles (#195) : IRT et
 * Gestion se scindent toutes deux a partir du S4, donc de L2. Seul L1 reste commun aux deux.
 */
const COMMON_CORE_LEVELS = ["L1"];

/** "Architecture Logicielle (AL)" devient "AL" ; sans sigle entre parentheses, le nom reste entier. */
export function optionDisplayName(name: string): string {
  return /\(([^)]+)\)\s*$/.exec(name)?.[1] ?? name;
}

/**
 * Titre de la page d'une filiere : "L1 IRT : Tronc commun" en L1, "L3 IRT : AL / SI / SRC" ensuite
 * (options presentes dans les epreuves du niveau). Un niveau mixte (L2 du programme reel #195, a
 * la fois tronc commun au S3 et scinde par option au S4) affiche les options : la page sans
 * filtre d'option montre deja les deux, le titre les nomme plutot que de pretendre a tort qu'il
 * n'y en a aucune. Sans niveau : seulement l'abreviation de la filiere.
 */
export function fieldPageTitle(
  fieldName: string,
  fieldShortName: string | null,
  levelName: string | null,
  optionNames: string[],
): string {
  const field = fieldDisplayName(fieldName, fieldShortName);
  if (!levelName) return field;

  const suffix = COMMON_CORE_LEVELS.includes(levelName)
    ? "Tronc commun"
    : optionNames.map(optionDisplayName).join(" / ");

  return suffix ? `${levelName} ${field} : ${suffix}` : `${levelName} ${field}`;
}
