"use client";

import { useActionState } from "react";
import { login } from "@/features/auth/actions";
import type { ActionResult } from "@/lib/action-result";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult<void> | null,
    FormData
  >(login, null);

  const fieldErrors =
    state && !state.ok && "fieldErrors" in state
      ? state.fieldErrors
      : undefined;
  const formError = state && !state.ok ? state.error : null;

  return (
    <form
      action={formAction}
      className="mb-4 flex w-full flex-col gap-6 px-4 md:mb-10 md:gap-8"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-text-default font-medium">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={fieldErrors?.email ? true : undefined}
          aria-describedby={fieldErrors?.email ? "email-error" : undefined}
          className="rounded-lg border px-3 py-2 outline-none"
          placeholder="Entrez votre email"
        />
        {fieldErrors?.email?.length ? (
          <p id="email-error" className="text-sm text-red-600">
            {fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-text-default font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={fieldErrors?.password ? true : undefined}
          aria-describedby={
            fieldErrors?.password ? "password-error" : undefined
          }
          className="rounded-lg border px-3 py-2"
          placeholder="Entrez votre mot de passe"
        />
        {fieldErrors?.password?.length ? (
          <p id="password-error" className="text-sm text-red-600">
            {fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-background-accent rounded-lg px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
