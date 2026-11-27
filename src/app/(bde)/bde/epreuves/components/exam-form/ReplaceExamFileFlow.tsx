"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import { FiArrowRight, FiExternalLink, FiX } from "react-icons/fi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { replaceExamFile } from "@/features/exams/actions";
import type { Exam } from "@/features/exams/types";
import type { ActionResult } from "@/lib/action-result";
import { formatFileSize } from "@/lib/file-format";
import CancelAction from "./CancelAction";
import ExamDropzone from "./ExamDropzone";
import ExamFileCard from "./ExamFileCard";
import {
  MAX_FILE_SIZE_LABEL,
  replaceFileFormSchema,
  validateExamFile,
} from "./examForm";
import ExamFormSaving from "./ExamFormSaving";
import type { ExamFormStep } from "./ExamFormStepper";
import ExamPreviewLink from "./ExamPreviewLink";
import ExamUpdateResult from "./ExamUpdateResult";

type SubmitState =
  | { status: "idle" }
  | { status: "invalid"; error: string }
  | { status: "done"; id: number; result: ActionResult<{ slug: string }> };

const ACTION_LINK_CLASS =
  "text-text-paragraph flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-gray-100";

/**
 * Remplacement du PDF d'une epreuve (donnees inchangees), memes etapes et meme mise en forme que
 * l'ajout et la modification. Validation Zod cote client puis `replaceExamFile` (qui revalide
 * type, taille, signature PDF et doublon).
 */
export default function ReplaceExamFileFlow({ exam }: { exam: Exam }) {
  const [file, setFile] = useState<File | null>(null);
  const [dismissedId, setDismissedId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, dispatch, pending] = useActionState<SubmitState, FormData>(
    async (_prev, formData) => {
      const parsed = replaceFileFormSchema.safeParse({
        file: formData.get("file"),
      });
      if (!parsed.success) {
        return {
          status: "invalid",
          error: parsed.error.issues[0]?.message ?? "Fichier invalide.",
        };
      }

      const payload = new FormData();
      payload.append("file", parsed.data.file);
      let result: ActionResult<{ slug: string }>;
      try {
        result = await replaceExamFile(exam.id, payload);
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

  const fileError = state.status === "invalid" ? state.error : undefined;
  const showResult = state.status === "done" && state.id !== dismissedId;
  const step: ExamFormStep = pending
    ? "saving"
    : showResult
      ? "result"
      : "form";

  // Deplace le focus sur la zone de depot (seul champ en erreur possible) apres un fichier
  // invalide (#171, meme pattern que AddExamFlow).
  useEffect(() => {
    if (state.status !== "invalid") return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  const submitReplace = () => {
    const formData = new FormData();
    // Le fichier vit dans l'etat React (choix ou glisser-deposer), pas dans l'input fichier.
    if (file) formData.append("file", file);
    startTransition(() => dispatch(formData));
  };

  // Remplacement destructif et irreversible (#171) : une confirmation s'intercale avant l'envoi,
  // avec le nom et la taille du nouveau fichier pour que la personne sache ce qu'elle valide.
  // Pas de confirmation pour un fichier deja invalide (#171, revue de code apres coup) : la
  // soumission echouerait de toute facon cote validation, inutile de prevenir d'un remplacement
  // qui ne va pas avoir lieu.
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || validateExamFile(file)) return submitReplace();
    setConfirmOpen(true);
  };

  const handleConfirmReplace = () => {
    setConfirmOpen(false);
    submitReplace();
  };

  const handleRetry = () => {
    if (state.status !== "done") return;
    setDismissedId(state.id);
    // Apres un succes, le fichier choisi est devenu le fichier actuel : on repart d'une zone vide.
    if (state.result.ok) setFile(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      {step === "saving" ? (
        <ExamFormSaving
          title="Remplacement en cours…"
          description="Le nouveau fichier est vérifié puis enregistré."
        />
      ) : null}

      {step === "result" && state.status === "done" ? (
        <ExamUpdateResult
          result={state.result}
          successTitle="Fichier remplacé"
          failureTitle="Échec du remplacement"
          successMessage={(slug) => (
            <>
              Le fichier de{" "}
              <ExamPreviewLink exam={{ slug, title: exam.title }} /> a été
              remplacé. Ses données sont inchangées.
            </>
          )}
          againLabel="Choisir un autre fichier"
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
              Fichier actuel
            </h2>
            <p className="text-text-paragraph mb-0 text-sm">
              Les données de l&apos;épreuve sont conservées, seul le PDF est
              remplacé.
            </p>
            <ul className="flex flex-col gap-2">
              <ExamFileCard
                idPrefix="current"
                name={exam.title}
                detail={`${exam.subject} · ${exam.level} · ${exam.academicYear ?? "Année inconnue"} · ${formatFileSize(exam.fileSize)}`}
                actions={
                  <a
                    href={`/api/exams/${exam.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ACTION_LINK_CLASS}
                  >
                    <FiExternalLink size={14} /> Voir
                  </a>
                }
              />
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-text-secondary text-xl font-semibold">
              Téléverser le nouveau fichier
            </h2>
            <ExamDropzone
              hint={`Un seul fichier, ${MAX_FILE_SIZE_LABEL} maximum`}
              error={fileError}
              errorName="file"
              onFiles={([next]) => setFile(next ?? null)}
            >
              {file ? (
                <ul className="mt-4 flex w-full flex-col gap-2">
                  <ExamFileCard
                    idPrefix="new"
                    name={file.name}
                    detail={formatFileSize(file.size)}
                    fileError={validateExamFile(file)}
                    actions={
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        aria-label={`Retirer ${file.name}`}
                        className="text-text-paragraph cursor-pointer rounded p-1 hover:bg-gray-100"
                      >
                        <FiX size={18} />
                      </button>
                    }
                  />
                </ul>
              ) : null}
            </ExamDropzone>
          </section>

          <div className="ml-auto flex items-center gap-4">
            <CancelAction
              href={`/bde/epreuves/${exam.slug}`}
              isDirty={file !== null}
            />
            <button
              type="submit"
              disabled={pending}
              className="bg-background-accent text-text-primary flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 disabled:opacity-50"
            >
              Remplacer le fichier <FiArrowRight />
            </button>
          </div>
        </form>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Remplacer le fichier ?"
        description={
          file ? (
            <p>
              Le fichier actuel de <strong>{exam.title}</strong> sera remplacé
              par <strong>{file.name}</strong> ({formatFileSize(file.size)}).
              Cette action est irréversible.
            </p>
          ) : null
        }
        confirmLabel="Remplacer"
        tone="danger"
        onConfirm={handleConfirmReplace}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
