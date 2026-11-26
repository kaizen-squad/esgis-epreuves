import { describe, expect, it } from "vitest";
import { buildFieldDirectory } from "./directory";
import type { FieldLevelSummary, SubjectCoverage } from "./types";

const summary = (
  fieldId: string,
  levelId: string,
  levelName: string,
  examCount: number,
): FieldLevelSummary => ({
  fieldId,
  fieldName: fieldId === "irt" ? "IRT" : "Gestion",
  fieldShortName: null,
  levelId,
  levelName,
  examCount,
});

const subject = (
  subjectName: string,
  levelId: string,
  examCount: number,
): SubjectCoverage => ({
  subjectId: subjectName,
  subjectName,
  levelId,
  levelName: levelId.toUpperCase(),
  examCount,
});

describe("buildFieldDirectory", () => {
  const summaries = [
    summary("gestion", "l1", "L1", 3),
    summary("gestion", "m1", "M1", 0),
    summary("irt", "l1", "L1", 4),
    summary("irt", "l2", "L2", 1),
  ];
  const coverage = new Map([
    [
      "gestion",
      [
        subject("Fiscalite", "l1", 1),
        subject("Audit", "l1", 2),
        subject("Strategie", "m1", 0),
      ],
    ],
    ["irt", [subject("Algo", "l1", 4), subject("Routage", "l2", 1)]],
  ]);
  const years = new Map([
    ["gestion:l1", { first: "2022-2023", last: "2023-2024" }],
    ["irt:l1", { first: "2023-2024", last: "2024-2025" }],
    ["irt:l2", { first: "2021-2022", last: "2021-2022" }],
  ]);

  const directory = buildFieldDirectory(summaries, coverage, years);

  it("aligne les colonnes sur tous les niveaux rencontres, dans l'ordre", () => {
    expect(directory.columns).toEqual([
      { levelId: "l1", levelName: "L1" },
      { levelId: "l2", levelName: "L2" },
      { levelId: "m1", levelName: "M1" },
    ]);
  });

  it("ne garde que les matieres archivees, les plus fournies d'abord", () => {
    const gestion = directory.fields[0];
    expect(gestion?.levels[0]?.subjects.map((s) => s.subjectName)).toEqual([
      "Audit",
      "Fiscalite",
    ]);
    expect(gestion?.levels[1]?.subjects).toEqual([]);
  });

  it("totalise la filiere : epreuves, matieres couvertes, annees extremes", () => {
    const irt = directory.fields[1];
    expect(irt?.examCount).toBe(5);
    expect(irt?.subjectCount).toBe(2);
    expect(irt?.years).toEqual({ first: "2021-2022", last: "2024-2025" });
  });

  it("laisse les annees vides pour un niveau sans epreuve", () => {
    expect(directory.fields[0]?.levels[1]?.years).toBeNull();
  });
});
