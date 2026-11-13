import { beforeEach, describe, expect, it, vi } from "vitest";

const maybeSingle = vi.fn();
const lookupEq = vi.fn(() => ({ maybeSingle }));
const lookupSelect = vi.fn(() => ({ eq: lookupEq }));

const single = vi.fn();
const insertSelect = vi.fn(() => ({ single }));
const insert = vi.fn<
  (row: Record<string, unknown>) => { select: typeof insertSelect }
>(() => ({ select: insertSelect }));

const deleteEq = vi.fn();
const del = vi.fn(() => ({ eq: deleteEq }));

const from = vi.fn(() => ({ select: lookupSelect, insert, delete: del }));
const putExamFile = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from }),
}));
vi.mock("@/lib/r2/upload", () => ({
  putExamFile: (...args: unknown[]) => putExamFile(...args),
}));

const { uploadExam } = await import("./actions");

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

beforeEach(() => {
  maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
  single
    .mockReset()
    .mockResolvedValue({ data: { id: "exam-new" }, error: null });
  deleteEq.mockReset().mockResolvedValue({ error: null });
  insert.mockClear();
  insertSelect.mockClear();
  lookupEq.mockClear();
  lookupSelect.mockClear();
  del.mockClear();
  from.mockClear();
  putExamFile.mockReset().mockResolvedValue(undefined);
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

  it("recherche le doublon par le hash exact du contenu", async () => {
    await uploadExam(uploadForm());

    expect(lookupEq).toHaveBeenCalledWith("file_hash", FILE_HASH);
  });

  it("renvoie un avertissement de doublon sans envoyer le fichier a R2 ni inserer quand le hash existe deja", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        id: "exam-1",
        slug: "algo-s1-abc12345",
        title: "Algorithmique S1",
      },
      error: null,
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
