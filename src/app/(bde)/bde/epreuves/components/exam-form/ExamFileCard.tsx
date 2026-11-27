import type { ReactNode } from "react";
import { FiAlertCircle, FiFileText } from "react-icons/fi";
import { academicYears } from "./examForm";

type CardValues = { academicYear: string; yearUnknown: boolean };

/**
 * Carte d'un fichier d'epreuve : nom, detail (taille ou erreur), actions, et l'annee academique,
 * propre a chaque fichier, nommee `academicYear` comme l'attend `uploadExamsBatch` (une valeur par
 * carte, dans l'ordre du lot) et `updateExamMetadata`. Le titre n'est plus saisi (#202) : toujours
 * genere cote serveur depuis #198. `yearUnknown` est un etat propre, jamais derive de
 * `academicYear === ""` : sinon un fichier tout juste ajoute (annee pas encore choisie) afficherait
 * la case cochee par defaut, masquant le select avant meme que le BDE ait pu choisir (revue Opus du
 * lot, defaut bloquant). Coche elle-meme ne doit pas effacer `academicYear` : l'annee choisie reste
 * en memoire pour reapparaitre dans le select si la case est decochee (revue Opus, second passage).
 */
export default function ExamFileCard({
  idPrefix,
  name,
  detail,
  fileError,
  values,
  errors,
  onChange,
  actions,
}: {
  /** Prefixe unique des id des champs de la carte. */
  idPrefix: string;
  name: string;
  detail: string;
  fileError?: string | null;
  /** Sans `values`, la carte n'affiche que le fichier (ex. remplacement du PDF). */
  values?: CardValues;
  errors?: Partial<Record<keyof CardValues, string>>;
  onChange?: (patch: Partial<CardValues>) => void;
  actions?: ReactNode;
}) {
  const yearId = `${idPrefix}-year`;
  const yearUnknownId = `${idPrefix}-year-unknown`;
  const yearUnknown = values?.yearUnknown ?? false;
  // L'annee enregistree reste proposee meme si elle sort de la plage du select.
  const years = academicYears();
  if (values?.academicYear && !years.includes(values.academicYear)) {
    years.push(values.academicYear);
  }

  return (
    <li
      className={`bg-background-primary rounded-control flex w-full flex-col gap-3 border p-3 text-left ${fileError ? "border-error" : "border-border-default"}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`rounded-control flex size-9 shrink-0 items-center justify-center ${fileError ? "bg-error/10 text-error" : "bg-background-default text-background-accent"}`}
        >
          {fileError ? <FiAlertCircle size={18} /> : <FiFileText size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-text-default mb-0 truncate text-sm font-medium">
            {name}
          </p>
          <p
            className={`mb-0 text-xs ${fileError ? "text-error" : "text-text-paragraph"}`}
          >
            {fileError ?? detail}
          </p>
        </div>
        {actions}
      </div>

      {values ? (
        <div className="flex flex-col gap-1 sm:max-w-[14rem]">
          <label
            htmlFor={yearUnknown ? undefined : yearId}
            className="text-sm font-medium"
          >
            Année académique
          </label>
          <input
            type="hidden"
            name="yearUnknown"
            value={yearUnknown ? "true" : "false"}
          />
          {yearUnknown ? (
            <input type="hidden" name="academicYear" value="" />
          ) : (
            <select
              id={yearId}
              name="academicYear"
              value={values.academicYear}
              onChange={(event) =>
                onChange?.({ academicYear: event.target.value })
              }
              aria-invalid={errors?.academicYear ? true : undefined}
              aria-describedby={
                errors?.academicYear ? `${yearId}-error` : undefined
              }
              className="field-control text-sm"
            >
              <option value="" disabled>
                Choisir une année
              </option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
          <label
            htmlFor={yearUnknownId}
            className="text-text-paragraph flex items-center gap-1.5 text-xs"
          >
            <input
              id={yearUnknownId}
              type="checkbox"
              checked={yearUnknown}
              onChange={(event) =>
                // L'annee en memoire n'est jamais effacee ici : l'input cache ci-dessus envoie
                // deja "" au serveur tant que la case est cochee, et le select la retrouve au
                // decochage.
                onChange?.({ yearUnknown: event.target.checked })
              }
            />
            Année inconnue
          </label>
          {errors?.academicYear ? (
            <p id={`${yearId}-error`} className="text-error mb-0 text-xs">
              {errors.academicYear}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
