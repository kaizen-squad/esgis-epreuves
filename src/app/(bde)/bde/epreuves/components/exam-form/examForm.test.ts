import { describe, expect, it } from "vitest";
import { MAX_FILE_SIZE_BYTES } from "@/features/exams/schemas";
import {
  academicYears,
  addExamFormSchema,
  editExamFormSchema,
  mergeFiles,
  replaceFileFormSchema,
  toBatchFormData,
  toEditFieldErrors,
  toFieldErrors,
  toMetadataFormData,
  validateExamFile,
} from "./examForm";

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
  session: "",
  examType: "Contrôle Continu",
};

function entry(file = pdf(), academicYear = "2025-2026") {
  return { file, academicYear };
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

describe("addExamFormSchema", () => {
  it("accepte un formulaire complet (Controle Continu, sans session)", () => {
    expect(
      addExamFormSchema.safeParse({ ...validValues, files: [entry()] }).success,
    ).toBe(true);
  });

  it("accepte une annee inconnue (case cochee, #202)", () => {
    expect(
      addExamFormSchema.safeParse({
        ...validValues,
        files: [entry(pdf(), "")],
      }).success,
    ).toBe(true);
  });

  it("accepte un Controle Terminal sans session (inconnue sur une vieille epreuve, decision du 2026-11-26)", () => {
    expect(
      addExamFormSchema.safeParse({
        ...validValues,
        examType: "Contrôle Terminal",
        files: [entry()],
      }).success,
    ).toBe(true);
  });

  it("accepte un Controle Terminal avec une session renseignee", () => {
    expect(
      addExamFormSchema.safeParse({
        ...validValues,
        session: "Rattrapage",
        examType: "Contrôle Terminal",
        files: [entry()],
      }).success,
    ).toBe(true);
  });

  it("refuse une session pour un Controle Continu", () => {
    const result = addExamFormSchema.safeParse({
      ...validValues,
      session: "Session Normale",
      examType: "Contrôle Continu",
      files: [entry()],
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(toFieldErrors(result.error).errors.session).toBe(
      "Un Contrôle Continu n'a jamais de session.",
    );
  });

  it("renvoie un message par champ commun manquant", () => {
    const result = addExamFormSchema.safeParse({
      fieldId: "",
      levelId: "",
      subjectId: "",
      session: "",
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
        examType: "Choisissez un type d'évaluation.",
        files: "Ajoutez au moins un fichier.",
      },
      fileErrors: {},
    });
  });

  it("indexe l'erreur d'annee par fichier", () => {
    const result = addExamFormSchema.safeParse({
      ...validValues,
      files: [entry(), { file: pdf("b.pdf"), academicYear: "2024" }],
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(toFieldErrors(result.error).fileErrors).toEqual({
      1: { academicYear: "Format attendu : AAAA-AAAA." },
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
      files: [entry(pdf("a.pdf"), "2025-2026"), entry(pdf("b.pdf"), "")],
    });
    const formData = toBatchFormData(parsed);
    expect(formData.getAll("files")).toHaveLength(2);
    for (const name of [
      "academicYear",
      "session",
      "examType",
      "fieldId",
      "levelId",
      "subjectId",
    ]) {
      expect(formData.getAll(name)).toHaveLength(2);
    }
    expect(formData.getAll("academicYear")).toEqual(["2025-2026", ""]);
    expect(formData.has("title")).toBe(false);
    expect(formData.has("optionId")).toBe(false);
  });
});

describe("editExamFormSchema", () => {
  const editValues = { ...validValues, academicYear: "2024-2025" };

  it("accepte une epreuve en Controle Continu", () => {
    expect(editExamFormSchema.safeParse(editValues).success).toBe(true);
  });

  it("accepte une annee inconnue", () => {
    expect(
      editExamFormSchema.safeParse({ ...editValues, academicYear: "" }).success,
    ).toBe(true);
  });

  it("renvoie le premier message par champ", () => {
    const result = editExamFormSchema.safeParse({
      ...editValues,
      academicYear: "2024",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(toEditFieldErrors(result.error)).toEqual({
      academicYear: "Format attendu : AAAA-AAAA.",
    });
  });

  it("produit le FormData attendu par updateExamMetadata", () => {
    const formData = toMetadataFormData(editExamFormSchema.parse(editValues));
    expect(Object.fromEntries(formData)).toEqual(editValues);
  });
});

describe("replaceFileFormSchema", () => {
  it("accepte un PDF valide", () => {
    expect(replaceFileFormSchema.safeParse({ file: pdf() }).success).toBe(true);
  });

  it("exige un fichier et refuse un fichier invalide", () => {
    const missing = replaceFileFormSchema.safeParse({ file: null });
    expect(missing.success).toBe(false);
    if (!missing.success) {
      expect(missing.error.issues[0]?.message).toBe(
        "Ajoutez le nouveau fichier.",
      );
    }
    const text = new File(["x"], "a.txt", { type: "text/plain" });
    expect(replaceFileFormSchema.safeParse({ file: text }).success).toBe(false);
  });
});
