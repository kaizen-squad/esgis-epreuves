"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useState,
  type InputHTMLAttributes,
  type SubmitEvent,
} from "react";
import { CgSpinner } from "react-icons/cg";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { createBdeMember, updateBdeMember } from "@/features/members/actions";
import {
  MIN_PASSWORD_LENGTH,
  memberCreateSchema,
  memberUpdateSchema,
  type MemberFormField,
} from "@/features/members/schemas";
import type { BdeMemberDetail } from "@/features/members/types";
import type { ActionResult } from "@/lib/action-result";

type Values = Record<MemberFormField, string>;
type Errors = Partial<Record<MemberFormField, string>>;

type SubmitState =
  | { status: "idle" }
  | { status: "invalid"; errors: Errors }
  | { status: "done"; id: number; result: ActionResult<{ id: string }> };

const EMPTY: Values = { lastName: "", firstNames: "", email: "", password: "" };

const INPUT_CLASS =
  "w-full rounded-lg border px-3 py-2 outline-none focus:border-background-accent";

function firstErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): Errors {
  const errors: Errors = {};
  for (const [field, messages] of Object.entries(fieldErrors ?? {})) {
    if (messages?.[0]) errors[field as MemberFormField] = messages[0];
  }
  return errors;
}

/**
 * Formulaire d'ajout (ou de modification) d'un membre du BDE : nom, prenoms, email et mot de
 * passe. Validation Zod cote client, puis `createBdeMember` / `updateBdeMember` (qui revalident et
 * verifient le role ADMIN). En modification, un mot de passe vide le laisse inchange.
 */
export default function MemberForm({ member }: { member?: BdeMemberDetail }) {
  const isEdit = Boolean(member);
  const initial: Values = member
    ? {
        lastName: member.lastName,
        firstNames: member.firstNames,
        email: member.email,
        password: "",
      }
    : EMPTY;
  const [values, setValues] = useState<Values>(initial);
  const [showPassword, setShowPassword] = useState(false);
  const [dismissedId, setDismissedId] = useState<number | null>(null);

  const [state, dispatch, pending] = useActionState<SubmitState, FormData>(
    async (_prev, formData) => {
      const raw = Object.fromEntries(formData);
      const parsed = (
        isEdit ? memberUpdateSchema : memberCreateSchema
      ).safeParse(raw);
      if (!parsed.success) {
        const errors: Errors = {};
        for (const issue of parsed.error.issues) {
          const field = issue.path[0] as MemberFormField;
          errors[field] ??= issue.message;
        }
        return { status: "invalid", errors };
      }

      let result: ActionResult<{ id: string }>;
      try {
        result = member
          ? await updateBdeMember(member.id, formData)
          : await createBdeMember(formData);
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

  const showSuccess =
    state.status === "done" && state.result.ok && state.id !== dismissedId;
  const failure =
    state.status === "done" && !state.result.ok ? state.result : null;
  const errors: Errors =
    state.status === "invalid"
      ? state.errors
      : failure && "fieldErrors" in failure
        ? firstErrors(failure.fieldErrors)
        : {};

  const set = (field: MemberFormField, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  const dismiss = () => {
    if (state.status === "done") setDismissedId(state.id);
  };

  if (showSuccess) {
    return (
      <div className="bg-background-primary flex max-w-2xl flex-col items-center rounded-xl border border-gray-200 px-6 py-12 text-center shadow-sm">
        <span className="mb-5 flex size-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <FiCheckCircle size={30} />
        </span>
        <h2 className="text-text-secondary mb-2 text-xl font-semibold">
          {isEdit ? "Membre modifié" : "Membre ajouté"}
        </h2>
        <p className="text-text-paragraph mb-8 max-w-md text-sm">
          {isEdit ? (
            <>
              Le compte de{" "}
              <strong>
                {values.lastName} {values.firstNames}
              </strong>{" "}
              est à jour.
              {values.password
                ? " Communiquez-lui son nouveau mot de passe."
                : null}
            </>
          ) : (
            <>
              <strong>
                {values.lastName} {values.firstNames}
              </strong>{" "}
              peut maintenant se connecter avec <strong>{values.email}</strong>{" "}
              et le mot de passe choisi. Communiquez-lui ses identifiants.
            </>
          )}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin"
            className="text-text-default rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Retour au dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              dismiss();
              if (isEdit) set("password", "");
              else setValues(EMPTY);
            }}
            className="bg-background-accent text-text-primary cursor-pointer rounded-lg px-4 py-2 text-sm font-medium"
          >
            {isEdit ? "Modifier à nouveau" : "Ajouter un autre membre"}
          </button>
        </div>
      </div>
    );
  }

  const field = (
    name: MemberFormField,
    label: string,
    props: InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={values[name]}
        onChange={(event) => set(name, event.target.value)}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className={`${INPUT_CLASS} ${errors[name] ? "border-red-400" : "border-gray-300"}`}
        {...props}
      />
      {errors[name] ? (
        <p id={`${name}-error`} className="mb-0 text-sm text-red-600">
          {errors[name]}
        </p>
      ) : null}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-background-primary flex max-w-2xl flex-col gap-8 rounded-xl border border-gray-200 p-6 shadow-sm md:p-8"
    >
      {failure ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
          {failure.error}
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-5">
        <legend className="text-text-secondary mb-4 text-lg font-semibold">
          Identité
        </legend>
        <div className="grid gap-5 md:grid-cols-2">
          {field("lastName", "Nom *", {
            autoComplete: "family-name",
            placeholder: "KOFFI",
          })}
          {field("firstNames", "Prénoms *", {
            autoComplete: "given-name",
            placeholder: "Ama Grâce",
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="text-text-secondary mb-4 text-lg font-semibold">
          Accès à la plateforme
        </legend>
        {field("email", "Email *", {
          type: "email",
          autoComplete: "off",
          placeholder: "prenom.nom@esgis.org",
        })}

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="font-medium">
            {isEdit ? "Nouveau mot de passe" : "Mot de passe *"}
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={(event) => set("password", event.target.value)}
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={
                errors.password ? "password-error" : "password-hint"
              }
              className={`${INPUT_CLASS} pr-11 ${errors.password ? "border-red-400" : "border-gray-300"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              className="text-text-paragraph absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded p-1 hover:bg-gray-100"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="mb-0 text-sm text-red-600">
              {errors.password}
            </p>
          ) : (
            <p id="password-hint" className="text-text-paragraph mb-0 text-sm">
              {isEdit
                ? "Laissez vide pour conserver le mot de passe actuel."
                : `${MIN_PASSWORD_LENGTH} caractères minimum. Communiquez-le au membre après la création.`}
            </p>
          )}
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin"
          className="text-text-paragraph px-2 py-2 hover:underline"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="bg-background-accent text-text-primary flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {isEdit ? "Enregistrer les modifications" : "Ajouter le membre"}
          {pending ? <CgSpinner className="animate-spin" /> : <FiArrowRight />}
        </button>
      </div>
    </form>
  );
}
