"use client";

import { useRouter } from "next/navigation";
import {
  Fragment,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
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
  FiCheckCircle,
  FiEdit2,
  FiSearch,
  FiX,
} from "react-icons/fi";
import ActiveToggleButton from "@/app/(admin)/components/ActiveToggleButton";
import { searchTokens } from "@/features/exams/schemas";
import type { Field, Level, Option } from "@/features/referentials/types";
import type { ActionResult } from "@/lib/action-result";

const INPUT_CLASS =
  "w-full rounded-control border px-3 py-2 outline-none focus:border-background-accent";

function inputClass(error?: string) {
  return `${INPUT_CLASS} ${error ? "border-red-400" : "border-gray-300"}`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type Kind = "field" | "level" | "subject" | "option";

type Label = {
  /** "une filière" */
  indefinite: string;
  /** "cette filière" */
  demonstrative: string;
  /** "la" (feminin) ou "le" (masculin), pour accorder un pronom complement ("la retire") */
  pronoun: "la" | "le";
  /** "ajoutée" (feminin) ou "ajouté" (masculin), pour le message de confirmation */
  added: "ajoutée" | "ajouté";
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
    pronoun: "la",
    added: "ajoutée",
    empty: "Aucune filière",
    activeBadge: "Active",
    inactiveBadge: "Désactivée",
  },
  level: {
    indefinite: "un niveau",
    demonstrative: "ce niveau",
    pronoun: "le",
    added: "ajouté",
    empty: "Aucun niveau",
    activeBadge: "Actif",
    inactiveBadge: "Désactivé",
  },
  subject: {
    indefinite: "une matière",
    demonstrative: "cette matière",
    pronoun: "la",
    added: "ajoutée",
    empty: "Aucune matière",
    activeBadge: "Active",
    inactiveBadge: "Désactivée",
  },
  option: {
    indefinite: "une option",
    demonstrative: "cette option",
    pronoun: "la",
    added: "ajoutée",
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
  /** Option rattachee (#197), matieres seulement ; `null`/absent pour le tronc commun. */
  optionId?: string | null;
  /** Sigle d'affichage (#198), filieres seulement. */
  shortName?: string | null;
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
  options,
  examCounts = {},
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
  /** Options (actives et inactives), pour le selecteur de rattachement (#200). Requis pour matiere
   * seulement ; filtrees cote client sur la filiere choisie dans le formulaire. */
  options?: Option[];
  /** Nombre d'epreuves rattachees a chaque item (#168), pour annoncer l'impact d'une desactivation. */
  examCounts?: Record<string, number>;
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
  const needsOption = kind === "subject";
  const needsShortName = kind === "field";
  const formRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState("");
  // Controle pour que le selecteur d'option se limite a la filiere en cours de choix (#200).
  const [selectedFieldId, setSelectedFieldId] = useState("");

  const fieldName = useMemo(
    () => new Map((fields ?? []).map((f) => [f.id, f.name])),
    [fields],
  );
  const levelName = useMemo(
    () => new Map((levels ?? []).map((l) => [l.id, l.name])),
    [levels],
  );
  const optionName = useMemo(
    () => new Map((options ?? []).map((o) => [o.id, o.name])),
    [options],
  );
  const activeFields = (fields ?? []).filter((f) => f.isActive);
  const activeLevels = (levels ?? []).filter((l) => l.isActive);
  const activeOptionsForSelectedField = (options ?? []).filter(
    (o) => o.isActive && o.fieldId === selectedFieldId,
  );

  // Recherche/filtre reserve a Matieres (#168) : seule liste assez longue (22 items a plat,
  // melangeant filieres et niveaux) pour en avoir besoin ; les 3 autres referentiels restent courts.
  const searchable = kind === "subject";
  // Memes jetons que la recherche de matiere du formulaire de depot (`SubjectSearch.tsx`) :
  // insensible aux accents et a l'ordre des mots, chaque jeton doit apparaitre quelque part.
  const queryTokens = useMemo(() => searchTokens(query), [query]);
  const visibleItems = useMemo(() => {
    const filtered =
      !searchable || queryTokens.length === 0
        ? items
        : items.filter((item) => {
            const haystack = searchTokens(
              [
                item.name,
                item.fieldId ? fieldName.get(item.fieldId) : "",
                item.levelId ? levelName.get(item.levelId) : "",
                item.optionId ? optionName.get(item.optionId) : "",
              ].join(" "),
            ).join(" ");
            return queryTokens.every((token) => haystack.includes(token));
          });
    // Regroupement par filiere puis niveau (#168) : la liste de 22 matieres a plat melangeait
    // tout, trier dessus suffit a faire apparaitre les groupes sans structure de donnees a part.
    if (!searchable) return filtered;
    return [...filtered].sort((a, b) => {
      const fieldCompare = (
        (a.fieldId && fieldName.get(a.fieldId)) ||
        ""
      ).localeCompare((b.fieldId && fieldName.get(b.fieldId)) || "");
      if (fieldCompare !== 0) return fieldCompare;
      const levelCompare = (
        (a.levelId && levelName.get(a.levelId)) ||
        ""
      ).localeCompare((b.levelId && levelName.get(b.levelId)) || "");
      if (levelCompare !== 0) return levelCompare;
      return a.name.localeCompare(b.name);
    });
  }, [items, searchable, queryTokens, fieldName, levelName, optionName]);

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
  // Mise en avant de la ligne creee (#168) : persiste jusqu'a la prochaine creation, c'est
  // suffisant pour confirmer visuellement sans minuteur a gerer.
  const createdId =
    state.status === "done" && state.result.ok ? state.result.data.id : null;
  const success = createdId
    ? `${capitalize(label.indefinite)} a bien été ${label.added}.`
    : null;

  // Reajuste le filtre d'option pendant le rendu plutot que dans l'effet ci-dessous (regle
  // react-hooks/set-state-in-effect) : la creation remet aussi la filiere choisie a vide. Suit
  // `state.id` (horodatage du succes) pour ne reagir qu'une fois par soumission, jamais a une
  // selection de filiere faite apres coup par l'utilisateur.
  const [handledSuccessId, setHandledSuccessId] = useState<number | null>(null);
  if (
    state.status === "done" &&
    state.result.ok &&
    state.id !== handledSuccessId
  ) {
    setHandledSuccessId(state.id);
    setSelectedFieldId("");
  }

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

  // Grille du formulaire proportionnee au nombre de champs plutot que figee a 4 colonnes (#168) :
  // Matieres (filiere + niveau + nom) en a besoin de 3, Options (filiere + nom) de 2, Filieres et
  // Niveaux (nom seul) de 1 ; le bouton suit toujours en colonne finale auto-largeur.
  // Impact d'une desactivation (#168) : le sujet de la phrase est toujours "epreuve(s)" (feminin
  // invariable), jamais le referentiel lui-meme, pour ne pas avoir a regerer l'accord de genre en
  // plus de celui deja porte par `label.pronoun`.
  const deactivationImpact = (item: ReferentialItem) => {
    const count = examCounts[item.id] ?? 0;
    const examSentence =
      count === 0
        ? "Aucune épreuve déposée n'y fait référence pour l'instant."
        : count === 1
          ? "1 épreuve déjà déposée y fait référence ; elle ne sera pas affectée."
          : `${count} épreuves déjà déposées y font référence ; elles ne seront pas affectées.`;
    const cascadeSentence =
      kind === "field"
        ? ` Les matières et options de ${label.demonstrative} disparaissent aussi du formulaire de dépôt du BDE.`
        : "";
    return `${examSentence}${cascadeSentence}`;
  };

  // Nom + (filiere) + (niveau) + (option) + statut + actions (#200 : colonne Option en plus).
  const columnCount =
    2 + (needsField ? 1 : 0) + (needsLevel ? 1 : 0) + (needsOption ? 1 : 0) + 1;

  const fieldCount =
    1 +
    (needsField ? 1 : 0) +
    (needsLevel ? 1 : 0) +
    (needsOption ? 1 : 0) +
    (needsShortName ? 1 : 0);
  const gridColsClass =
    fieldCount === 4
      ? "sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
      : fieldCount === 3
        ? "sm:grid-cols-[1fr_1fr_1fr_auto]"
        : fieldCount === 2
          ? "sm:grid-cols-[1fr_1fr_auto]"
          : "sm:grid-cols-[1fr_auto]";

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

        {success ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            <FiCheckCircle size={18} className="mt-0.5 shrink-0" />
            {success}
          </div>
        ) : null}

        <div className={`grid gap-4 sm:items-end ${gridColsClass}`}>
          {needsField ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={`${kind}-fieldId`} className="font-medium">
                Filière *
              </label>
              <select
                id={`${kind}-fieldId`}
                name="fieldId"
                value={selectedFieldId}
                onChange={(event) => setSelectedFieldId(event.target.value)}
                aria-invalid={errors.fieldId ? true : undefined}
                aria-describedby={
                  errors.fieldId ? `${kind}-fieldId-error` : undefined
                }
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
                <p
                  id={`${kind}-fieldId-error`}
                  className="mb-0 text-sm text-red-600"
                >
                  {errors.fieldId}
                </p>
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
                aria-describedby={
                  errors.levelId ? `${kind}-levelId-error` : undefined
                }
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
                <p
                  id={`${kind}-levelId-error`}
                  className="mb-0 text-sm text-red-600"
                >
                  {errors.levelId}
                </p>
              ) : null}
            </div>
          ) : null}

          {needsOption ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={`${kind}-optionId`} className="font-medium">
                Option
              </label>
              <select
                // La cle force le reselecteur a se reinitialiser quand la filiere change : une
                // option choisie pour une autre filiere n'a plus de sens (#200).
                key={selectedFieldId}
                id={`${kind}-optionId`}
                name="optionId"
                defaultValue=""
                disabled={!selectedFieldId}
                className={inputClass(errors.optionId)}
              >
                <option value="">Tronc commun (aucune option)</option>
                {activeOptionsForSelectedField.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
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
              aria-describedby={errors.name ? `${kind}-name-error` : undefined}
              className={inputClass(errors.name)}
            />
            {errors.name ? (
              <p
                id={`${kind}-name-error`}
                className="mb-0 text-sm text-red-600"
              >
                {errors.name}
              </p>
            ) : null}
          </div>

          {needsShortName ? (
            <div className="flex flex-col gap-1">
              <label htmlFor={`${kind}-shortName`} className="font-medium">
                Sigle
              </label>
              <input
                id={`${kind}-shortName`}
                name="shortName"
                placeholder="ex. IRT"
                className={inputClass()}
              />
            </div>
          ) : null}

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

        {needsField ? (
          <p className="text-text-paragraph mb-0 text-xs">
            Le rattachement{" "}
            {needsLevel ? "à la filière et au niveau" : "à la filière"} est
            définitif : pour corriger une erreur, désactivez{" "}
            {label.demonstrative} puis recréez-la avec le bon rattachement.
          </p>
        ) : null}
      </form>

      {searchable ? (
        <div className="relative">
          <FiSearch
            aria-hidden
            size={16}
            className="text-text-paragraph pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une matière, une filière, un niveau…"
            aria-label="Rechercher une matière"
            className={`${INPUT_CLASS} border-gray-300 pl-9`}
          />
          <p
            aria-live="polite"
            className="text-text-paragraph mt-1 mb-0 text-xs"
          >
            {visibleItems.length} résultat{visibleItems.length === 1 ? "" : "s"}
          </p>
        </div>
      ) : null}

      <div className="bg-background-primary rounded-card shadow-card overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-left text-sm">
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
                {needsOption ? (
                  <th scope="col" className="px-5 py-3 font-medium">
                    Option
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
              {visibleItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="text-text-paragraph px-5 py-10 text-center"
                  >
                    {searchable && queryTokens.length > 0
                      ? "Aucun résultat pour cette recherche."
                      : `${label.empty} pour l'instant.`}
                  </td>
                </tr>
              ) : (
                visibleItems.map((item, index) => {
                  const previous = visibleItems[index - 1];
                  const showFieldGroupHeader =
                    searchable && item.fieldId !== previous?.fieldId;
                  return (
                    <Fragment key={item.id}>
                      {showFieldGroupHeader ? (
                        <tr key={`group-${item.fieldId ?? "none"}`}>
                          <td
                            colSpan={columnCount}
                            className="bg-background-default text-text-secondary px-5 py-1.5 text-xs font-semibold"
                          >
                            {(item.fieldId && fieldName.get(item.fieldId)) ||
                              "Sans filière"}
                          </td>
                        </tr>
                      ) : null}
                      <tr
                        key={item.id}
                        className={
                          item.id === createdId
                            ? "bg-background-accent/10"
                            : item.isActive
                              ? ""
                              : "bg-gray-50"
                        }
                      >
                        <td className="px-5 py-3">
                          <RenameCell item={item} update={update} kind={kind} />
                        </td>
                        {needsField ? (
                          <td className="text-text-paragraph px-5 py-3">
                            {(item.fieldId && fieldName.get(item.fieldId)) ||
                              "Aucune"}
                          </td>
                        ) : null}
                        {needsLevel ? (
                          <td className="text-text-paragraph px-5 py-3">
                            {(item.levelId && levelName.get(item.levelId)) ||
                              "Aucun"}
                          </td>
                        ) : null}
                        {needsOption ? (
                          <td className="text-text-paragraph px-5 py-3">
                            {(item.optionId && optionName.get(item.optionId)) ||
                              "Tronc commun"}
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
                                    ? `Désactiver ${label.demonstrative} ${label.pronoun} retire des listes publiques (menu, filtres, formulaire de dépôt). ${deactivationImpact(item)}`
                                    : `Réactiver ${label.demonstrative} ${label.pronoun} remet dans les listes publiques.`}
                                </p>
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Nom d'un referentiel, modifiable en place : affichage simple, un clic sur le crayon ouvre un
 * champ texte avec enregistrer/annuler. */
function RenameCell({
  item,
  update,
  kind,
}: {
  item: ReferentialItem;
  update: (id: string, formData: FormData) => Promise<ActionResult<null>>;
  kind: Kind;
}) {
  const router = useRouter();
  const needsShortName = kind === "field";
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.name);
  const [shortName, setShortName] = useState(item.shortName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startRenameTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const cancel = () => {
    setEditing(false);
    setValue(item.name);
    setShortName(item.shortName ?? "");
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
    if (needsShortName) formData.set("shortName", shortName.trim());
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
        className={`flex items-center gap-2 text-left font-medium ${item.isActive ? "text-text-default" : "text-gray-500"}`}
      >
        {item.name}
        {needsShortName && item.shortName ? (
          <span className="text-text-paragraph text-xs">
            ({item.shortName})
          </span>
        ) : null}
        <FiEdit2 size={13} className="text-text-paragraph" />
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
          aria-label={`Nouveau nom pour ${item.name}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `rename-${item.id}-error` : undefined}
          className={`${INPUT_CLASS} py-1 ${error ? "border-red-400" : "border-gray-300"}`}
        />
        {needsShortName ? (
          <input
            value={shortName}
            onChange={(event) => setShortName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                save();
              }
              if (event.key === "Escape") cancel();
            }}
            placeholder="Sigle"
            aria-label={`Sigle pour ${item.name}`}
            className={`${INPUT_CLASS} w-24 border-gray-300 py-1`}
          />
        ) : null}
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
      {error ? (
        <p id={`rename-${item.id}-error`} className="mb-0 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
