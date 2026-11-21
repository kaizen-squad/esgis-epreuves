"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useState,
  type SubmitEvent,
} from "react";
import { FiArrowRight, FiExternalLink, FiRefreshCw } from "react-icons/fi";
import { updateExamMetadata } from "@/features/exams/actions";
import type { Exam } from "@/features/exams/types";
import type {
  Field,
  Level,
  Option,
  Subject,
} from "@/features/referentials/types";
import type { ActionResult } from "@/lib/action-result";
import ExamCommonFields, { inputClass } from "./ExamCommonFields";
import ExamFileCard from "./ExamFileCard";
import {
  editExamFormSchema,
  formatFileSize,
  toEditFieldErrors,
  toMetadataFormData,
  type EditExamErrors,
  type ExamCommonValues,
} from "./examForm";
import ExamFormSaving from "./ExamFormSaving";
import ExamFormStepper, { type ExamFormStep } from "./ExamFormStepper";
import ExamPreviewLink from "./ExamPreviewLink";
import ExamUpdateResult from "./ExamUpdateResult";
import FieldError from "./FieldError";

type EditValues = ExamCommonValues & {
  title: string;
  academicYear: string;
  optionId: string;
};

type SubmitState =
  | { status: "idle" }
  | { status: "invalid"; errors: EditExamErrors }
  | {
      status: "done";
      id: number;
      title: string;
      result: ActionResult<{ slug: string }>;
    };

const ACTION_LINK_CLASS =
  "text-text-paragraph flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-gray-100";

function initialValues(exam: Exam): EditValues {
  return {
    title: exam.title,
    academicYear: exam.academicYear,
    fieldId: exam.fieldId,
    levelId: exam.levelId,
    subjectId: exam.subjectId,
    session: exam.session,
    examType: exam.examType,
    optionId: exam.optionId ?? "",
  };
}

/**
 * Modification des metadonnees d'une epreuve (fichier inchange), memes etapes et meme mise en
 * forme que l'ajout, champs preremplis avec les valeurs enregistrees. Validation Zod cote client
 * puis `updateExamMetadata` (qui revalide tout).
 */
export default function EditExamFlow({
  exam,
  fields,
  levels,
  subjects,
  options,
}: {
  exam: Exam;
  fields: Field[];
  levels: Level[];
  subjects: Subject[];
  options: Option[];
}) {
  const [values, setValues] = useState<EditValues>(() => initialValues(exam));
  const [dismissedId, setDismissedId] = useState<number | null>(null);

  const [state, dispatch, pending] = useActionState<SubmitState, FormData>(
    async (_prev, formData) => {
      const parsed = editExamFormSchema.safeParse({
        title: formData.get("title") ?? "",
        academicYear: formData.get("academicYear") ?? "",
        fieldId: formData.get("fieldId") ?? "",
        levelId: formData.get("levelId") ?? "",
        subjectId: formData.get("subjectId") ?? "",
        session: formData.get("session"),
        examType: formData.get("examType"),
        optionId: formData.get("optionId") ?? "",
      });
      if (!parsed.success) {
        return { status: "invalid", errors: toEditFieldErrors(parsed.error) };
      }

      let result: ActionResult<{ slug: string }>;
      try {
        result = await updateExamMetadata(
          exam.id,
          toMetadataFormData(parsed.data),
        );
      } catch {
        result = {
          ok: false,
          error:
            "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.",
        };
      }
      return {
        status: "done",
        id: Date.now(),
        title: parsed.data.title,
        result,
      };
    },
    { status: "idle" },
  );

  const errors = state.status === "invalid" ? state.errors : {};
  const showResult = state.status === "done" && state.id !== dismissedId;
  const step: ExamFormStep = pending
    ? "saving"
    : showResult
      ? "result"
      : "form";
  const outcome =
    state.status === "done"
      ? state.result.ok
        ? "success"
        : "failure"
      : undefined;

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

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // Hors action de formulaire native : pas de reinitialisation automatique des champs par React.
    startTransition(() => dispatch(formData));
  };

  const handleRetry = () => {
    if (state.status === "done") setDismissedId(state.id);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <ExamFormStepper current={step} outcome={outcome} />

      {step === "saving" ? (
        <ExamFormSaving
          title="Modification en cours…"
          description="Les nouvelles données de l'épreuve sont vérifiées puis enregistrées."
        />
      ) : null}

      {step === "result" && state.status === "done" ? (
        <ExamUpdateResult
          result={state.result}
          successTitle="Épreuve modifiée"
          failureTitle="Échec de la modification"
          successMessage={(slug) => (
            <>
              Les données de{" "}
              <ExamPreviewLink exam={{ slug, title: state.title }} /> ont été
              enregistrées.
            </>
          )}
          againLabel="Modifier à nouveau"
          onRetry={handleRetry}
        />
      ) : null}

      {step === "form" ? (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-10"
        >
          <section className="flex flex-col gap-3">
            <h3 className="section-title">Fichier de l&apos;épreuve</h3>
            <div className="bg-background-default flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-6 text-center">
              <span className="text-text-paragraph text-sm">
                Le fichier PDF n&apos;est pas modifié ici. Pour le changer,
                utilisez « Remplacer ».
              </span>
              <ul className="mt-2 flex w-full flex-col gap-2">
                <ExamFileCard
                  idPrefix="exam"
                  name="Fichier PDF actuel"
                  detail={formatFileSize(exam.fileSize)}
                  values={values}
                  errors={errors}
                  onChange={(patch) =>
                    setValues((current) => ({ ...current, ...patch }))
                  }
                  actions={
                    <div className="flex shrink-0 gap-1">
                      <Link
                        href={`/api/exams/${exam.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={ACTION_LINK_CLASS}
                      >
                        <FiExternalLink size={14} /> Voir
                      </Link>
                      <Link
                        href={`/bde/epreuves/${exam.slug}/remplacer`}
                        className={ACTION_LINK_CLASS}
                      >
                        <FiRefreshCw size={14} /> Remplacer
                      </Link>
                    </div>
                  }
                />
              </ul>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div>
              <h3 className="section-title">
                Modifiez les données de l&apos;épreuve
              </h3>
              <p className="text-text-paragraph mb-0 text-sm">
                Tous les champs marqués * sont obligatoires. Le titre et
                l&apos;année académique se modifient sur la carte du fichier
                ci-dessus.
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
            <Link
              href="/bde/catalogue"
              className="text-text-paragraph px-2 py-2 hover:underline"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="bg-background-accent text-text-primary flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 disabled:opacity-50"
            >
              Enregistrer les modifications <FiArrowRight />
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
