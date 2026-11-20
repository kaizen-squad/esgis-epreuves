"use client";

import { useActionState, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { replaceExamFile } from "@/features/exams/actions";
import { MAX_FILE_SIZE_BYTES } from "@/features/exams/schemas";
import type { ActionResult } from "@/lib/action-result";
import ExamActionMessage from "./ExamActionMessage";

const MAX_FILE_SIZE_LABEL = `${Math.round(MAX_FILE_SIZE_BYTES / 1024)} Ko`;

/**
 * Formulaire de remplacement du PDF d'une epreuve (metadonnees inchangees). Le type et la taille
 * sont controles des la selection pour un message immediat ; le serveur revalide de toute facon
 * (type, taille, octets de signature PDF, doublon).
 */
export default function ExamFileReplaceForm({ examId }: { examId: string }) {
  const [clientError, setClientError] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState<
    ActionResult<{ slug: string }> | null,
    FormData
  >((_prev, formData) => replaceExamFile(examId, formData), null);

  const fieldErrors =
    state && !state.ok && "fieldErrors" in state
      ? state.fieldErrors
      : undefined;
  const fileError = clientError ?? fieldErrors?.file?.[0] ?? null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setClientError(null);
    if (!file) return;
    if (file.type !== "application/pdf") {
      setClientError("Le fichier doit être un PDF.");
    } else if (file.size > MAX_FILE_SIZE_BYTES) {
      setClientError(
        `Le fichier dépasse la taille maximale (${MAX_FILE_SIZE_LABEL}).`,
      );
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="file" className="font-medium">
          Nouveau fichier (PDF, {MAX_FILE_SIZE_LABEL} maximum)
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="application/pdf"
          required
          onChange={handleFileChange}
          aria-invalid={fileError ? true : undefined}
          aria-describedby={fileError ? "file-error" : undefined}
          className="rounded-lg border px-3 py-2"
        />
        {fileError ? (
          <p id="file-error" className="text-sm text-red-600">
            {fileError}
          </p>
        ) : null}
      </div>

      <ExamActionMessage
        state={state}
        successMessage="Le fichier de l'épreuve a été remplacé."
      />

      <button
        type="submit"
        disabled={pending || clientError !== null}
        className="bg-background-accent flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-white disabled:opacity-50"
      >
        Remplacer le fichier
        {pending ? <CgSpinner className="animate-spin" size={20} /> : null}
      </button>
    </form>
  );
}
