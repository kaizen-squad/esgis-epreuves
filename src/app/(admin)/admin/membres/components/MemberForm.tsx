"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type SubmitEvent,
} from "react";
import { CgSpinner } from "react-icons/cg";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiCopy,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
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
  const [copied, setCopied] = useState(false);
  // Email deja confirme pour le changement d'email en cours (normalise, comme a l'envoi) : evite
  // de redemander a chaque soumission si l'utilisateur a deja valide ce changement precis.
  const [confirmedEmail, setConfirmedEmail] = useState(
    initial.email.trim().toLowerCase(),
  );
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const pendingFormDataRef = useRef<FormData | null>(null);

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

  const submitFormData = (formData: FormData) =>
    startTransition(() => dispatch(formData));

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEmail = values.email.trim().toLowerCase();
    // La confirmation ne doit porter que sur une saisie valide : sinon on avertit d'un changement
    // d'email qui ne pourra pas s'envoyer (ex. domaine manquant), avant meme l'erreur de validation.
    const validEmailChange =
      member &&
      newEmail !== member.email.toLowerCase() &&
      newEmail !== confirmedEmail &&
      (isEdit ? memberUpdateSchema : memberCreateSchema).safeParse(
        Object.fromEntries(formData),
      ).success;
    if (validEmailChange) {
      pendingFormDataRef.current = formData;
      setConfirmEmailOpen(true);
      return;
    }
    submitFormData(formData);
  };

  const confirmEmailChange = () => {
    // Le dialogue reste ouvert (pending) jusqu'a la fin de l'envoi, comme `ActiveToggleButton` :
    // le fermer tout de suite rendrait le focus a un bouton de soumission deja desactive par
    // `pending`, qui retomberait alors sur `body`.
    setConfirmedEmail(values.email.trim().toLowerCase());
    if (pendingFormDataRef.current) submitFormData(pendingFormDataRef.current);
    pendingFormDataRef.current = null;
  };

  const dismiss = () => {
    if (state.status === "done") setDismissedId(state.id);
  };

  // Ferme le dialogue de confirmation d'email une fois l'envoi resolu (seul declencheur possible
  // d'un changement de `state` pendant qu'il est ouvert, voir confirmEmailChange). Un ajustement
  // pendant le rendu (plutot qu'un effet) provoquait une boucle de rendu infinie au SSR :
  // `useActionState` n'y preserve pas l'identite de son etat entre les tentatives de rendu
  // synchrones declenchees par un `setState` appele pendant le rendu lui-meme.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfirmEmailOpen(false);
  }, [state]);

  // Deplace le focus sur le premier champ en erreur apres un envoi invalide (serveur ou client),
  // au lieu de le laisser retomber sur `body` (bureau) ou sur le bouton de soumission (mobile).
  useEffect(() => {
    if (state.status !== "invalid" && !failure) return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (showSuccess) {
    return (
      <div className="bg-background-primary rounded-card border-border-default shadow-card flex max-w-2xl flex-col items-center border px-6 py-12 text-center">
        <span className="bg-success/10 text-success mb-5 flex size-16 items-center justify-center rounded-full">
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
        {!isEdit ? (
          <button
            type="button"
            onClick={() => {
              const email = values.email.trim().toLowerCase();
              navigator.clipboard
                ?.writeText(`${email} / ${values.password}`)
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                })
                .catch(() => {});
            }}
            className="btn-secondary mb-6 px-3 py-1.5"
          >
            <FiCopy size={14} />
            {copied ? "Identifiants copiés" : "Copier les identifiants"}
          </button>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/admin" className="btn-secondary">
            Retour à la liste des membres
          </Link>
          <button
            type="button"
            onClick={() => {
              dismiss();
              if (isEdit) set("password", "");
              else setValues(EMPTY);
            }}
            className="btn-primary"
          >
            {isEdit ? "Continuer la modification" : "Ajouter un autre membre"}
          </button>
        </div>
      </div>
    );
  }

  const field = (
    name: MemberFormField,
    label: string,
    props: InputHTMLAttributes<HTMLInputElement> = {},
    required = true,
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
        required={required}
        aria-required={required}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="field-control"
        {...props}
      />
      {errors[name] ? (
        <p id={`${name}-error`} className="text-error mb-0 text-sm">
          {errors[name]}
        </p>
      ) : null}
    </div>
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="bg-background-primary rounded-card border-border-default shadow-card flex max-w-2xl flex-col gap-8 border p-6 md:p-8"
    >
      {failure ? (
        <div
          role="alert"
          className="rounded-control border-error/30 bg-error/10 text-error flex items-start gap-3 border p-4 text-sm"
        >
          <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
          {failure.error}
        </div>
      ) : null}

      <p className="text-text-paragraph mb-0 text-sm">
        Les champs marqués <span aria-hidden="true">*</span>
        <span className="sr-only">(astérisque)</span> sont obligatoires.
      </p>

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
              required={!isEdit}
              aria-required={!isEdit}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={
                errors.password
                  ? "password-error password-hint"
                  : "password-hint"
              }
              className="field-control pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={
                showPassword ? "Masquer la saisie" : "Afficher la saisie"
              }
              className="text-text-paragraph rounded-control hover:bg-background-default absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer p-1"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password ? (
            <p id="password-error" className="text-error mb-0 text-sm">
              {errors.password}
            </p>
          ) : null}
          <p id="password-hint" className="text-text-paragraph mb-0 text-sm">
            {isEdit
              ? "Laissez vide pour conserver le mot de passe actuel."
              : `${MIN_PASSWORD_LENGTH} caractères minimum. Communiquez-le au membre après la création.`}
          </p>
        </div>
      </fieldset>

      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin"
          className="text-text-paragraph px-2 py-2 hover:underline"
        >
          Annuler
        </Link>
        <button type="submit" disabled={pending} className="btn-primary">
          {isEdit ? "Enregistrer les modifications" : "Ajouter le membre"}
          {pending ? <CgSpinner className="animate-spin" /> : <FiArrowRight />}
        </button>
      </div>

      <ConfirmDialog
        open={confirmEmailOpen}
        title="Changer l'email du membre ?"
        description={
          <p className="mb-0">
            <strong>{values.email.trim().toLowerCase()}</strong> deviendra son
            nouvel identifiant de connexion : il ne pourra plus se connecter
            avec l&apos;ancien email.
          </p>
        }
        confirmLabel="Changer l'email"
        pending={pending}
        onConfirm={confirmEmailChange}
        onCancel={() => {
          setConfirmEmailOpen(false);
          pendingFormDataRef.current = null;
        }}
      />
    </form>
  );
}
