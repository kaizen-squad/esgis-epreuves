import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExamQuadruplet } from "./duplicate";

type QueryResult = { data: unknown; error: unknown };

/** Constructeur de requete chainable minimal, suffisant pour les deux requetes de duplicate.ts. */
function makeQueryBuilder(result: QueryResult) {
  const builder = {
    eq: vi.fn(() => builder),
    neq: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: QueryResult) => void) =>
      Promise.resolve(result).then(resolve),
  };
  return builder;
}

const hashResult: QueryResult = { data: null, error: null };
const quadrupletResult: QueryResult = { data: [], error: null };

const select = vi.fn();
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from }),
}));

const { checkExamDuplicate } = await import("./duplicate");

const QUADRUPLET: ExamQuadruplet = {
  subjectId: "11111111-1111-4111-a111-111111111111",
  academicYear: "2024-2025",
  session: "Session Normale",
  examType: "Contrôle Terminal",
};
const FILE_HASH = "a".repeat(64);
const MATCH = { id: "exam-1", slug: "algo-s1-abc12345", title: "Algo S1" };

beforeEach(() => {
  from.mockClear();
  select.mockReset().mockImplementation(() => makeQueryBuilder(hashResult));
  hashResult.data = null;
  hashResult.error = null;
  quadrupletResult.data = [];
  quadrupletResult.error = null;
});

describe("checkExamDuplicate", () => {
  it("ne signale rien quand ni le hash ni le quadruplet ne matchent", async () => {
    select
      .mockImplementationOnce(() => makeQueryBuilder(hashResult))
      .mockImplementationOnce(() => makeQueryBuilder(quadrupletResult));

    const result = await checkExamDuplicate(FILE_HASH, QUADRUPLET);

    expect(result).toEqual({ kind: "none" });
  });

  it("signale le hash en priorite quand le fichier existe deja", async () => {
    hashResult.data = MATCH;
    select
      .mockImplementationOnce(() => makeQueryBuilder(hashResult))
      .mockImplementationOnce(() => makeQueryBuilder(quadrupletResult));

    const result = await checkExamDuplicate(FILE_HASH, QUADRUPLET);

    expect(result).toEqual({ kind: "hash", exam: MATCH });
  });

  it("signale le quadruplet seulement quand le hash ne matche pas", async () => {
    quadrupletResult.data = [MATCH];
    select
      .mockImplementationOnce(() => makeQueryBuilder(hashResult))
      .mockImplementationOnce(() => makeQueryBuilder(quadrupletResult));

    const result = await checkExamDuplicate(FILE_HASH, QUADRUPLET);

    expect(result).toEqual({ kind: "quadruplet", exam: MATCH });
  });

  it("filtre le quadruplet sur matiere, annee academique, session et type (et rien d'autre)", async () => {
    const hashBuilder = makeQueryBuilder(hashResult);
    const quadrupletBuilder = makeQueryBuilder(quadrupletResult);
    select
      .mockImplementationOnce(() => hashBuilder)
      .mockImplementationOnce(() => quadrupletBuilder);

    await checkExamDuplicate(FILE_HASH, QUADRUPLET);

    expect(hashBuilder.eq).toHaveBeenCalledWith("file_hash", FILE_HASH);
    expect(quadrupletBuilder.eq).toHaveBeenCalledTimes(4);
    expect(quadrupletBuilder.eq).toHaveBeenNthCalledWith(
      1,
      "subject_id",
      QUADRUPLET.subjectId,
    );
    expect(quadrupletBuilder.eq).toHaveBeenNthCalledWith(
      2,
      "academic_year",
      QUADRUPLET.academicYear,
    );
    expect(quadrupletBuilder.eq).toHaveBeenNthCalledWith(
      3,
      "session",
      QUADRUPLET.session,
    );
    expect(quadrupletBuilder.eq).toHaveBeenNthCalledWith(
      4,
      "exam_type",
      QUADRUPLET.examType,
    );
  });

  it("ne cherche pas le quadruplet quand le hash matche deja", async () => {
    hashResult.data = MATCH;
    const hashBuilder = makeQueryBuilder(hashResult);
    select.mockImplementationOnce(() => hashBuilder);

    await checkExamDuplicate(FILE_HASH, QUADRUPLET);

    expect(select).toHaveBeenCalledTimes(1);
  });

  it("exclut l'epreuve donnee des deux recherches quand excludeExamId est fourni", async () => {
    const hashBuilder = makeQueryBuilder(hashResult);
    const quadrupletBuilder = makeQueryBuilder(quadrupletResult);
    select
      .mockImplementationOnce(() => hashBuilder)
      .mockImplementationOnce(() => quadrupletBuilder);

    await checkExamDuplicate(FILE_HASH, QUADRUPLET, "exam-self");

    expect(hashBuilder.neq).toHaveBeenCalledWith("id", "exam-self");
    expect(quadrupletBuilder.neq).toHaveBeenCalledWith("id", "exam-self");
  });

  it("propage l'erreur du hash sans interroger le quadruplet", async () => {
    hashResult.error = { code: "500" };
    select.mockImplementationOnce(() => makeQueryBuilder(hashResult));

    await expect(checkExamDuplicate(FILE_HASH, QUADRUPLET)).rejects.toEqual({
      code: "500",
    });
    expect(select).toHaveBeenCalledTimes(1);
  });

  it("propage l'erreur du quadruplet", async () => {
    quadrupletResult.error = { code: "500" };
    select
      .mockImplementationOnce(() => makeQueryBuilder(hashResult))
      .mockImplementationOnce(() => makeQueryBuilder(quadrupletResult));

    await expect(checkExamDuplicate(FILE_HASH, QUADRUPLET)).rejects.toEqual({
      code: "500",
    });
  });
});
