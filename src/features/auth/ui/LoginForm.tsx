"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { login } from "@/features/auth/actions";
import type { ActionResult } from "@/lib/action-result";
import { CgSpinner } from "react-icons/cg";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult<void> | null,
    FormData
  >(login, null);
  const [email, setEmail] = useState("");
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={fieldErrors?.email ? true : undefined}
          className="rounded-lg border px-3 py-2 outline-none"
          placeholder="Entrez votre email"
        />
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
          className="rounded-lg border px-3 py-2"
          placeholder="Entrez votre mot de passe"
        />
        <p className="text-text-paragraph mb-0 text-sm">
          Mot de passe oublié ? Contactez l&apos;administrateur.
        </p>
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-background-accent cursor-pointer rounded-lg px-4 py-3 text-white disabled:opacity-50"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-4">
            Connexion <CgSpinner size={20} />
          </span>
        ) : (
          "Se connecter"
        )}
      </button>
    </form>
  );
}
