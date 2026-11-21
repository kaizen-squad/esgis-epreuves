"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useState,
  type SubmitEvent,
} from "react";
import { FiArrowRight, FiExternalLink, FiX } from "react-icons/fi";
import { replaceExamFile } from "@/features/exams/actions";
import type { Exam } from "@/features/exams/types";
import type { ActionResult } from "@/lib/action-result";
import ExamDropzone from "./ExamDropzone";
import ExamFileCard from "./ExamFileCard";
import {
  MAX_FILE_SIZE_LABEL,
  formatFileSize,
  replaceFileFormSchema,
  validateExamFile,
} from "./examForm";
import ExamFormSaving from "./ExamFormSaving";
import ExamFormStepper, { type ExamFormStep } from "./ExamFormStepper";
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
  const outcome =
    state.status === "done"
      ? state.result.ok
        ? "success"
        : "failure"
      : undefined;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    // Le fichier vit dans l'etat React (choix ou glisser-deposer), pas dans l'input fichier.
    if (file) formData.append("file", file);
    startTransition(() => dispatch(formData));
  };

  const handleRetry = () => {
    if (state.status !== "done") return;
    setDismissedId(state.id);
    // Apres un succes, le fichier choisi est devenu le fichier actuel : on repart d'une zone vide.
    if (state.result.ok) setFile(null);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <ExamFormStepper current={step} outcome={outcome} />

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
          againLabel="Remplacer à nouveau"
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
            <h3 className="section-title">Fichier actuel</h3>
            <p className="text-text-paragraph mb-0 text-sm">
              Les données de l&apos;épreuve sont conservées, seul le PDF est
              remplacé.
            </p>
            <ul className="flex flex-col gap-2">
              <ExamFileCard
                idPrefix="current"
                name={exam.title}
                detail={`${exam.subject} · ${exam.level} · ${exam.academicYear} · ${formatFileSize(exam.fileSize)}`}
                actions={
                  <Link
                    href={`/api/exams/${exam.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={ACTION_LINK_CLASS}
                  >
                    <FiExternalLink size={14} /> Voir
                  </Link>
                }
              />
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="section-title">Téléverser le nouveau fichier</h3>
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
              Remplacer le fichier <FiArrowRight />
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
