"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
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
import { formatFileSize } from "@/lib/file-format";
import CancelAction from "./CancelAction";
import ExamCommonFields, { inputClass } from "./ExamCommonFields";
import ExamFileCard from "./ExamFileCard";
import {
  editExamFormSchema,
  toEditFieldErrors,
  toMetadataFormData,
  type EditExamErrors,
  type ExamCommonValues,
} from "./examForm";
import ExamFormSaving from "./ExamFormSaving";
import type { ExamFormStep } from "./ExamFormStepper";
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
    // Inconnues possibles sur une vieille epreuve (#196) : la case part vide plutot que de
    // planter, a remplir par le BDE si besoin (formulaire aligne par #202).
    academicYear: exam.academicYear ?? "",
    fieldId: exam.fieldId,
    levelId: exam.levelId,
    subjectId: exam.subjectId,
    session: exam.session ?? "",
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
  const formRef = useRef<HTMLFormElement>(null);
  // Reference d'`isDirty`, mise a jour apres un enregistrement reussi (`handleRetry`) : sans ca,
  // elle restait sur les valeurs d'origine de `exam` (fige au premier rendu), si bien qu'Annuler
  // apres un succes redemandait toujours une confirmation (revue de code, #171, apres coup).
  const [baseline, setBaseline] = useState<EditValues>(() =>
    initialValues(exam),
  );
  const isDirty = JSON.stringify(values) !== JSON.stringify(baseline);

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

  // Deplace le focus sur le premier champ en erreur apres un echec de validation (#171, meme
  // pattern que AddExamFlow). Un `<fieldset>` (session, type) n'est pas focusable : on cible
  // alors son premier bouton radio.
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
    if (state.status !== "done") return;
    setDismissedId(state.id);
    if (state.result.ok) setBaseline(values);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
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
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-10"
        >
          <section className="flex flex-col gap-3">
            <h2 className="text-text-secondary text-xl font-semibold">
              Fichier de l&apos;épreuve
            </h2>
            {/* Plus de cadre en pointilles (zone de depot) : le fichier n'est pas deposable ici,
                seulement consultable (#171). */}
            <p className="text-text-paragraph mb-0 text-sm">
              Le fichier PDF n&apos;est pas modifié ici. Pour le changer,
              utilisez « Remplacer ».
            </p>
            <ul className="flex flex-col gap-2">
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
                    <a
                      href={`/api/exams/${exam.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ACTION_LINK_CLASS}
                    >
                      <FiExternalLink size={14} /> Voir
                    </a>
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
          </section>

          <section className="flex flex-col gap-5">
            <div>
              <h2 className="text-text-secondary text-xl font-semibold">
                Modifiez les données de l&apos;épreuve
              </h2>
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
            <CancelAction
              href={`/bde/epreuves/${exam.slug}`}
              isDirty={isDirty}
            />
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
