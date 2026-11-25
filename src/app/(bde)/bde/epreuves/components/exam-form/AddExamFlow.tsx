"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import {
  uploadExamsBatch,
  type ExamBatchReport,
} from "@/features/exams/actions";
import { MAX_BATCH_FILES } from "@/features/exams/schemas";
import type {
  Field,
  Level,
  Option,
  Subject,
} from "@/features/referentials/types";
import type { ActionResult } from "@/lib/action-result";
import { formatFileSize } from "@/lib/file-format";
import {
  MAX_FILE_SIZE_LABEL,
  academicYears,
  addExamFormSchema,
  fileKey,
  mergeFiles,
  titleFromFileName,
  toBatchFormData,
  toFieldErrors,
  validateExamFile,
  type AddExamErrors,
  type AddExamFileErrors,
  type ExamCommonValues,
} from "./examForm";
import AddExamResult from "./AddExamResult";
import CancelAction from "./CancelAction";
import { inputClass } from "./ExamCommonFields";
import ExamFormSaving from "./ExamFormSaving";
import type { ExamFormStep } from "./ExamFormStepper";
import ExamCommonFields from "./ExamCommonFields";
import ExamDropzone from "./ExamDropzone";
import ExamFileCard from "./ExamFileCard";
import FieldError from "./FieldError";

type FileEntry = {
  /** Cle stable de la carte (le fichier peut etre retire, l'index change). */
  key: string;
  file: File;
  title: string;
  academicYear: string;
};

/** Valeurs communes au lot, plus l'option (facultative, proposee dès la creation comme en
 * modification, #172). */
type AddValues = ExamCommonValues & { optionId: string };

const EMPTY_VALUES: AddValues = {
  fieldId: "",
  levelId: "",
  subjectId: "",
  session: "",
  examType: "",
  optionId: "",
};

type SubmitState =
  | { status: "idle" }
  | {
      status: "invalid";
      errors: AddExamErrors;
      fileErrors: AddExamFileErrors;
    }
  | { status: "done"; id: number; result: ActionResult<ExamBatchReport> };

/** Nouveau fichier du lot : titre propose a partir du nom de fichier, annee a choisir. */
function toEntry(file: File): FileEntry {
  return {
    key: fileKey(file),
    file,
    title: titleFromFileName(file.name),
    academicYear: "",
  };
}

export default function AddExamFlow({
  fields,
  levels,
  subjects,
  options,
  initialSubject,
}: {
  fields: Field[];
  levels: Level[];
  subjects: Subject[];
  options: Option[];
  /** Lacune du fonds ouverte depuis la matrice de couverture (#174) : matiere preremplie. */
  initialSubject?: { fieldId: string; levelId: string; subjectId: string };
}) {
  // Memorisee une fois (jamais recalculee au gre des props) : sert de reference a `isDirty`, pour
  // qu'un lien de lacune pre-rempli (#174) ne declenche pas une confirmation d'abandon avant meme
  // la moindre saisie (revue de code, #171, apres coup).
  const [initialValuesState] = useState<AddValues>(() =>
    initialSubject ? { ...EMPTY_VALUES, ...initialSubject } : EMPTY_VALUES,
  );
  const [values, setValues] = useState<AddValues>(initialValuesState);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [bulkYear, setBulkYear] = useState("");
  const [dismissedId, setDismissedId] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, dispatch, pending] = useActionState<SubmitState, FormData>(
    async (_prev, formData) => {
      // Titre et annee sont repetes une fois par carte de fichier, dans l'ordre du lot.
      const titles = formData.getAll("title");
      const years = formData.getAll("academicYear");
      const parsed = addExamFormSchema.safeParse({
        fieldId: formData.get("fieldId") ?? "",
        levelId: formData.get("levelId") ?? "",
        subjectId: formData.get("subjectId") ?? "",
        session: formData.get("session"),
        examType: formData.get("examType"),
        optionId: formData.get("optionId") ?? "",
        files: formData.getAll("files").map((file, index) => ({
          file,
          title: titles[index] ?? "",
          academicYear: years[index] ?? "",
        })),
      });
      if (!parsed.success) {
        return { status: "invalid", ...toFieldErrors(parsed.error) };
      }

      let result: ActionResult<ExamBatchReport>;
      try {
        result = await uploadExamsBatch(toBatchFormData(parsed.data));
      } catch {
        result = {
          ok: false,
          error:
            "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.",
        };
      }
      return { status: "done", id: Date.now(), result };
    },
    { status: "idle" },
  );

  const errors = state.status === "invalid" ? state.errors : {};
  const fileErrors = state.status === "invalid" ? state.fileErrors : {};
  const isDirty =
    files.length > 0 ||
    JSON.stringify(values) !== JSON.stringify(initialValuesState);
  const showResult = state.status === "done" && state.id !== dismissedId;
  const step: ExamFormStep = pending
    ? "saving"
    : showResult
      ? "result"
      : "form";

  const availableOptions = options.filter(
    (option) => option.fieldId === values.fieldId,
  );

  /** Une option appartient a une filiere : changer de filiere vide l'option devenue incompatible. */
  const handleCommonChange = (patch: Partial<ExamCommonValues>) =>
    setValues((current) => {
      const next = { ...current, ...patch };
      const optionFits = options.some(
        (o) => o.id === next.optionId && o.fieldId === next.fieldId,
      );
      return optionFits ? next : { ...next, optionId: "" };
    });

  const addFiles = (incoming: File[]) => {
    setFiles((current) => {
      const merged = mergeFiles(
        current.map((entry) => entry.file),
        incoming,
      );
      return [...current, ...merged.slice(current.length).map(toEntry)];
    });
  };

  const updateEntry = (key: string, patch: Partial<FileEntry>) =>
    setFiles((current) =>
      current.map((entry) =>
        entry.key === key ? { ...entry, ...patch } : entry,
      ),
    );

  const removeEntry = (key: string) =>
    setFiles((current) => current.filter((entry) => entry.key !== key));

  /** "Appliquer a tous" (#172) : evite de choisir la meme annee fichier par fichier sur un lot. */
  const applyYearToAll = (academicYear: string) =>
    setFiles((current) => current.map((entry) => ({ ...entry, academicYear })));

  // Deplace le focus sur le premier champ en erreur apres un echec de validation, sans scroll
  // supplementaire (le champ est deja dans le formulaire visible). Un `<fieldset>` (session,
  // type) n'est pas focusable : on cible alors son premier bouton radio.
  useEffect(() => {
    if (state.status !== "invalid") return;
    const firstInvalid = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    const target =
      firstInvalid?.tagName === "FIELDSET"
        ? firstInvalid.querySelector<HTMLElement>("input")
        : firstInvalid;
    target?.focus();
  }, [state]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // Le lot vit dans l'etat React (ajouts successifs, glisser-deposer), pas dans l'input fichier.
    for (const entry of files) formData.append("files", entry.file);
    // Hors action de formulaire native : pas de reinitialisation automatique des champs par React.
    startTransition(() => dispatch(formData));
  };

  const handleRetry = () => {
    if (state.status !== "done") return;
    setDismissedId(state.id);
    // Ne garde que les fichiers qui n'ont pas ete publies (entrees alignees par index sur le lot).
    if (state.result.ok) {
      const entries = state.result.data.entries;
      setFiles((current) =>
        current.filter((_, index) => entries[index]?.status !== "imported"),
      );
    }
  };

  const handleRestart = () => {
    if (state.status === "done") setDismissedId(state.id);
    setValues(EMPTY_VALUES);
    setFiles([]);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      {step === "saving" ? (
        <ExamFormSaving
          title="Publication en cours…"
          description={
            files.length > 1
              ? `Vos ${files.length} fichiers sont vérifiés puis enregistrés.`
              : "Votre fichier est vérifié puis enregistré."
          }
          entries={files.map((entry) => ({
            key: entry.key,
            name: entry.file.name,
          }))}
        />
      ) : null}

      {step === "result" && state.status === "done" ? (
        <AddExamResult
          result={state.result}
          onRetry={handleRetry}
          onRestart={handleRestart}
        />
      ) : null}

      {step === "form" ? (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-10"
        >
          <section className="flex flex-col gap-3">
            <h2 className="text-text-secondary text-xl font-semibold">
              Téléverser vos fichiers
            </h2>
            <ExamDropzone
              multiple
              hint={`${MAX_BATCH_FILES} fichiers maximum, ${MAX_FILE_SIZE_LABEL} maximum par fichier`}
              error={errors.files}
              errorName="files"
              onFiles={addFiles}
            >
              {files.length > 1 ? (
                <div className="mt-4 flex w-full flex-wrap items-end gap-2">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="bulk-academic-year"
                      className="text-sm font-medium"
                    >
                      Année académique (tous les fichiers)
                    </label>
                    <select
                      id="bulk-academic-year"
                      value={bulkYear}
                      onChange={(event) => setBulkYear(event.target.value)}
                      className={`${inputClass()} text-sm`}
                    >
                      <option value="" disabled>
                        Choisir une année
                      </option>
                      {academicYears().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={!bulkYear}
                    onClick={() => applyYearToAll(bulkYear)}
                    className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Appliquer à tous
                  </button>
                </div>
              ) : null}

              {files.length > 0 ? (
                <ul className="mt-4 flex w-full flex-col gap-2">
                  {files.map((entry, index) => (
                    <ExamFileCard
                      key={entry.key}
                      idPrefix={`file-${entry.key}`}
                      name={`${index + 1}. ${entry.file.name}`}
                      detail={formatFileSize(entry.file.size)}
                      fileError={
                        validateExamFile(entry.file) ?? fileErrors[index]?.file
                      }
                      values={entry}
                      errors={fileErrors[index]}
                      onChange={(patch) => updateEntry(entry.key, patch)}
                      actions={
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.key)}
                          aria-label={`Retirer ${entry.file.name}`}
                          className="text-text-paragraph cursor-pointer rounded p-1 hover:bg-gray-100"
                        >
                          <FiX size={18} />
                        </button>
                      }
                    />
                  ))}
                </ul>
              ) : null}
            </ExamDropzone>
          </section>

          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-text-secondary text-xl font-semibold">
                Entrez les données de chaque épreuve
              </h2>
              <p className="text-text-paragraph mb-0 text-sm">
                Tous les champs marqués * sont obligatoires. Le titre et
                l&apos;année académique se renseignent sur chaque fichier
                ci-dessus ; les données suivantes sont communes à tous les
                fichiers.
              </p>
            </div>

            <ExamCommonFields
              fields={fields}
              levels={levels}
              subjects={subjects}
              values={values}
              errors={errors}
              onChange={handleCommonChange}
              afterSubject={
                availableOptions.length > 0 || values.optionId ? (
                  <div className="flex flex-col gap-1">
                    <label htmlFor="optionId" className="font-medium">
                      Option (facultatif)
                    </label>
                    <select
                      id="optionId"
                      name="optionId"
                      value={values.optionId}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          optionId: event.target.value,
                        }))
                      }
                      aria-invalid={errors.optionId ? true : undefined}
                      aria-describedby={
                        errors.optionId ? "optionId-error" : undefined
                      }
                      className={inputClass(errors.optionId)}
                    >
                      <option value="">Aucune</option>
                      {availableOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <FieldError name="optionId" error={errors.optionId} />
                  </div>
                ) : (
                  <input type="hidden" name="optionId" value="" />
                )
              }
            />
          </section>

          <div className="ml-auto flex items-center gap-4">
            <CancelAction href="/bde/accueil" isDirty={isDirty} />
            <button
              type="submit"
              disabled={pending}
              className="bg-background-accent text-text-primary flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 disabled:opacity-50"
            >
              Verser {files.length > 1 ? "les épreuves" : "l'épreuve"}{" "}
              <FiArrowRight />
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
