"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  type SubmitEvent,
} from "react";
import { CgSpinner } from "react-icons/cg";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiEdit2,
  FiX,
} from "react-icons/fi";
import ActiveToggleButton from "@/app/(admin)/components/ActiveToggleButton";
import type { Field, Level } from "@/features/referentials/types";
import type { ActionResult } from "@/lib/action-result";

const INPUT_CLASS =
  "w-full rounded-control border px-3 py-2 outline-none focus:border-background-accent";

function inputClass(error?: string) {
  return `${INPUT_CLASS} ${error ? "border-red-400" : "border-gray-300"}`;
}

type Kind = "field" | "level" | "subject" | "option";

type Label = {
  /** "une filière" */
  indefinite: string;
  /** "cette filière" */
  demonstrative: string;
  /** "Aucune filière" */
  empty: string;
  /** "Active" ou "Actif" */
  activeBadge: string;
  /** "Désactivée" ou "Désactivé" */
  inactiveBadge: string;
};

const LABELS: Record<Kind, Label> = {
  field: {
    indefinite: "une filière",
    demonstrative: "cette filière",
    empty: "Aucune filière",
    activeBadge: "Active",
    inactiveBadge: "Désactivée",
  },
  level: {
    indefinite: "un niveau",
    demonstrative: "ce niveau",
    empty: "Aucun niveau",
    activeBadge: "Actif",
    inactiveBadge: "Désactivé",
  },
  subject: {
    indefinite: "une matière",
    demonstrative: "cette matière",
    empty: "Aucune matière",
    activeBadge: "Active",
    inactiveBadge: "Désactivée",
  },
  option: {
    indefinite: "une option",
    demonstrative: "cette option",
    empty: "Aucune option",
    activeBadge: "Active",
    inactiveBadge: "Désactivée",
  },
};

export type ReferentialItem = {
  id: string;
  name: string;
  isActive: boolean;
  fieldId?: string;
  levelId?: string;
};

type CreateState =
  | { status: "idle" }
  | { status: "invalid"; errors: Record<string, string> }
  | { status: "done"; id: number; result: ActionResult<{ id: string }> };

/**
 * Ecran de gestion d'un referentiel (filiere, niveau, matiere ou option) pour l'Admin : creation,
 * renommage et activation/desactivation, branches sur les actions de `referentials/actions.ts`
 * (deja protegees par la RLS admin-only, jamais reverifiees ici). Un seul composant parametre par
 * `kind` plutot que 4 copies : les 4 referentiels partagent la meme forme (nom, actif, 0 a 2
 * parents) et les memes signatures d'action.
 */
export default function ReferentialManager({
  kind,
  items,
  fields,
  levels,
  create,
  update,
  setActive,
  anchorId,
}: {
  kind: Kind;
  items: ReferentialItem[];
  /** Filieres (actives et inactives), pour la liste de creation (actives uniquement) et
   * l'affichage du parent dans le tableau (y compris desactive). Requis pour matiere et option. */
  fields?: Field[];
  /** Niveaux, meme role que `fields`. Requis pour matiere seulement. */
  levels?: Level[];
  create: (formData: FormData) => Promise<ActionResult<{ id: string }>>;
  update: (id: string, formData: FormData) => Promise<ActionResult<null>>;
  setActive: (id: string, isActive: boolean) => Promise<ActionResult<unknown>>;
  /** Ancre HTML pour ouvrir directement sur ce formulaire (ex. lien marque-page de l'admin). */
  anchorId?: string;
}) {
  const router = useRouter();
  const label = LABELS[kind];
  const needsField = kind === "subject" || kind === "option";
  const needsLevel = kind === "subject";
  const formRef = useRef<HTMLFormElement>(null);

  const fieldName = new Map((fields ?? []).map((f) => [f.id, f.name]));
  const levelName = new Map((levels ?? []).map((l) => [l.id, l.name]));
  const activeFields = (fields ?? []).filter((f) => f.isActive);
  const activeLevels = (levels ?? []).filter((l) => l.isActive);

  const [state, dispatch, pending] = useActionState<CreateState, FormData>(
    async (_prev, formData) => {
      const errors: Record<string, string> = {};
      if (!String(formData.get("name") ?? "").trim()) {
        errors.name = "Le nom est requis.";
      }
      if (needsField && !formData.get("fieldId")) {
        errors.fieldId = "La filière est requise.";
      }
      if (needsLevel && !formData.get("levelId")) {
        errors.levelId = "Le niveau est requis.";
      }
      if (Object.keys(errors).length > 0) return { status: "invalid", errors };

      let result: ActionResult<{ id: string }>;
      try {
        result = await create(formData);
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
  const failure =
    state.status === "done" && !state.result.ok ? state.result : null;

  useEffect(() => {
    if (state.status === "done" && state.result.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    if (state.status !== "invalid") return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        id={anchorId}
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="bg-background-primary rounded-card shadow-card flex flex-col gap-4 border border-gray-200 p-5"
      >
        <h2 className="text-text-secondary mb-0 text-lg font-semibold">
          Ajouter {label.indefinite}
        </h2>

        {failure ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <FiAlertCircle size={18} className="mt-0.5 shrink-0" />
            {failure.error}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          {needsField ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={`${kind}-fieldId`} className="font-medium">
                Filière *
              </label>
              <select
                id={`${kind}-fieldId`}
                name="fieldId"
                defaultValue=""
                aria-invalid={errors.fieldId ? true : undefined}
                className={inputClass(errors.fieldId)}
              >
                <option value="" disabled>
                  Choisir
                </option>
                {activeFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              {errors.fieldId ? (
                <p className="mb-0 text-sm text-red-600">{errors.fieldId}</p>
              ) : null}
            </div>
          ) : null}

          {needsLevel ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={`${kind}-levelId`} className="font-medium">
                Niveau *
              </label>
              <select
                id={`${kind}-levelId`}
                name="levelId"
                defaultValue=""
                aria-invalid={errors.levelId ? true : undefined}
                className={inputClass(errors.levelId)}
              >
                <option value="" disabled>
                  Choisir
                </option>
                {activeLevels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.levelId ? (
                <p className="mb-0 text-sm text-red-600">{errors.levelId}</p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <label htmlFor={`${kind}-name`} className="font-medium">
              Nom *
            </label>
            <input
              id={`${kind}-name`}
              name="name"
              aria-invalid={errors.name ? true : undefined}
              className={inputClass(errors.name)}
            />
            {errors.name ? (
              <p className="mb-0 text-sm text-red-600">{errors.name}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="bg-background-accent text-text-primary rounded-control flex h-fit items-center justify-center gap-2 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            Ajouter
            {pending ? (
              <CgSpinner className="animate-spin" size={16} />
            ) : (
              <FiArrowRight size={16} />
            )}
          </button>
        </div>
      </form>

      <div className="bg-background-primary rounded-card shadow-card overflow-hidden border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-background-default text-text-paragraph text-xs uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">
                Nom
              </th>
              {needsField ? (
                <th scope="col" className="px-5 py-3 font-medium">
                  Filière
                </th>
              ) : null}
              {needsLevel ? (
                <th scope="col" className="px-5 py-3 font-medium">
                  Niveau
                </th>
              ) : null}
              <th scope="col" className="px-5 py-3 font-medium">
                Statut
              </th>
              <th scope="col" className="px-5 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={2 + (needsField ? 1 : 0) + (needsLevel ? 1 : 0) + 1}
                  className="text-text-paragraph px-5 py-10 text-center"
                >
                  {label.empty} pour l&apos;instant.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className={item.isActive ? "" : "bg-gray-50"}>
                  <td className="px-5 py-3">
                    <RenameCell item={item} update={update} />
                  </td>
                  {needsField ? (
                    <td className="text-text-paragraph px-5 py-3">
                      {(item.fieldId && fieldName.get(item.fieldId)) ||
                        "Aucune"}
                    </td>
                  ) : null}
                  {needsLevel ? (
                    <td className="text-text-paragraph px-5 py-3">
                      {(item.levelId && levelName.get(item.levelId)) || "Aucun"}
                    </td>
                  ) : null}
                  <td className="px-5 py-3">
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        <span
                          aria-hidden
                          className="size-1.5 rounded-full bg-green-600"
                        />
                        {label.activeBadge}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600">
                        <span
                          aria-hidden
                          className="size-1.5 rounded-full bg-gray-500"
                        />
                        {label.inactiveBadge}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <ActiveToggleButton
                        id={item.id}
                        name={item.name}
                        isActive={item.isActive}
                        setActive={setActive}
                        title={
                          item.isActive
                            ? `Désactiver ${label.demonstrative} ?`
                            : `Réactiver ${label.demonstrative} ?`
                        }
                        description={
                          <p className="mb-0">
                            {item.isActive
                              ? `Désactiver ${label.demonstrative} la retire des listes publiques (menu, filtres, formulaire de dépôt). Les épreuves déjà déposées qui la référencent ne sont pas affectées.`
                              : `Réactiver ${label.demonstrative} la remet dans les listes publiques.`}
                          </p>
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Nom d'un referentiel, modifiable en place : affichage simple, un clic sur le crayon ouvre un
 * champ texte avec enregistrer/annuler. */
function RenameCell({
  item,
  update,
}: {
  item: ReferentialItem;
  update: (id: string, formData: FormData) => Promise<ActionResult<null>>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.name);
  const [error, setError] = useState<string | null>(null);
  const [pending, startRenameTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const cancel = () => {
    setEditing(false);
    setValue(item.name);
    setError(null);
    triggerRef.current?.focus();
  };

  const save = () => {
    const name = value.trim();
    if (!name) {
      setError("Le nom est requis.");
      return;
    }
    const formData = new FormData();
    formData.set("name", name);
    startRenameTransition(async () => {
      let result;
      try {
        result = await update(item.id, formData);
      } catch {
        setError(
          "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.",
        );
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditing(false);
      setError(null);
      triggerRef.current?.focus();
      router.refresh();
    });
  };

  if (!editing) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Renommer ${item.name}`}
        className={`group flex items-center gap-2 text-left font-medium ${item.isActive ? "text-text-default" : "text-gray-500"}`}
      >
        {item.name}
        <FiEdit2
          size={13}
          className="text-text-paragraph opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              save();
            }
            if (event.key === "Escape") cancel();
          }}
          aria-invalid={error ? true : undefined}
          className={`${INPUT_CLASS} py-1 ${error ? "border-red-400" : "border-gray-300"}`}
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          aria-label="Enregistrer"
          className="shrink-0 rounded p-1.5 text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          {pending ? (
            <CgSpinner className="animate-spin" size={16} />
          ) : (
            <FiCheck size={16} />
          )}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          aria-label="Annuler"
          className="text-text-paragraph shrink-0 rounded p-1.5 hover:bg-gray-100 disabled:opacity-50"
        >
          <FiX size={16} />
        </button>
      </div>
      {error ? <p className="mb-0 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
