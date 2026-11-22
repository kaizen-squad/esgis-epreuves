"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useState,
  type SubmitEvent,
} from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import {
  uploadExamsBatch,
  type ExamBatchReport,
} from "@/features/exams/actions";
import { MAX_BATCH_FILES } from "@/features/exams/schemas";
import type { Field, Level, Subject } from "@/features/referentials/types";
import type { ActionResult } from "@/lib/action-result";
import { formatFileSize } from "@/lib/file-format";
import {
  MAX_FILE_SIZE_LABEL,
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
import ExamFormSaving from "./ExamFormSaving";
import ExamFormStepper, { type ExamFormStep } from "./ExamFormStepper";
import ExamCommonFields from "./ExamCommonFields";
import ExamDropzone from "./ExamDropzone";
import ExamFileCard from "./ExamFileCard";

type FileEntry = {
  /** Cle stable de la carte (le fichier peut etre retire, l'index change). */
  key: string;
  file: File;
  title: string;
  academicYear: string;
};

const EMPTY_VALUES: ExamCommonValues = {
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
  const [values, setValues] = useState<ExamCommonValues>(EMPTY_VALUES);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dismissedId, setDismissedId] = useState<number | null>(null);

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
  const step: ExamFormStep = pending
    ? "saving"
    : showResult
      ? "result"
      : "form";
  const outcome =
    state.status === "done"
      ? state.result.ok &&
        state.result.data.summary.imported === state.result.data.summary.total
        ? "success"
        : "failure"
      : undefined;

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
      <ExamFormStepper current={step} outcome={outcome} />

      {step === "saving" ? (
        <ExamFormSaving
          title="Publication en cours…"
          description={
            files.length > 1
              ? `Vos ${files.length} fichiers sont vérifiés puis enregistrés.`
              : "Votre fichier est vérifié puis enregistré."
          }
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
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-10"
        >
          <section className="flex flex-col gap-3">
            <h3 className="section-title">Téléverser votre(vos) fichiers</h3>
            <ExamDropzone
              multiple
              hint={`${MAX_BATCH_FILES} fichiers maximum, ${MAX_FILE_SIZE_LABEL} maximum par fichier`}
              error={errors.files}
              errorName="files"
              onFiles={addFiles}
            >
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

            <ExamCommonFields
              fields={fields}
              levels={levels}
              subjects={subjects}
              values={values}
              errors={errors}
              onChange={(patch) =>
                setValues((current) => ({ ...current, ...patch }))
              }
            />
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
