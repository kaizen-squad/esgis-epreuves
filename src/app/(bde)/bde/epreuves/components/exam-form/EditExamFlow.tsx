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
import { BDE_BASE_PATH, examFileHref } from "@/components/layout/spaces";
import type { Field, Level, Subject } from "@/features/referentials/types";
import type { ActionResult } from "@/lib/action-result";
import { formatFileSize } from "@/lib/file-format";
import CancelAction from "./CancelAction";
import ExamCommonFields from "./ExamCommonFields";
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

type EditValues = ExamCommonValues & {
  academicYear: string;
  /** Etat propre, jamais derive de `academicYear === ""` (voir `ExamFileCard`). */
  yearUnknown: boolean;
};

type SubmitState =
  | { status: "idle" }
  | { status: "invalid"; errors: EditExamErrors }
  | {
      status: "done";
      id: number;
      result: ActionResult<{ slug: string; title: string }>;
    };

const ACTION_LINK_CLASS =
  "text-text-paragraph flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-gray-100";

function initialValues(exam: Exam): EditValues {
  return {
    // Inconnues possibles sur une vieille epreuve (#196) : la case part vide plutot que de
    // planter, a remplir par le BDE si besoin (formulaire aligne par #202).
    academicYear: exam.academicYear ?? "",
    // Une epreuve deja enregistree sans annee l'est reellement "inconnue" (jamais juste "pas
    // encore choisie", contrairement a un nouveau depot) : la case part donc cochee.
    yearUnknown: exam.academicYear === null,
    fieldId: exam.fieldId,
    levelId: exam.levelId,
    subjectId: exam.subjectId,
    session: exam.session ?? "",
    examType: exam.examType,
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
}: {
  exam: Exam;
  fields: Field[];
  levels: Level[];
  subjects: Subject[];
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
        academicYear: formData.get("academicYear") ?? "",
        yearUnknown: formData.get("yearUnknown") === "true",
        fieldId: formData.get("fieldId") ?? "",
        levelId: formData.get("levelId") ?? "",
        subjectId: formData.get("subjectId") ?? "",
        // Absent du DOM pour un Controle Continu (#202, ChoiceGroup masque) : jamais `null`, que
        // le schema rejetterait au lieu d'y voir une session vide, valide pour ce type.
        session: formData.get("session") ?? "",
        examType: formData.get("examType"),
      });
      if (!parsed.success) {
        return { status: "invalid", errors: toEditFieldErrors(parsed.error) };
      }

      let result: ActionResult<{ slug: string; title: string }>;
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
      return { status: "done", id: Date.now(), result };
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

  const handleCommonChange = (patch: Partial<ExamCommonValues>) =>
    setValues((current) => ({ ...current, ...patch }));

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
              <ExamPreviewLink
                exam={{
                  slug,
                  title:
                    state.status === "done" && state.result.ok
                      ? state.result.data.title
                      : exam.title,
                }}
              />{" "}
              ont été enregistrées.
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
                      href={examFileHref(BDE_BASE_PATH, exam.slug)}
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
                Tous les champs marqués * sont obligatoires. L&apos;année
                académique se modifie sur la carte du fichier ci-dessus (ou «
                inconnue » sur une vieille épreuve).
              </p>
            </div>

            <ExamCommonFields
              fields={fields}
              levels={levels}
              subjects={subjects}
              values={values}
              errors={errors}
              onChange={handleCommonChange}
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
