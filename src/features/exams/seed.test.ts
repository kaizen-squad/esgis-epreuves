import { describe, expect, it, vi } from "vitest";
import { MAX_FILE_SIZE_BYTES } from "./schemas";
import {
  buildReferentialMaps,
  csvToRows,
  hashBuffer,
  isPdfBuffer,
  parseCsv,
  resolveFilePath,
  resolveSeedRow,
  runSeed,
  seedRowSchema,
  summarizeReport,
  type ReferentialMaps,
  type SeedReportEntry,
} from "./seed";

describe("parseCsv", () => {
  it("decoupe les lignes et les champs separes par des points-virgules", () => {
    expect(parseCsv("a;b;c\nd;e;f\n")).toEqual([
      ["a", "b", "c"],
      ["d", "e", "f"],
    ]);
  });

  it("retire le BOM UTF-8 en tete de fichier", () => {
    expect(parseCsv("﻿a;b\n")).toEqual([["a", "b"]]);
  });

  it("garde un champ entre guillemets contenant un point-virgule", () => {
    expect(parseCsv('a;"b;c";d\n')).toEqual([["a", "b;c", "d"]]);
  });

  it("deplie un guillemet double echappe a l'interieur d'un champ", () => {
    expect(parseCsv('a;"il dit ""bonjour""";c\n')).toEqual([
      ["a", 'il dit "bonjour"', "c"],
    ]);
  });

  it("accepte un fichier sans retour a la ligne final", () => {
    expect(parseCsv("a;b")).toEqual([["a", "b"]]);
  });

  it("garde litteral un guillemet au milieu d'un champ non encadre, sans avaler les lignes suivantes", () => {
    expect(parseCsv('a.pdf;Examen 12" final\nb.pdf;Autre\n')).toEqual([
      ["a.pdf", 'Examen 12" final'],
      ["b.pdf", "Autre"],
    ]);
  });

  it("leve une erreur sur un guillemet ouvrant jamais referme, plutot que d'avaler le reste du fichier", () => {
    expect(() => parseCsv('a.pdf;"Examen final\nb.pdf;Autre\n')).toThrow(
      /guillemet/i,
    );
  });
});

describe("csvToRows", () => {
  const CSV =
    "fichier;titre;filiere\nepreuves/a.pdf;Algo;IRT\n\n  ;  ;  \nepreuves/b.pdf;Reseaux;IRT\n";

  it("mappe chaque ligne sur son en-tete", () => {
    expect(csvToRows(CSV)).toEqual([
      { fichier: "epreuves/a.pdf", titre: "Algo", filiere: "IRT" },
      { fichier: "epreuves/b.pdf", titre: "Reseaux", filiere: "IRT" },
    ]);
  });

  it("ignore les lignes entierement vides", () => {
    expect(csvToRows(CSV)).toHaveLength(2);
  });

  it("normalise chaque valeur en NFC", () => {
    const decomposed = "étude".normalize("NFD"); // "é" decompose en e + accent combinant
    const rows = csvToRows(`titre\n${decomposed}\n`);
    expect(rows[0]?.titre).toBe("étude".normalize("NFC"));
  });

  it("renvoie un tableau vide pour un contenu vide", () => {
    expect(csvToRows("")).toEqual([]);
  });
});

describe("seedRowSchema", () => {
  const VALID = {
    fichier: "epreuves/a.pdf",
    titre: "Algorithmique S1",
    filiere: "IRT",
    niveau: "L1",
    matiere: "Algorithmique",
    option: "",
    annee_academique: "2024-2025",
    type_epreuve: "Contrôle Terminal",
    session: "Session Normale",
  };

  it("accepte une ligne complete et transforme une option vide en undefined", () => {
    const result = seedRowSchema.parse(VALID);
    expect(result.option).toBeUndefined();
  });

  it("rejette un format d'annee academique invalide", () => {
    expect(
      seedRowSchema.safeParse({ ...VALID, annee_academique: "2024" }).success,
    ).toBe(false);
  });

  it("rejette une session ou un type d'epreuve hors enum", () => {
    expect(
      seedRowSchema.safeParse({ ...VALID, session: "Vacances" }).success,
    ).toBe(false);
    expect(
      seedRowSchema.safeParse({ ...VALID, type_epreuve: "Oral" }).success,
    ).toBe(false);
  });

  it("rejette un titre trop court ou un chemin de fichier vide", () => {
    expect(seedRowSchema.safeParse({ ...VALID, titre: "Al" }).success).toBe(
      false,
    );
    expect(seedRowSchema.safeParse({ ...VALID, fichier: "" }).success).toBe(
      false,
    );
  });

  it("rejette un titre trop long (meme limite que examUploadSchema)", () => {
    expect(
      seedRowSchema.safeParse({ ...VALID, titre: "A".repeat(201) }).success,
    ).toBe(false);
  });
});

describe("buildReferentialMaps / resolveSeedRow", () => {
  const maps: ReferentialMaps = buildReferentialMaps({
    fields: [{ id: "field-irt", name: "IRT" }],
    levels: [{ id: "level-l1", name: "L1" }],
    subjects: [
      {
        id: "subject-algo",
        name: "Algorithmique",
        fieldId: "field-irt",
        levelId: "level-l1",
      },
    ],
    options: [{ id: "option-al", name: "AL", fieldId: "field-irt" }],
  });

  const ROW = seedRowSchema.parse({
    fichier: "epreuves/a.pdf",
    titre: "Algorithmique S1",
    filiere: "IRT",
    niveau: "L1",
    matiere: "Algorithmique",
    option: "",
    annee_academique: "2024-2025",
    type_epreuve: "Contrôle Terminal",
    session: "Session Normale",
  });

  it("resout les ids a partir des noms quand tout correspond", () => {
    const result = resolveSeedRow(ROW, maps);
    expect(result).toEqual({
      ok: true,
      row: {
        fieldId: "field-irt",
        levelId: "level-l1",
        subjectId: "subject-algo",
        optionId: null,
        title: "Algorithmique S1",
        academicYear: "2024-2025",
        session: "Session Normale",
        examType: "Contrôle Terminal",
        filePath: "epreuves/a.pdf",
      },
    });
  });

  it("resout l'option quand elle est renseignee", () => {
    const row = seedRowSchema.parse({
      ...ROW,
      option: "AL",
      fichier: ROW.fichier,
    });
    const result = resolveSeedRow(row, maps);
    expect(result.ok && result.row.optionId).toBe("option-al");
  });

  it("echoue sur une filiere inconnue sans toucher aux autres referentiels", () => {
    const row = { ...ROW, filiere: "Gestion" };
    const result = resolveSeedRow(row, maps);
    expect(result).toEqual({
      ok: false,
      error: 'Filiere inconnue : "Gestion".',
    });
  });

  it("echoue sur un niveau inconnu", () => {
    const row = { ...ROW, niveau: "M2" };
    expect(resolveSeedRow(row, maps).ok).toBe(false);
  });

  it("echoue sur une matiere qui n'existe pas pour cette filiere/niveau", () => {
    const row = { ...ROW, matiere: "Comptabilite" };
    expect(resolveSeedRow(row, maps).ok).toBe(false);
  });

  it("echoue sur une option qui n'existe pas pour cette filiere", () => {
    const row = { ...ROW, option: "SRS" };
    expect(resolveSeedRow(row, maps).ok).toBe(false);
  });
});

describe("resolveFilePath", () => {
  it("resout un chemin relatif simple sous le dossier source", () => {
    expect(resolveFilePath("/data/echantillon", "epreuves/a.pdf")).toBe(
      "/data/echantillon/epreuves/a.pdf",
    );
  });

  it("refuse un chemin qui remonte hors du dossier source", () => {
    expect(resolveFilePath("/data/echantillon", "../../etc/passwd")).toBeNull();
  });

  it("refuse un chemin absolu pointant ailleurs", () => {
    expect(resolveFilePath("/data/echantillon", "/etc/passwd")).toBeNull();
  });
});

describe("isPdfBuffer / hashBuffer", () => {
  it("reconnait les octets de signature %PDF-", () => {
    expect(isPdfBuffer(Buffer.from("%PDF-1.4"))).toBe(true);
    expect(isPdfBuffer(Buffer.from("PNG-fake"))).toBe(false);
  });

  it("hache de maniere stable et deterministe", () => {
    const buffer = Buffer.from("%PDF-1.4");
    expect(hashBuffer(buffer)).toBe(hashBuffer(Buffer.from("%PDF-1.4")));
    expect(hashBuffer(buffer)).toHaveLength(64);
  });
});

describe("summarizeReport", () => {
  it("compte chaque statut, et les avertissements separement des imports", () => {
    const entries: SeedReportEntry[] = [
      { file: "a.pdf", status: "imported", slug: "a-1" },
      {
        file: "b.pdf",
        status: "imported",
        slug: "b-1",
        warning: "doublon probable",
      },
      { file: "c.pdf", status: "dry-run", slug: "c-1" },
      { file: "d.pdf", status: "duplicate", message: "deja depose" },
      { file: "e.pdf", status: "error", message: "fichier introuvable" },
    ];

    expect(summarizeReport(entries)).toEqual({
      total: 5,
      imported: 3,
      duplicates: 1,
      warnings: 1,
      errors: 1,
    });
  });
});

/** Constructeur de requete chainable pour `exams`, identique au style de duplicate.test.ts. */
type QueryResult = { data: unknown; error: unknown };

function makeExamsBuilder(result: QueryResult) {
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

function makeFakeSupabase(config: {
  fields?: unknown[];
  levels?: unknown[];
  subjects?: unknown[];
  options?: unknown[];
  examsSelectQueue?: QueryResult[];
  insertResult?: QueryResult;
  deleteResult?: QueryResult;
}) {
  const examsSelectQueue = [...(config.examsSelectQueue ?? [])];
  const insertedRows: Record<string, unknown>[] = [];
  const deletedIds: string[] = [];
  const insertResult = config.insertResult ?? {
    data: { id: "inserted-1" },
    error: null,
  };
  const deleteResult = config.deleteResult ?? {
    data: [{ id: "inserted-1" }],
    error: null,
  };
  const tables: Record<string, unknown[]> = {
    fields: config.fields ?? [],
    levels: config.levels ?? [],
    subjects: config.subjects ?? [],
    options: config.options ?? [],
  };

  const from = vi.fn((table: string) => {
    if (table === "exams") {
      return {
        select: vi.fn(() => {
          const next = examsSelectQueue.shift() ?? { data: null, error: null };
          return makeExamsBuilder(next);
        }),
        insert: vi.fn((row: Record<string, unknown>) => {
          insertedRows.push(row);
          return {
            select: () => ({ single: () => Promise.resolve(insertResult) }),
          };
        }),
        delete: vi.fn(() => ({
          eq: vi.fn((_column: string, id: string) => {
            deletedIds.push(id);
            return { select: () => Promise.resolve(deleteResult) };
          }),
        })),
      };
    }
    return {
      select: vi.fn(() =>
        Promise.resolve({ data: tables[table] ?? [], error: null }),
      ),
    };
  });

  return { from, insertedRows, deletedIds };
}

const FIELDS = [{ id: "field-irt", name: "IRT" }];
const LEVELS = [{ id: "level-l1", name: "L1" }];
const SUBJECTS = [
  {
    id: "subject-algo",
    name: "Algorithmique",
    field_id: "field-irt",
    level_id: "level-l1",
  },
];
const NONE_THEN_EMPTY: QueryResult[] = [
  { data: null, error: null },
  { data: [], error: null },
];

const CSV =
  "fichier;titre;filiere;niveau;matiere;option;annee_academique;type_epreuve;session\n" +
  "epreuves/a.pdf;Algorithmique S1;IRT;L1;Algorithmique;;2024-2025;Contrôle Terminal;Session Normale\n";

function makeDeps(
  supabase: ReturnType<typeof makeFakeSupabase>,
  files: Record<string, Buffer> = {
    "/data/epreuves/a.pdf": Buffer.from("%PDF-1.4"),
  },
) {
  const putExamFile = vi.fn().mockResolvedValue(undefined);
  const readFile = vi.fn((path: string) => {
    const buffer = files[path];
    return buffer
      ? Promise.resolve(buffer)
      : Promise.reject(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
  });
  return { supabase, readFile, putExamFile };
}

describe("runSeed", () => {
  it("rapporte une ligne a importer sans ecrire en base ni sur R2 en mode dry-run", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(CSV, { baseDir: "/data", dryRun: true }, deps);

    expect(report.entries).toEqual([
      {
        file: "epreuves/a.pdf",
        status: "dry-run",
        slug: expect.any(String),
        warning: undefined,
      },
    ]);
    expect(report.summary).toEqual({
      total: 1,
      imported: 1,
      duplicates: 0,
      warnings: 0,
      errors: 0,
    });
    expect(supabase.insertedRows).toHaveLength(0);
    expect(deps.putExamFile).not.toHaveBeenCalled();
  });

  it("insere l'epreuve et depose le fichier sur R2 hors dry-run", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({
      file: "epreuves/a.pdf",
      status: "imported",
    });
    expect(supabase.insertedRows).toHaveLength(1);
    expect(supabase.insertedRows[0]).toMatchObject({
      title: "Algorithmique S1",
      academic_year: "2024-2025",
      session: "Session Normale",
      exam_type: "Contrôle Terminal",
      field_id: "field-irt",
      level_id: "level-l1",
      subject_id: "subject-algo",
      option_id: null,
      file_mime_type: "application/pdf",
    });
    expect(deps.putExamFile).toHaveBeenCalledTimes(1);
  });

  it("rapporte un doublon par hash sans inserer ni deposer sur R2", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: [
        {
          data: { id: "exam-1", slug: "algo-s1-abc", title: "Algo" },
          error: null,
        },
      ],
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({ status: "duplicate" });
    expect(supabase.insertedRows).toHaveLength(0);
    expect(deps.putExamFile).not.toHaveBeenCalled();
  });

  it("importe quand meme sur un quadruplet identique, avec un avertissement", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: [
        { data: null, error: null },
        {
          data: [
            { id: "exam-2", slug: "algo-s1-old", title: "Algo (ancienne)" },
          ],
          error: null,
        },
      ],
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({ status: "imported" });
    expect((report.entries[0] as { warning?: string }).warning).toContain(
      "algo-s1-old",
    );
    expect(supabase.insertedRows).toHaveLength(1);
  });

  it("rapporte une erreur quand un referentiel du CSV n'existe pas, sans toucher a R2", async () => {
    const supabase = makeFakeSupabase({
      fields: [],
      levels: LEVELS,
      subjects: SUBJECTS,
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({ status: "error" });
    expect(deps.putExamFile).not.toHaveBeenCalled();
  });

  it("rapporte une erreur quand le fichier est introuvable sur disque", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
    });
    const deps = makeDeps(supabase, {});

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({
      status: "error",
      message: "Fichier introuvable.",
    });
  });

  it("rapporte une erreur quand le fichier n'est pas un PDF valide", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
    });
    const deps = makeDeps(supabase, {
      "/data/epreuves/a.pdf": Buffer.from("PNG-fake"),
    });

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({
      status: "error",
      message: "Le fichier n'est pas un PDF valide.",
    });
  });

  it("retire la ligne inseree quand le depot R2 echoue", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
      insertResult: { data: { id: "exam-new" }, error: null },
    });
    const deps = makeDeps(supabase);
    deps.putExamFile.mockRejectedValue(new Error("R2 indisponible"));

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({
      status: "error",
      message: "Depot R2 impossible, insertion annulee.",
    });
    expect(supabase.deletedIds).toEqual(["exam-new"]);
  });

  it("continue sur la ligne suivante quand une ligne echoue", async () => {
    const twoRowsCsv =
      "fichier;titre;filiere;niveau;matiere;option;annee_academique;type_epreuve;session\n" +
      "epreuves/manquant.pdf;Inconnue;Gestion;L1;Comptabilite;;2024-2025;Contrôle Terminal;Session Normale\n" +
      "epreuves/a.pdf;Algorithmique S1;IRT;L1;Algorithmique;;2024-2025;Contrôle Terminal;Session Normale\n";
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(
      twoRowsCsv,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.summary).toEqual({
      total: 2,
      imported: 1,
      duplicates: 0,
      warnings: 0,
      errors: 1,
    });
    expect(report.entries[0]).toMatchObject({ status: "error" });
    expect(report.entries[1]).toMatchObject({ status: "imported" });
  });

  it("rapporte un doublon par hash entre deux lignes du meme CSV, meme en dry-run", async () => {
    const twoIdenticalFiles =
      "fichier;titre;filiere;niveau;matiere;option;annee_academique;type_epreuve;session\n" +
      "epreuves/a.pdf;Algorithmique S1;IRT;L1;Algorithmique;;2024-2025;Contrôle Terminal;Session Normale\n" +
      "epreuves/copie.pdf;Algorithmique S1 copie;IRT;L1;Algorithmique;;2024-2025;Contrôle Continu;Session Normale\n";
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
    });
    const deps = makeDeps(supabase, {
      "/data/epreuves/a.pdf": Buffer.from("%PDF-1.4"),
      "/data/epreuves/copie.pdf": Buffer.from("%PDF-1.4"),
    });

    const report = await runSeed(
      twoIdenticalFiles,
      { baseDir: "/data", dryRun: true },
      deps,
    );

    expect(report.entries[0]).toMatchObject({ status: "dry-run" });
    expect(report.entries[1]).toMatchObject({ status: "duplicate" });
    expect(report.summary).toEqual({
      total: 2,
      imported: 1,
      duplicates: 1,
      warnings: 0,
      errors: 0,
    });
  });

  it("rapporte une erreur quand le fichier depasse la limite de taille", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
    });
    const deps = makeDeps(supabase, {
      "/data/epreuves/a.pdf": Buffer.concat([
        Buffer.from("%PDF-1.4"),
        Buffer.alloc(MAX_FILE_SIZE_BYTES),
      ]),
    });

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({ status: "error" });
    expect(supabase.insertedRows).toHaveLength(0);
  });

  it("rapporte une ligne orpheline quand la suppression de secours apres un echec R2 echoue aussi", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
      insertResult: { data: { id: "exam-orphan" }, error: null },
      deleteResult: { data: [], error: null },
    });
    const deps = makeDeps(supabase);
    deps.putExamFile.mockRejectedValue(new Error("R2 indisponible"));

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({ status: "error" });
    expect((report.entries[0] as { message: string }).message).toContain(
      "exam-orphan",
    );
  });

  it("distingue une erreur d'insertion generique d'un doublon", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
      insertResult: {
        data: null,
        error: { code: "23503", message: "foreign key violation" },
      },
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect(report.entries[0]).toMatchObject({ status: "error" });
    expect((report.entries[0] as { message: string }).message).toContain(
      "23503",
    );
  });

  it("retombe sur le message brut quand une erreur d'insertion n'a pas de code (erreur reseau postgrest)", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
      insertResult: {
        data: null,
        error: { code: "", message: "fetch failed" },
      },
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect((report.entries[0] as { message: string }).message).toContain(
      "fetch failed",
    );
  });

  it("distingue une collision de slug d'un doublon de fichier a l'insertion", async () => {
    const supabase = makeFakeSupabase({
      fields: FIELDS,
      levels: LEVELS,
      subjects: SUBJECTS,
      examsSelectQueue: NONE_THEN_EMPTY,
      insertResult: {
        data: null,
        error: {
          code: "23505",
          message:
            'duplicate key value violates unique constraint "exams_slug_key"',
        },
      },
    });
    const deps = makeDeps(supabase);

    const report = await runSeed(
      CSV,
      { baseDir: "/data", dryRun: false },
      deps,
    );

    expect((report.entries[0] as { message: string }).message).not.toContain(
      "deja depose",
    );
  });
});
