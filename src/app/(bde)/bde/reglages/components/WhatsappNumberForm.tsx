"use client";

import { useActionState, useRef, useState, type SubmitEvent } from "react";
import { CgSpinner } from "react-icons/cg";
import {
  FaWhatsapp,
  FiAlertCircle,
  FiCheckCircle,
  FiExternalLink,
} from "@/components/icons";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { updateBdeWhatsappNumber } from "@/features/contact/actions";
import { whatsappNumberSchema } from "@/features/contact/schemas";
import { whatsappHref } from "@/features/contact/whatsapp";

type State = {
  /** Numero en vigueur sur le site public (E.164) ou `null`. */
  saved: string | null;
  feedback?: { ok: boolean; text: string };
  fieldError?: string;
};

const NETWORK_ERROR =
  "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.";

/**
 * Numero WhatsApp du BDE : meme validation que le serveur avant l'envoi, puis
 * `updateBdeWhatsappNumber`. Champ vide = numero retire (le lien du site reste valide).
 */
export default function WhatsappNumberForm({
  initialNumber,
}: {
  initialNumber: string | null;
}) {
  const [value, setValue] = useState(initialNumber ?? "");
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  // Court-circuite la confirmation une seule fois, pour le resoumis declenche par `confirmClear`.
  const bypassConfirmRef = useRef(false);
  const [lastConfirmState, setLastConfirmState] = useState<State | undefined>(
    undefined,
  );

  const [state, dispatch, pending] = useActionState<State, FormData>(
    async (previous, formData) => {
      const parsed = whatsappNumberSchema.safeParse(
        formData.get("whatsappNumber") ?? "",
      );
      if (!parsed.success) {
        return {
          saved: previous.saved,
          fieldError: parsed.error.issues[0]?.message ?? "Numéro invalide.",
        };
      }

      try {
        const result = await updateBdeWhatsappNumber(formData);
        if (!result.ok) {
          const fieldError =
            "fieldErrors" in result
              ? result.fieldErrors?.whatsappNumber?.[0]
              : undefined;
          return fieldError
            ? { saved: previous.saved, fieldError }
            : {
                saved: previous.saved,
                feedback: { ok: false, text: result.error },
              };
        }
        return {
          saved: result.data.number,
          feedback: {
            ok: true,
            text: result.data.number
              ? "Numéro enregistré : il est déjà en ligne sur le site public."
              : "Numéro retiré : le bouton du site ouvre WhatsApp sans destinataire.",
          },
        };
      } catch {
        return {
          saved: previous.saved,
          feedback: { ok: false, text: NETWORK_ERROR },
        };
      }
    },
    { saved: initialNumber },
  );

  // Vider le champ retire un numero deja en ligne sur le site public (#177) : confirmation
  // explicite avant d'envoyer, sauf pour le resoumis declenche par la confirmation elle-meme.
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    if (bypassConfirmRef.current) {
      bypassConfirmRef.current = false;
      return;
    }
    if (value.trim() === "" && state.saved) {
      event.preventDefault();
      setConfirmClearOpen(true);
    }
  };

  const confirmClear = () => {
    // Le dialogue reste ouvert (pending) jusqu'a la fin de l'envoi, comme `ActiveToggleButton` :
    // le fermer tout de suite rendrait le focus au bouton d'enregistrement deja desactive par
    // `pending`, qui retomberait alors sur `body`.
    bypassConfirmRef.current = true;
    formRef.current?.requestSubmit();
  };

  // Ferme le dialogue de confirmation une fois l'envoi resolu (seul declencheur possible d'un
  // changement de `state` pendant qu'il est ouvert, voir confirmClear). Ajuste pendant le rendu
  // plutot que dans un effet (pas de rendu intermediaire avec un dialogue perime).
  if (state !== lastConfirmState) {
    if (confirmClearOpen) setConfirmClearOpen(false);
    setLastConfirmState(state);
  }

  return (
    <form
      ref={formRef}
      action={dispatch}
      onSubmit={handleSubmit}
      noValidate
      className="bg-background-primary rounded-card flex flex-col gap-6 border border-gray-200 p-5 shadow-(--shadow-card) sm:p-6 md:p-8"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="bg-background-partial text-text-primary rounded-control flex size-11 shrink-0 items-center justify-center"
        >
          <FaWhatsapp size={22} />
        </span>
        <div>
          <h2 className="text-text-secondary text-lg font-semibold">
            Numéro WhatsApp du BDE
          </h2>
          <p className="text-text-paragraph mt-1 text-sm text-pretty">
            Numéro affiché aux visiteurs du site public : bouton « Nous
            contacter » du pied de page et FAQ de l&apos;accueil. C&apos;est par
            là que les étudiants vous envoient une épreuve ou signalent une
            erreur.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="whatsappNumber" className="font-medium">
          Numéro au format international
        </label>
        <input
          id="whatsappNumber"
          name="whatsappNumber"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          spellCheck={false}
          placeholder="+229 01 23 45 67 89"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={state.fieldError ? true : undefined}
          aria-describedby="whatsappNumber-hint"
          className={`rounded-control w-full border px-3 py-2.5 text-base tabular-nums outline-none focus:border-(--color-background-accent) ${
            state.fieldError ? "border-red-400" : "border-gray-300"
          }`}
        />
        <p
          id="whatsappNumber-hint"
          aria-live="polite"
          className={`mb-0 text-sm ${state.fieldError ? "text-red-600" : "text-text-paragraph"}`}
        >
          {state.fieldError ??
            "Indicatif compris (+229 pour le Bénin). Laissez vide pour retirer le numéro."}
        </p>
      </div>

      <div className="bg-background-default rounded-control flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text-default mb-0">
          {state.saved ? (
            <>
              En ligne :{" "}
              <strong className="font-semibold tabular-nums">
                {state.saved}
              </strong>
            </>
          ) : (
            "Aucun numéro défini : le bouton du site ouvre WhatsApp sans destinataire."
          )}
        </p>
        {state.saved ? (
          <a
            href={whatsappHref("", state.saved)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary inline-flex shrink-0 items-center gap-1.5 font-semibold underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
          >
            Tester le lien <FiExternalLink size={14} aria-hidden="true" />
          </a>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          role="status"
          aria-live="polite"
          className={`mb-0 flex items-start gap-2 text-sm ${
            state.feedback?.ok ? "text-green-700" : "text-red-600"
          }`}
        >
          {state.feedback ? (
            <>
              {state.feedback.ok ? (
                <FiCheckCircle className="mt-0.5 shrink-0" aria-hidden="true" />
              ) : (
                <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
              )}
              {state.feedback.text}
            </>
          ) : null}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="bg-background-accent text-text-primary rounded-control flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 font-semibold transition-[filter] hover:brightness-110 disabled:opacity-60"
        >
          Enregistrer le numéro
          {pending ? (
            <CgSpinner className="animate-spin" aria-hidden="true" />
          ) : null}
        </button>
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Retirer le numéro WhatsApp ?"
        description={
          <p className="mb-0">
            Le bouton « Nous contacter » du site public ouvrira WhatsApp sans
            destinataire jusqu&apos;à ce qu&apos;un numéro soit renseigné à
            nouveau.
          </p>
        }
        confirmLabel="Retirer le numéro"
        tone="danger"
        pending={pending}
        onConfirm={confirmClear}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </form>
  );
}
