import { describe, expect, it } from "vitest";
import { MAX_FILE_SIZE_BYTES } from "@/features/exams/schemas";
import {
  academicYears,
  addExamFormSchema,
  mergeFiles,
  toBatchFormData,
  titleFromFileName,
  toFieldErrors,
  validateExamFile,
} from "./addExamForm";

const UUID = "3f2b8c1e-4a5d-4e6f-8a9b-0c1d2e3f4a5b";

function pdf(name = "devoir.pdf", size = 10, lastModified = 1) {
  return new File(["x".repeat(size)], name, {
    type: "application/pdf",
    lastModified,
  });
}

const validValues = {
  fieldId: UUID,
  levelId: UUID,
  subjectId: UUID,
  session: "Session Normale",
  examType: "Contrôle Continu",
};

function entry(file = pdf(), title = "Devoir d'algorithmique") {
  return { file, title, academicYear: "2025-2026" };
}

describe("academicYears", () => {
  it("bascule sur la nouvelle annee en septembre", () => {
    expect(academicYears(new Date(2026, 8, 1), 2)).toEqual([
      "2026-2027",
      "2025-2026",
    ]);
  });

  it("reste sur l'annee precedente avant septembre", () => {
    expect(academicYears(new Date(2026, 7, 31), 2)).toEqual([
      "2025-2026",
      "2024-2025",
    ]);
  });
});

describe("validateExamFile", () => {
  it("accepte un PDF sous la limite", () => {
    expect(validateExamFile(pdf())).toBeNull();
  });

  it("refuse un fichier qui n'est pas un PDF", () => {
    const docx = new File(["x"], "devoir.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    expect(validateExamFile(docx)).toMatch(/PDF/);
  });

  it("refuse un fichier trop gros ou vide", () => {
    expect(validateExamFile(pdf("gros.pdf", MAX_FILE_SIZE_BYTES + 1))).toMatch(
      /limite/,
    );
    expect(validateExamFile(pdf("vide.pdf", 0))).toMatch(/vide/);
  });
});

describe("mergeFiles", () => {
  it("ignore un fichier deja present dans le lot", () => {
    const a = pdf("a.pdf");
    const b = pdf("b.pdf");
    expect(mergeFiles([a], [pdf("a.pdf"), b])).toEqual([a, b]);
  });
});

describe("titleFromFileName", () => {
  it("retire l'extension et les separateurs", () => {
    expect(titleFromFileName("devoir_algo-2025.pdf")).toBe("devoir algo 2025");
  });
});

describe("addExamFormSchema", () => {
  it("accepte un formulaire complet", () => {
    expect(
      addExamFormSchema.safeParse({ ...validValues, files: [entry()] }).success,
    ).toBe(true);
  });

  it("renvoie un message par champ commun manquant", () => {
    const result = addExamFormSchema.safeParse({
      fieldId: "",
      levelId: "",
      subjectId: "",
      session: null,
      examType: null,
      files: [],
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(toFieldErrors(result.error)).toEqual({
      errors: {
        fieldId: "Choisissez une filière.",
        levelId: "Choisissez un niveau.",
        subjectId: "Choisissez une matière dans la liste.",
        session: "Choisissez une session.",
        examType: "Choisissez un type d'évaluation.",
        files: "Ajoutez au moins un fichier.",
      },
      fileErrors: {},
    });
  });

  it("indexe les erreurs de titre et d'annee par fichier", () => {
    const result = addExamFormSchema.safeParse({
      ...validValues,
      files: [entry(), { file: pdf("b.pdf"), title: "", academicYear: "" }],
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(toFieldErrors(result.error).fileErrors).toEqual({
      1: {
        title: "Le titre doit contenir au moins 3 caractères.",
        academicYear: "Choisissez une année académique.",
      },
    });
  });

  it("refuse un lot contenant un fichier invalide ou trop de fichiers", () => {
    const invalid = new File(["x"], "a.txt", { type: "text/plain" });
    expect(
      addExamFormSchema.safeParse({
        ...validValues,
        files: [entry(invalid)],
      }).success,
    ).toBe(false);
    const tooMany = [1, 2, 3, 4, 5].map((i) => entry(pdf(`${i}.pdf`)));
    expect(
      addExamFormSchema.safeParse({ ...validValues, files: tooMany }).success,
    ).toBe(false);
  });
});

describe("toBatchFormData", () => {
  it("aligne une valeur de chaque metadonnee par fichier", () => {
    const parsed = addExamFormSchema.parse({
      ...validValues,
      files: [entry(pdf("a.pdf"), "Devoir A"), entry(pdf("b.pdf"), "Devoir B")],
    });
    const formData = toBatchFormData(parsed);
    expect(formData.getAll("files")).toHaveLength(2);
    for (const name of [
      "title",
      "academicYear",
      "session",
      "examType",
      "fieldId",
      "levelId",
      "subjectId",
      "optionId",
    ]) {
      expect(formData.getAll(name)).toHaveLength(2);
    }
    expect(formData.getAll("optionId")).toEqual(["", ""]);
    expect(formData.getAll("title")).toEqual(["Devoir A", "Devoir B"]);
  });
});
