"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type SubmitEvent,
} from "react";
import { FiArrowRight, FiCloud } from "react-icons/fi";
import {
  uploadExamsBatch,
  type ExamBatchReport,
} from "@/features/exams/actions";
import {
  EXAM_SESSIONS,
  EXAM_TYPES,
  MAX_BATCH_FILES,
} from "@/features/exams/schemas";
import type { Field, Level, Subject } from "@/features/referentials/types";
import type { ActionResult } from "@/lib/action-result";
import {
  ACCEPTED_FILE_TYPES,
  MAX_FILE_SIZE_LABEL,
  addExamFormSchema,
  fileKey,
  mergeFiles,
  titleFromFileName,
  toBatchFormData,
  toFieldErrors,
  type AddExamErrors,
  type AddExamFileErrors,
} from "./addExamForm";
import AddExamResult from "./AddExamResult";
import AddExamSaving from "./AddExamSaving";
import AddExamStepper, { type AddExamStep } from "./AddExamStepper";
import ChoiceGroup from "./ChoiceGroup";
import SubjectSearch from "./SubjectSearch";
import UploadedFileCard, { type FileEntry } from "./UploadedFileCard";

const SESSION_LABELS: Record<(typeof EXAM_SESSIONS)[number], string> = {
  "Session Normale": "Normale",
  Rattrapage: "Rattrapage",
};
const EXAM_TYPE_LABELS: Record<(typeof EXAM_TYPES)[number], string> = {
  "Contrôle Terminal": "Terminal",
  "Contrôle Continu": "Continu",
};

const INPUT_CLASS =
  "w-full rounded-lg border px-3 py-2 outline-none focus:border-background-accent";

type Values = Record<Exclude<keyof AddExamErrors, "files">, string>;

const EMPTY_VALUES: Values = {
  fieldId: "",
  levelId: "",
  subjectId: "",
  session: "",
  examType: "",
};

type SubmitState =
  | { status: "idle" }
  | {
      status: "invalid";
      errors: AddExamErrors;
      fileErrors: AddExamFileErrors;
    }
  | { status: "done"; id: number; result: ActionResult<ExamBatchReport> };

function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${name}-error`} className="mb-0 text-sm text-red-600">
      {error}
    </p>
  );
}

function inputClass(error?: string) {
  return `${INPUT_CLASS} ${error ? "border-red-400" : "border-gray-300"}`;
}

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
}: {
  fields: Field[];
  levels: Level[];
  subjects: Subject[];
}) {
  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [dismissedId, setDismissedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const showResult = state.status === "done" && state.id !== dismissedId;
  const step: AddExamStep = pending ? "saving" : showResult ? "result" : "form";
  const outcome =
    state.status === "done"
      ? state.result.ok &&
        state.result.data.summary.imported === state.result.data.summary.total
        ? "success"
        : "failure"
      : undefined;

  const setValue = (name: keyof Values, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const subjectFits = (subjectId: string, fieldId: string, levelId: string) =>
    subjects.some(
      (s) =>
        s.id === subjectId &&
        (!fieldId || s.fieldId === fieldId) &&
        (!levelId || s.levelId === levelId),
    );

  /** Une matiere appartient a une filiere et un niveau : la choisir les renseigne. */
  const handleSubjectSelect = (subject: Subject | null) =>
    setValues((current) =>
      subject
        ? {
            ...current,
            subjectId: subject.id,
            fieldId: subject.fieldId,
            levelId: subject.levelId,
          }
        : { ...current, subjectId: "" },
    );

  const handleFieldChange = (fieldId: string) =>
    setValues((current) => ({
      ...current,
      fieldId,
      subjectId: subjectFits(current.subjectId, fieldId, current.levelId)
        ? current.subjectId
        : "",
    }));

  const handleLevelChange = (levelId: string) =>
    setValues((current) => ({
      ...current,
      levelId,
      subjectId: subjectFits(current.subjectId, current.fieldId, levelId)
        ? current.subjectId
        : "",
    }));

  const addFiles = (incoming: FileList | null) => {
    if (!incoming?.length) return;
    setFiles((current) => {
      const merged = mergeFiles(
        current.map((entry) => entry.file),
        Array.from(incoming),
      );
      return [...current, ...merged.slice(current.length).map(toEntry)];
    });
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    // Permet de re-selectionner le meme fichier apres l'avoir retire.
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const updateEntry = (key: string, patch: Partial<FileEntry>) =>
    setFiles((current) =>
      current.map((entry) =>
        entry.key === key ? { ...entry, ...patch } : entry,
      ),
    );

  const removeEntry = (key: string) =>
    setFiles((current) => current.filter((entry) => entry.key !== key));

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
      <AddExamStepper current={step} outcome={outcome} />

      {step === "saving" ? <AddExamSaving fileCount={files.length} /> : null}

      {step === "result" && state.status === "done" ? (
        <AddExamResult
          result={state.result}
          onRetry={handleRetry}
          onRestart={handleRestart}
        />
      ) : null}

      {step === "form" ? (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-10"
        >
          <section className="flex flex-col gap-3">
            <h3 className="section-title">Téléverser votre(vos) fichiers</h3>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${dragging ? "border-background-accent bg-red-50" : errors.files ? "border-red-400" : "bg-background-default border-gray-300"}`}
            >
              <FiCloud size={28} className="text-background-accent" />
              <span>
                Glissez vos fichiers ici ou{" "}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className="text-background-accent cursor-pointer font-semibold underline"
                >
                  Importez
                </span>
              </span>
              <span className="text-text-paragraph text-sm">
                {MAX_BATCH_FILES} fichiers maximum, {MAX_FILE_SIZE_LABEL}{" "}
                maximum par fichier
              </span>

              {files.length > 0 ? (
                <ul className="mt-4 flex w-full flex-col gap-2">
                  {files.map((entry, index) => (
                    <UploadedFileCard
                      key={entry.key}
                      entry={entry}
                      index={index}
                      errors={fileErrors[index]}
                      onChange={(patch) => updateEntry(entry.key, patch)}
                      onRemove={() => removeEntry(entry.key)}
                    />
                  ))}
                </ul>
              ) : null}
            </div>
            <p className="text-text-paragraph mb-0 text-sm">
              Seul le format PDF est supporté.
            </p>
            <FieldError name="files" error={errors.files} />
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
          </section>

          <section className="flex flex-col gap-5">
            <div>
              <h3 className="section-title">
                Entrez les données de(s) l&apos;épreuve(s)
              </h3>
              <p className="text-text-paragraph mb-0 text-sm">
                Tous les champs marqués * sont obligatoires. Le titre et
                l&apos;année académique se renseignent sur chaque fichier
                ci-dessus ; les données suivantes sont communes à tous les
                fichiers.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label htmlFor="fieldId" className="font-medium">
                  Filière *
                </label>
                <select
                  id="fieldId"
                  name="fieldId"
                  value={values.fieldId}
                  onChange={(event) => handleFieldChange(event.target.value)}
                  aria-invalid={errors.fieldId ? true : undefined}
                  aria-describedby={
                    errors.fieldId ? "fieldId-error" : undefined
                  }
                  className={inputClass(errors.fieldId)}
                >
                  <option value="" disabled>
                    Choisir une filière
                  </option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
                <FieldError name="fieldId" error={errors.fieldId} />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="levelId" className="font-medium">
                  Niveau *
                </label>
                <select
                  id="levelId"
                  name="levelId"
                  value={values.levelId}
                  onChange={(event) => handleLevelChange(event.target.value)}
                  aria-invalid={errors.levelId ? true : undefined}
                  aria-describedby={
                    errors.levelId ? "levelId-error" : undefined
                  }
                  className={inputClass(errors.levelId)}
                >
                  <option value="" disabled>
                    Choisir un niveau
                  </option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
                <FieldError name="levelId" error={errors.levelId} />
              </div>
            </div>

            <SubjectSearch
              subjects={subjects}
              fields={fields}
              levels={levels}
              fieldId={values.fieldId}
              levelId={values.levelId}
              subjectId={values.subjectId}
              onSelect={handleSubjectSelect}
              error={errors.subjectId}
            />

            <div className="grid gap-5 md:grid-cols-1">
              <ChoiceGroup
                name="session"
                legend="Session *"
                choices={EXAM_SESSIONS.map((session) => ({
                  label: SESSION_LABELS[session],
                  value: session,
                }))}
                value={values.session}
                onChange={(session) => setValue("session", session)}
                error={errors.session}
              />
              <ChoiceGroup
                name="examType"
                legend="Type *"
                choices={EXAM_TYPES.map((type) => ({
                  label: EXAM_TYPE_LABELS[type],
                  value: type,
                }))}
                value={values.examType}
                onChange={(examType) => setValue("examType", examType)}
                error={errors.examType}
              />
            </div>
          </section>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/bde/accueil"
              className="text-text-paragraph px-2 py-2 hover:underline"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="bg-background-accent text-text-primary flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 disabled:opacity-50"
            >
              Publier l&apos;Épreuve <FiArrowRight />
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
