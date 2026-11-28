"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { login } from "@/features/auth/actions";
import type { ActionResult } from "@/lib/action-result";
import { CgSpinner } from "react-icons/cg";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import FieldError from "@/app/(bde)/bde/epreuves/components/exam-form/FieldError";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult<void> | null,
    FormData
  >(login, null);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const fieldErrors =
    state && !state.ok && "fieldErrors" in state
      ? state.fieldErrors
      : undefined;
  const formError = state && !state.ok ? state.error : null;

  // Deplace le focus sur le premier champ en erreur apres un echec : le champ fautif s'il est
  // identifie (email ou mot de passe invalide), sinon le mot de passe (identifiants incorrects,
  // aucun champ en particulier a blamer). Depend de `state`, pas de `formError` : deux echecs de
  // suite avec le meme message garderaient la meme chaine et ne redeclencheraient pas l'effet.
  useEffect(() => {
    if (!state || state.ok) return;
    const target =
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      formRef.current?.querySelector<HTMLElement>("#password");
    target?.focus();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      {formError ? (
        <div
          role="alert"
          className="border-error/30 bg-error/10 text-error rounded-control flex items-start gap-3 border p-4 text-sm"
        >
          <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
          {formError}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="font-medium">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fieldErrors?.email ? true : undefined}
          aria-describedby={fieldErrors?.email ? "email-error" : undefined}
          className="field-control"
          placeholder="vous@esgis.bj"
        />
        <FieldError name="email" error={fieldErrors?.email?.[0]} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="font-medium">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={fieldErrors?.password ? true : undefined}
            aria-describedby={
              fieldErrors?.password ? "password-error" : undefined
            }
            className="field-control pr-11"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            className="text-text-paragraph hover:bg-background-default rounded-control absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-1"
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <FieldError name="password" error={fieldErrors?.password?.[0]} />
        <p className="text-text-paragraph mb-0 text-sm">
          Mot de passe oublié ? Contactez l&apos;administrateur.
        </p>
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? (
          <>
            Connexion <CgSpinner size={18} className="animate-spin" />
          </>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}
