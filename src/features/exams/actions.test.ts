import { beforeEach, describe, expect, it, vi } from "vitest";

const single = vi.fn();
const insertSelect = vi.fn(() => ({ single }));
const insert = vi.fn<
  (row: Record<string, unknown>) => { select: typeof insertSelect }
>(() => ({ select: insertSelect }));

const deleteMaybeSingle = vi.fn();
const deleteSelect = vi.fn(() => ({ maybeSingle: deleteMaybeSingle }));
const deleteEq = vi.fn(() => ({ select: deleteSelect }));
const del = vi.fn(() => ({ eq: deleteEq }));

const maybeSingle = vi.fn();
const selectEq = vi.fn(() => ({ maybeSingle }));
const select = vi.fn(() => ({ eq: selectEq }));

const updateSelect = vi.fn();
const updateEq = vi.fn(() => ({ select: updateSelect }));
const update = vi.fn<(row: Record<string, unknown>) => { eq: typeof updateEq }>(
  () => ({ eq: updateEq }),
);

const from = vi.fn(() => ({ insert, delete: del, select, update }));
const putExamFile = vi.fn();
const deleteExamFile = vi.fn();
const checkExamDuplicate = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from }),
}));
vi.mock("@/lib/r2/upload", () => ({
  putExamFile: (...args: unknown[]) => putExamFile(...args),
  deleteExamFile: (...args: unknown[]) => deleteExamFile(...args),
}));
vi.mock("./duplicate", () => ({
  checkExamDuplicate: (...args: unknown[]) => checkExamDuplicate(...args),
}));

const {
  uploadExam,
  updateExamMetadata,
  replaceExamFile,
  deleteExam,
  uploadExamsBatch,
} = await import("./actions");
const { MAX_BATCH_FILES } = await import("./schemas");

const UUID = "11111111-1111-4111-a111-111111111111";
const OPTION_UUID = "22222222-2222-4222-a222-222222222222";
/** sha256 hex du contenu de fichier utilise par defaut dans les tests ("%PDF-1.4"). */
const FILE_HASH =
  "e16fa5d9b51928755db85b917f0297babaf22c7a47e97d9212adab56e61ba04e";

function uploadForm(overrides: Record<string, string | File> = {}) {
  const formData = new FormData();
  const defaults: Record<string, string | File> = {
    title: "Algorithmique S1",
    academicYear: "2024-2025",
    session: "Session Normale",
    examType: "Contrôle Terminal",
    fieldId: UUID,
    levelId: UUID,
    subjectId: UUID,
    file: new File(["%PDF-1.4"], "exam.pdf", { type: "application/pdf" }),
  };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    formData.set(key, value);
  }
  return formData;
}

const EXAM_ID = "33333333-3333-4333-a333-333333333333";

/** Un subjectId distinct par defaut pour chaque entree d'un lot (#56) : evite que les entrees
 * par defaut d'un `batchForm` partagent le meme quadruplet matiere/annee/session/type. */
const BATCH_SUBJECT_UUIDS = [
  "44444444-4444-4444-a444-444444444441",
  "44444444-4444-4444-a444-444444444442",
  "44444444-4444-4444-a444-444444444443",
  "44444444-4444-4444-a444-444444444444",
  "44444444-4444-4444-a444-444444444445",
];

function batchForm(
  entries: Array<{
    title?: string;
    academicYear?: string;
    session?: string;
    examType?: string;
    fieldId?: string;
    levelId?: string;
    subjectId?: string;
    optionId?: string;
    file?: File;
    /** Contenu du fichier par defaut : deux entrees avec le meme `content` produisent le meme hash. */
    content?: string | number;
  }>,
) {
  const formData = new FormData();
  entries.forEach((entry, i) => {
    const file =
      entry.file ??
      new File([`%PDF-1.4 lot-${entry.content ?? i}`], `exam-${i}.pdf`, {
        type: "application/pdf",
      });
    formData.append("files", file);
    formData.append("title", entry.title ?? `Epreuve ${i}`);
    formData.append("academicYear", entry.academicYear ?? "2024-2025");
    formData.append("session", entry.session ?? "Session Normale");
    formData.append("examType", entry.examType ?? "Contrôle Terminal");
    formData.append("fieldId", entry.fieldId ?? UUID);
    formData.append("levelId", entry.levelId ?? UUID);
    formData.append(
      "subjectId",
      entry.subjectId ??
        BATCH_SUBJECT_UUIDS[i] ??
        BATCH_SUBJECT_UUIDS[0] ??
        UUID,
    );
    formData.append("optionId", entry.optionId ?? "");
  });
  return formData;
}

beforeEach(() => {
  checkExamDuplicate.mockReset().mockResolvedValue({ kind: "none" });
  single
    .mockReset()
    .mockResolvedValue({ data: { id: "exam-new" }, error: null });
  deleteEq.mockReset().mockImplementation(() => ({ select: deleteSelect }));
  deleteSelect
    .mockReset()
    .mockImplementation(() => ({ maybeSingle: deleteMaybeSingle }));
  deleteMaybeSingle
    .mockReset()
    .mockResolvedValue({ data: { r2_key: "exams/abc.pdf" }, error: null });
  maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
  updateEq.mockReset().mockImplementation(() => ({ select: updateSelect }));
  updateSelect
    .mockReset()
    .mockResolvedValue({ data: [{ id: "exam-id" }], error: null });
  insert.mockClear();
  insertSelect.mockClear();
  del.mockClear();
  select.mockClear();
  selectEq.mockClear();
  update.mockClear();
  from.mockClear();
  putExamFile.mockReset().mockResolvedValue(undefined);
  deleteExamFile.mockReset().mockResolvedValue(undefined);
});

describe("uploadExam", () => {
  it("rejette des donnees invalides sans toucher a R2 ni a la base", async () => {
    const result = await uploadExam(uploadForm({ academicYear: "2024" }));

    expect(result.ok).toBe(false);
    expect(putExamFile).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejette un fichier dont le contenu n'est pas un PDF malgre un type MIME declare correct", async () => {
    const result = await uploadExam(
      uploadForm({
        file: new File(["PNG-fake"], "exam.pdf", { type: "application/pdf" }),
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: "Le fichier n'est pas un PDF valide.",
    });
    expect(putExamFile).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("verifie le doublon avec le hash du contenu et le quadruplet du formulaire", async () => {
    await uploadExam(uploadForm());

    expect(checkExamDuplicate).toHaveBeenCalledWith(FILE_HASH, {
      subjectId: UUID,
      academicYear: "2024-2025",
      session: "Session Normale",
      examType: "Contrôle Terminal",
    });
  });

  it("renvoie un avertissement de doublon sans envoyer le fichier a R2 ni inserer quand le hash existe deja", async () => {
    checkExamDuplicate.mockResolvedValue({
      kind: "hash",
      exam: {
        id: "exam-1",
        slug: "algo-s1-abc12345",
        title: "Algorithmique S1",
      },
    });

    const result = await uploadExam(uploadForm());

    expect(result.ok).toBe(false);
    if (!result.ok && "duplicate" in result) {
      expect(result.duplicate).toEqual({
        examId: "exam-1",
        slug: "algo-s1-abc12345",
        title: "Algorithmique S1",
      });
    } else {
      throw new Error("resultat sans duplicate");
    }
    expect(putExamFile).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("insere l'epreuve et envoie le fichier a R2 malgre un quadruplet identique, avec un avertissement non bloquant", async () => {
    checkExamDuplicate.mockResolvedValue({
      kind: "quadruplet",
      exam: {
        id: "exam-2",
        slug: "algo-s1-def67890",
        title: "Algorithmique S1 (ancienne version)",
      },
    });

    const result = await uploadExam(uploadForm());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warning).toEqual({
        examId: "exam-2",
        slug: "algo-s1-def67890",
        title: "Algorithmique S1 (ancienne version)",
      });
    }
    expect(insert).toHaveBeenCalledTimes(1);
    expect(putExamFile).toHaveBeenCalledTimes(1);
  });

  it("renvoie une erreur generique quand la verification de doublon echoue", async () => {
    checkExamDuplicate.mockRejectedValue(new Error("connexion perdue"));

    const result = await uploadExam(uploadForm());

    expect(result).toEqual({
      ok: false,
      error: "Impossible d'enregistrer l'epreuve.",
    });
    expect(putExamFile).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("insere l'epreuve avant d'envoyer le fichier a R2, avec les bonnes colonnes", async () => {
    const result = await uploadExam(uploadForm({ optionId: OPTION_UUID }));

    expect(result).toEqual({ ok: true, data: { slug: expect.any(String) } });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert.mock.calls[0]![0]).toEqual({
      title: "Algorithmique S1",
      slug: expect.any(String),
      academic_year: "2024-2025",
      session: "Session Normale",
      exam_type: "Contrôle Terminal",
      field_id: UUID,
      level_id: UUID,
      subject_id: UUID,
      option_id: OPTION_UUID,
      file_hash: FILE_HASH,
      file_mime_type: "application/pdf",
      file_size: 8,
      r2_key: `exams/${FILE_HASH}.pdf`,
    });
    expect(putExamFile).toHaveBeenCalledWith(
      `exams/${FILE_HASH}.pdf`,
      expect.anything(),
    );
    expect(del).not.toHaveBeenCalled();
  });

  it("transmet null comme option_id quand aucune option n'est fournie", async () => {
    await uploadExam(uploadForm());

    expect(insert.mock.calls[0]![0].option_id).toBeNull();
  });

  it("traite une violation d'unicite sur le hash a l'insertion comme un doublon, sans toucher a R2", async () => {
    single.mockResolvedValue({ data: null, error: { code: "23505" } });

    const result = await uploadExam(uploadForm());

    expect(result).toEqual({
      ok: false,
      error: "Ce fichier a deja ete depose.",
    });
    expect(putExamFile).not.toHaveBeenCalled();
  });

  it("renvoie une erreur generique pour toute autre erreur d'insertion", async () => {
    single.mockResolvedValue({ data: null, error: { code: "23503" } });

    const result = await uploadExam(uploadForm());

    expect(result).toEqual({
      ok: false,
      error: "Impossible d'enregistrer l'epreuve.",
    });
    expect(putExamFile).not.toHaveBeenCalled();
  });

  it("supprime la ligne inseree quand l'envoi a R2 echoue", async () => {
    putExamFile.mockRejectedValue(new Error("R2 indisponible"));

    const result = await uploadExam(uploadForm());

    expect(result).toEqual({
      ok: false,
      error: "Impossible de deposer le fichier.",
    });
    expect(del).toHaveBeenCalledTimes(1);
    expect(deleteEq).toHaveBeenCalledWith("id", "exam-new");
  });
});

function metadataForm(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const defaults: Record<string, string> = {
    title: "Algorithmique S1",
    academicYear: "2024-2025",
    session: "Session Normale",
    examType: "Contrôle Terminal",
    fieldId: UUID,
    levelId: UUID,
    subjectId: UUID,
  };
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    formData.set(key, value);
  }
  return formData;
}

const CURRENT_EXAM = {
  file_hash: "a".repeat(64),
  slug: "algo-s1-abc12345",
};

describe("updateExamMetadata", () => {
  it("rejette un identifiant d'epreuve invalide sans toucher a la base", async () => {
    const result = await updateExamMetadata("not-a-uuid", metadataForm());

    expect(result).toEqual({ ok: false, error: "Epreuve introuvable." });
    expect(from).not.toHaveBeenCalled();
  });

  it("rejette des donnees invalides sans toucher a la base", async () => {
    const result = await updateExamMetadata(
      EXAM_ID,
      metadataForm({ academicYear: "2024" }),
    );

    expect(result.ok).toBe(false);
    expect(from).not.toHaveBeenCalled();
  });

  it("renvoie une erreur quand l'epreuve n'existe pas", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await updateExamMetadata(EXAM_ID, metadataForm());

    expect(result).toEqual({ ok: false, error: "Epreuve introuvable." });
    expect(update).not.toHaveBeenCalled();
  });

  it("verifie le doublon avec le hash actuel de l'epreuve et exclut l'epreuve elle-meme", async () => {
    maybeSingle.mockResolvedValue({ data: CURRENT_EXAM, error: null });

    await updateExamMetadata(EXAM_ID, metadataForm());

    expect(checkExamDuplicate).toHaveBeenCalledWith(
      CURRENT_EXAM.file_hash,
      {
        subjectId: UUID,
        academicYear: "2024-2025",
        session: "Session Normale",
        examType: "Contrôle Terminal",
      },
      EXAM_ID,
    );
  });

  it("met a jour les colonnes attendues avec une option fournie", async () => {
    maybeSingle.mockResolvedValue({ data: CURRENT_EXAM, error: null });

    const result = await updateExamMetadata(
      EXAM_ID,
      metadataForm({ optionId: OPTION_UUID }),
    );

    expect(result).toEqual({ ok: true, data: { slug: CURRENT_EXAM.slug } });
    expect(update).toHaveBeenCalledWith({
      title: "Algorithmique S1",
      academic_year: "2024-2025",
      session: "Session Normale",
      exam_type: "Contrôle Terminal",
      field_id: UUID,
      level_id: UUID,
      subject_id: UUID,
      option_id: OPTION_UUID,
    });
    expect(updateEq).toHaveBeenCalledWith("id", EXAM_ID);
  });

  it("transmet null comme option_id quand aucune option n'est fournie", async () => {
    maybeSingle.mockResolvedValue({ data: CURRENT_EXAM, error: null });

    await updateExamMetadata(EXAM_ID, metadataForm());

    expect(update.mock.calls[0]![0].option_id).toBeNull();
  });

  it("renvoie un avertissement non bloquant quand le quadruplet correspond a une autre epreuve", async () => {
    maybeSingle.mockResolvedValue({ data: CURRENT_EXAM, error: null });
    checkExamDuplicate.mockResolvedValue({
      kind: "quadruplet",
      exam: { id: "exam-2", slug: "algo-s1-def67890", title: "Ancienne" },
    });

    const result = await updateExamMetadata(EXAM_ID, metadataForm());

    expect(result).toEqual({
      ok: true,
      data: { slug: CURRENT_EXAM.slug },
      warning: {
        examId: "exam-2",
        slug: "algo-s1-def67890",
        title: "Ancienne",
      },
    });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("bloque quand le hash actuel matche une autre epreuve", async () => {
    maybeSingle.mockResolvedValue({ data: CURRENT_EXAM, error: null });
    checkExamDuplicate.mockResolvedValue({
      kind: "hash",
      exam: { id: "exam-3", slug: "algo-s1-xyz", title: "Autre" },
    });

    const result = await updateExamMetadata(EXAM_ID, metadataForm());

    expect(result).toEqual({
      ok: false,
      error: "Ce fichier a deja ete depose.",
      duplicate: { examId: "exam-3", slug: "algo-s1-xyz", title: "Autre" },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("renvoie une erreur generique quand la mise a jour echoue", async () => {
    maybeSingle.mockResolvedValue({ data: CURRENT_EXAM, error: null });
    updateSelect.mockResolvedValue({ data: null, error: { code: "XX000" } });

    const result = await updateExamMetadata(EXAM_ID, metadataForm());

    expect(result).toEqual({
      ok: false,
      error: "Impossible de modifier l'epreuve.",
    });
  });

  it("renvoie une erreur quand la RLS refuse la mise a jour sans erreur Supabase (role non BDE)", async () => {
    maybeSingle.mockResolvedValue({ data: CURRENT_EXAM, error: null });
    updateSelect.mockResolvedValue({ data: [], error: null });

    const result = await updateExamMetadata(EXAM_ID, metadataForm());

    expect(result).toEqual({ ok: false, error: "Epreuve introuvable." });
  });
});

function fileForm(file?: File) {
  const formData = new FormData();
  formData.set(
    "file",
    file ?? new File(["%PDF-1.4"], "exam.pdf", { type: "application/pdf" }),
  );
  return formData;
}

const CURRENT_EXAM_FOR_REPLACE = {
  slug: "algo-s1-abc12345",
  subject_id: UUID,
  academic_year: "2024-2025",
  session: "Session Normale",
  exam_type: "Contrôle Terminal",
  r2_key: "exams/old-hash.pdf",
  file_hash: "old-hash",
  file_mime_type: "application/pdf",
  file_size: 42,
};

describe("replaceExamFile", () => {
  it("rejette un identifiant d'epreuve invalide sans toucher a la base", async () => {
    const result = await replaceExamFile("not-a-uuid", fileForm());

    expect(result).toEqual({ ok: false, error: "Epreuve introuvable." });
    expect(from).not.toHaveBeenCalled();
  });

  it("rejette un fichier dont le contenu n'est pas un PDF malgre un type MIME declare correct", async () => {
    const result = await replaceExamFile(
      EXAM_ID,
      fileForm(new File(["PNG-fake"], "exam.pdf", { type: "application/pdf" })),
    );

    expect(result).toEqual({
      ok: false,
      error: "Le fichier n'est pas un PDF valide.",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("renvoie une erreur quand l'epreuve n'existe pas", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result).toEqual({ ok: false, error: "Epreuve introuvable." });
    expect(update).not.toHaveBeenCalled();
  });

  it("verifie le doublon avec le hash du nouveau fichier et le quadruplet actuel de l'epreuve, en l'excluant elle-meme", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });

    await replaceExamFile(EXAM_ID, fileForm());

    expect(checkExamDuplicate).toHaveBeenCalledWith(
      FILE_HASH,
      {
        subjectId: UUID,
        academicYear: "2024-2025",
        session: "Session Normale",
        examType: "Contrôle Terminal",
      },
      EXAM_ID,
    );
  });

  it("bloque sans mettre a jour la base quand le hash matche une autre epreuve", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });
    checkExamDuplicate.mockResolvedValue({
      kind: "hash",
      exam: { id: "exam-3", slug: "algo-s1-xyz", title: "Autre" },
    });

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result).toEqual({
      ok: false,
      error: "Ce fichier a deja ete depose.",
      duplicate: { examId: "exam-3", slug: "algo-s1-xyz", title: "Autre" },
    });
    expect(update).not.toHaveBeenCalled();
    expect(putExamFile).not.toHaveBeenCalled();
  });

  it("met a jour les colonnes de fichier, depose le nouveau puis supprime l'ancien sur R2", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result).toEqual({
      ok: true,
      data: { slug: CURRENT_EXAM_FOR_REPLACE.slug },
    });
    expect(update).toHaveBeenCalledWith({
      file_hash: FILE_HASH,
      file_mime_type: "application/pdf",
      file_size: 8,
      r2_key: `exams/${FILE_HASH}.pdf`,
    });
    expect(putExamFile).toHaveBeenCalledWith(
      `exams/${FILE_HASH}.pdf`,
      expect.anything(),
    );
    expect(deleteExamFile).toHaveBeenCalledWith(
      CURRENT_EXAM_FOR_REPLACE.r2_key,
    );
  });

  it("ne fait pas echouer le remplacement quand la suppression de l'ancien fichier R2 echoue", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });
    deleteExamFile.mockRejectedValue(new Error("R2 indisponible"));

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result.ok).toBe(true);
  });

  it("traite une violation d'unicite sur le hash a la mise a jour comme un doublon, sans toucher a R2", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });
    updateSelect.mockResolvedValue({
      data: null,
      error: { code: "23505" },
    });

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result).toEqual({
      ok: false,
      error: "Ce fichier a deja ete depose.",
    });
    expect(putExamFile).not.toHaveBeenCalled();
  });

  it("renvoie une erreur generique pour toute autre erreur de mise a jour", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });
    updateSelect.mockResolvedValue({ data: null, error: { code: "XX000" } });

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result).toEqual({
      ok: false,
      error: "Impossible de remplacer le fichier.",
    });
    expect(putExamFile).not.toHaveBeenCalled();
  });

  it("renvoie une erreur quand la RLS refuse la mise a jour sans erreur Supabase (role non BDE), sans toucher a R2", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });
    updateSelect.mockResolvedValue({ data: [], error: null });

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result).toEqual({ ok: false, error: "Epreuve introuvable." });
    expect(putExamFile).not.toHaveBeenCalled();
    expect(deleteExamFile).not.toHaveBeenCalled();
  });

  it("ne supprime pas le fichier qu'on vient de deposer quand le remplacement utilise un contenu identique", async () => {
    maybeSingle.mockResolvedValue({
      data: { ...CURRENT_EXAM_FOR_REPLACE, r2_key: `exams/${FILE_HASH}.pdf` },
      error: null,
    });

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result.ok).toBe(true);
    expect(putExamFile).toHaveBeenCalledWith(
      `exams/${FILE_HASH}.pdf`,
      expect.anything(),
    );
    expect(deleteExamFile).not.toHaveBeenCalled();
  });

  it("renvoie un avertissement non bloquant quand le quadruplet correspond a une autre epreuve", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });
    checkExamDuplicate.mockResolvedValue({
      kind: "quadruplet",
      exam: { id: "exam-2", slug: "algo-s1-def67890", title: "Ancienne" },
    });

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result).toEqual({
      ok: true,
      data: { slug: CURRENT_EXAM_FOR_REPLACE.slug },
      warning: {
        examId: "exam-2",
        slug: "algo-s1-def67890",
        title: "Ancienne",
      },
    });
  });

  it("revient aux anciennes colonnes de fichier quand l'envoi a R2 echoue", async () => {
    maybeSingle.mockResolvedValue({
      data: CURRENT_EXAM_FOR_REPLACE,
      error: null,
    });
    putExamFile.mockRejectedValue(new Error("R2 indisponible"));

    const result = await replaceExamFile(EXAM_ID, fileForm());

    expect(result).toEqual({
      ok: false,
      error: "Impossible de deposer le fichier.",
    });
    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenNthCalledWith(2, {
      file_hash: CURRENT_EXAM_FOR_REPLACE.file_hash,
      file_mime_type: CURRENT_EXAM_FOR_REPLACE.file_mime_type,
      file_size: CURRENT_EXAM_FOR_REPLACE.file_size,
      r2_key: CURRENT_EXAM_FOR_REPLACE.r2_key,
    });
    expect(deleteExamFile).not.toHaveBeenCalled();
  });
});

describe("deleteExam", () => {
  it("rejette un identifiant d'epreuve invalide sans toucher a la base", async () => {
    const result = await deleteExam("not-a-uuid");

    expect(result).toEqual({ ok: false, error: "Epreuve introuvable." });
    expect(from).not.toHaveBeenCalled();
  });

  it("renvoie une erreur sans toucher a R2 quand l'epreuve n'existe pas ou quand la RLS refuse la suppression (role non BDE, sans erreur Supabase dans ce cas)", async () => {
    deleteMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await deleteExam(EXAM_ID);

    expect(result).toEqual({ ok: false, error: "Epreuve introuvable." });
    expect(deleteExamFile).not.toHaveBeenCalled();
  });

  it("supprime la ligne puis le fichier R2 correspondant", async () => {
    deleteMaybeSingle.mockResolvedValue({
      data: { r2_key: "exams/abc.pdf" },
      error: null,
    });

    const result = await deleteExam(EXAM_ID);

    expect(result).toEqual({ ok: true, data: null });
    expect(deleteEq).toHaveBeenCalledWith("id", EXAM_ID);
    expect(deleteExamFile).toHaveBeenCalledWith("exams/abc.pdf");
  });

  it("ne fait pas echouer la suppression quand celle du fichier R2 echoue", async () => {
    deleteMaybeSingle.mockResolvedValue({
      data: { r2_key: "exams/abc.pdf" },
      error: null,
    });
    deleteExamFile.mockRejectedValue(new Error("R2 indisponible"));

    const result = await deleteExam(EXAM_ID);

    expect(result.ok).toBe(true);
  });

  it("renvoie une erreur generique quand la suppression en base echoue", async () => {
    deleteMaybeSingle.mockResolvedValue({
      data: null,
      error: { code: "XX000" },
    });

    const result = await deleteExam(EXAM_ID);

    expect(result).toEqual({
      ok: false,
      error: "Impossible de supprimer l'epreuve.",
    });
    expect(deleteExamFile).not.toHaveBeenCalled();
  });
});

describe("uploadExamsBatch", () => {
  it("rejette un lot sans fichier", async () => {
    const result = await uploadExamsBatch(batchForm([]));

    expect(result).toEqual({ ok: false, error: "Aucun fichier fourni." });
    expect(from).not.toHaveBeenCalled();
  });

  it(`rejette un lot au-dela de ${MAX_BATCH_FILES} fichiers`, async () => {
    const entries = Array.from({ length: MAX_BATCH_FILES + 1 }, () => ({}));

    const result = await uploadExamsBatch(batchForm(entries));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain(String(MAX_BATCH_FILES));
    }
    expect(from).not.toHaveBeenCalled();
  });

  it("rejette un lot dont les tableaux de metadonnees ne sont pas alignes avec les fichiers", async () => {
    const formData = batchForm([{}, {}]);
    // Retire une des deux valeurs de "title" : deux fichiers, un seul titre.
    const titles = formData.getAll("title");
    formData.delete("title");
    formData.append("title", titles[0] as string);

    const result = await uploadExamsBatch(formData);

    expect(result.ok).toBe(false);
    if (!result.ok && "fieldErrors" in result) {
      expect(result.error).toBe("Donnees invalides.");
      expect(result.fieldErrors).toHaveProperty("title");
    } else {
      expect.unreachable("fieldErrors attendu sur le resultat");
    }
    expect(from).not.toHaveBeenCalled();
  });

  it("traite chaque fichier independamment et renvoie un resultat par fichier", async () => {
    const result = await uploadExamsBatch(batchForm([{}, {}]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries).toHaveLength(2);
    expect(result.data.entries[0]).toMatchObject({ status: "imported" });
    expect(result.data.entries[1]).toMatchObject({ status: "imported" });
    expect(result.data.summary).toEqual({
      total: 2,
      imported: 2,
      warnings: 0,
      duplicates: 0,
      errors: 0,
    });
    expect(insert).toHaveBeenCalledTimes(2);
    expect(putExamFile).toHaveBeenCalledTimes(2);
  });

  it("rejette une entree avec des donnees invalides sans interrompre les fichiers suivants du lot", async () => {
    const result = await uploadExamsBatch(
      batchForm([{ academicYear: "2024" }, {}]),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries[0]).toMatchObject({
      status: "error",
      message: "Donnees invalides.",
    });
    expect(result.data.entries[1]).toMatchObject({ status: "imported" });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("detecte un doublon de hash entre deux fichiers du meme lot sans bloquer le premier", async () => {
    const result = await uploadExamsBatch(
      batchForm([{ content: "memefichier" }, { content: "memefichier" }]),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries[0]).toMatchObject({ status: "imported" });
    expect(result.data.entries[1]?.status).toBe("duplicate");
    expect(insert).toHaveBeenCalledTimes(1);
    expect(putExamFile).toHaveBeenCalledTimes(1);
  });

  it("bloque un fichier dont le hash existe deja en base sans bloquer les autres fichiers du lot", async () => {
    checkExamDuplicate.mockResolvedValueOnce({
      kind: "hash",
      exam: {
        id: "exam-1",
        slug: "algo-s1-abc12345",
        title: "Algorithmique S1",
      },
    });

    const result = await uploadExamsBatch(batchForm([{}, {}]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const duplicateEntry = result.data.entries[0];
    expect(duplicateEntry?.status).toBe("duplicate");
    expect(
      duplicateEntry?.status === "duplicate"
        ? duplicateEntry.existing
        : undefined,
    ).toEqual({
      examId: "exam-1",
      slug: "algo-s1-abc12345",
      title: "Algorithmique S1",
    });
    expect(result.data.entries[1]).toMatchObject({ status: "imported" });
    expect(insert).toHaveBeenCalledTimes(1);
    expect(putExamFile).toHaveBeenCalledTimes(1);
  });

  it("reclasse une collision d'unicite sur le hash a l'insertion comme doublon, sans toucher a R2", async () => {
    single.mockResolvedValueOnce({
      data: null,
      error: {
        code: "23505",
        message:
          'duplicate key value violates unique constraint "exams_file_hash_key"',
      },
    });

    const result = await uploadExamsBatch(batchForm([{}]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries[0]).toMatchObject({ status: "duplicate" });
    expect(result.data.summary.duplicates).toBe(1);
    expect(putExamFile).not.toHaveBeenCalled();
  });

  it("n'interrompt pas le lot quand une insertion est refusee par la RLS (role non BDE), sans toucher a R2", async () => {
    single
      .mockReset()
      .mockResolvedValueOnce({ data: null, error: { code: "42501" } })
      .mockResolvedValueOnce({ data: { id: "exam-2" }, error: null });

    const result = await uploadExamsBatch(batchForm([{}, {}]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries[0]).toMatchObject({
      status: "error",
      message: "Impossible d'enregistrer l'epreuve.",
    });
    expect(result.data.entries[1]).toMatchObject({ status: "imported" });
    expect(putExamFile).toHaveBeenCalledTimes(1);
  });

  it("rejette un fichier dont le contenu n'est pas un PDF malgre un type MIME declare correct, sans bloquer les autres fichiers du lot", async () => {
    const result = await uploadExamsBatch(
      batchForm([
        {
          file: new File(["PNG-fake"], "exam-0.pdf", {
            type: "application/pdf",
          }),
        },
        {},
      ]),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries[0]).toMatchObject({
      status: "error",
      message: "Le fichier n'est pas un PDF valide.",
    });
    expect(result.data.entries[1]).toMatchObject({ status: "imported" });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("poursuit le lot quand la verification de doublon echoue pour un fichier", async () => {
    checkExamDuplicate.mockRejectedValueOnce(
      new Error("Supabase indisponible"),
    );

    const result = await uploadExamsBatch(batchForm([{}, {}]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries[0]).toMatchObject({
      status: "error",
      message: "Impossible de verifier les doublons.",
    });
    expect(result.data.entries[1]).toMatchObject({ status: "imported" });
  });

  it("convertit une option vide en absence d'option a l'insertion, au bon index", async () => {
    await uploadExamsBatch(
      batchForm([{ optionId: "" }, { optionId: OPTION_UUID }]),
    );

    expect(insert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ option_id: null }),
    );
    expect(insert).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ option_id: OPTION_UUID }),
    );
  });

  it("insere malgre un quadruplet identique a une epreuve existante, avec un avertissement non bloquant", async () => {
    checkExamDuplicate.mockResolvedValueOnce({
      kind: "quadruplet",
      exam: {
        id: "exam-1",
        slug: "algo-s1-abc12345",
        title: "Algorithmique S1",
      },
    });

    const result = await uploadExamsBatch(batchForm([{}]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const entry = result.data.entries[0];
    expect(entry?.status).toBe("imported");
    expect(
      entry?.status === "imported" ? entry.warning : undefined,
    ).toBeDefined();
    expect(result.data.summary.warnings).toBe(1);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(putExamFile).toHaveBeenCalledTimes(1);
  });

  it("avertit avec les donnees de l'epreuve du lot deja inseree quand un fichier suivant partage son quadruplet", async () => {
    single
      .mockReset()
      .mockResolvedValueOnce({ data: { id: "exam-1" }, error: null })
      .mockResolvedValueOnce({ data: { id: "exam-2" }, error: null });

    const result = await uploadExamsBatch(
      batchForm([
        { subjectId: BATCH_SUBJECT_UUIDS[0], title: "Algo A" },
        { subjectId: BATCH_SUBJECT_UUIDS[0], title: "Algo B" },
      ]),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries[0]).toMatchObject({ status: "imported" });
    expect(
      result.data.entries[0]?.status === "imported"
        ? result.data.entries[0].warning
        : undefined,
    ).toBeUndefined();
    const second = result.data.entries[1];
    expect(second?.status).toBe("imported");
    expect(second?.status === "imported" ? second.warning : undefined).toEqual({
      examId: "exam-1",
      slug: expect.stringContaining("algo-a"),
      title: "Algo A",
    });
  });

  it("ne construit aucun avertissement de quadruplet quand le fichier du lot qui le partage a echoue a l'insertion", async () => {
    single
      .mockReset()
      .mockResolvedValueOnce({ data: null, error: { code: "42501" } })
      .mockResolvedValueOnce({ data: { id: "exam-2" }, error: null });

    const result = await uploadExamsBatch(
      batchForm([
        { subjectId: BATCH_SUBJECT_UUIDS[0] },
        { subjectId: BATCH_SUBJECT_UUIDS[0] },
      ]),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const second = result.data.entries[1];
    expect(second?.status).toBe("imported");
    expect(
      second?.status === "imported" ? second.warning : undefined,
    ).toBeUndefined();
  });

  it("retire la ligne inseree quand le depot R2 echoue pour un fichier, sans interrompre les fichiers suivants", async () => {
    single
      .mockReset()
      .mockResolvedValueOnce({ data: { id: "exam-1" }, error: null })
      .mockResolvedValueOnce({ data: { id: "exam-2" }, error: null });
    putExamFile
      .mockReset()
      .mockRejectedValueOnce(new Error("R2 indisponible"))
      .mockResolvedValueOnce(undefined);

    const result = await uploadExamsBatch(batchForm([{}, {}]));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.entries[0]).toMatchObject({
      status: "error",
      message: "Impossible de deposer le fichier.",
    });
    expect(result.data.entries[1]).toMatchObject({ status: "imported" });
    expect(del).toHaveBeenCalledTimes(1);
    expect(deleteEq).toHaveBeenCalledWith("id", "exam-1");
  });
});
