"use client";

import { EXAM_SESSIONS, EXAM_TYPES } from "@/features/exams/schemas";
import type { Field, Level, Subject } from "@/features/referentials/types";
import ChoiceGroup from "./ChoiceGroup";
import type { ExamCommonField, ExamCommonValues } from "./examForm";
import FieldError from "./FieldError";
import SubjectSearch from "./SubjectSearch";

const SESSION_LABELS: Record<(typeof EXAM_SESSIONS)[number], string> = {
  "Session Normale": "Normale",
  Rattrapage: "Rattrapage",
};
const EXAM_TYPE_LABELS: Record<(typeof EXAM_TYPES)[number], string> = {
  "Contrôle Terminal": "Terminal",
  "Contrôle Continu": "Continu",
};

export const INPUT_CLASS =
  "w-full rounded-lg border px-3 py-2 outline-none focus:border-background-accent";

export function inputClass(error?: string) {
  return `${INPUT_CLASS} ${error ? "border-red-400" : "border-gray-300"}`;
}

/**
 * Champs communs aux formulaires d'ajout et de modification d'une epreuve : matiere (recherche,
 * en premier), filiere, niveau, type et session. Choisir une matiere renseigne sa filiere et son
 * niveau et les passe en lecture seule (#202, une matiere appartient a une seule filiere/niveau) :
 * "Changer de matiere" les rend de nouveau modifiables. Un Controle Continu masque et vide la
 * session (#196/#202, jamais de session pour ce type).
 */
export default function ExamCommonFields({
  fields,
  levels,
  subjects,
  values,
  errors,
  onChange,
}: {
  fields: Field[];
  levels: Level[];
  subjects: Subject[];
  values: ExamCommonValues;
  errors: Partial<Record<ExamCommonField, string>>;
  onChange: (patch: Partial<ExamCommonValues>) => void;
}) {
  const subjectChosen = Boolean(values.subjectId);
  const fieldName = fields.find((f) => f.id === values.fieldId)?.name;
  const levelName = levels.find((l) => l.id === values.levelId)?.name;

  const handleSubjectSelect = (subject: Subject | null) =>
    onChange(
      subject
        ? {
            subjectId: subject.id,
            fieldId: subject.fieldId,
            levelId: subject.levelId,
          }
        : { subjectId: "" },
    );

  const handleTypeChange = (examType: string) =>
    onChange({
      examType,
      // Un Controle Continu n'a jamais de session (#196) : la valeur choisie devient hors sujet.
      ...(examType === "Contrôle Continu" ? { session: "" } : {}),
    });

  // Choisir une matiere renseigne deja filiere et niveau : quand la matiere elle-meme est
  // manquante, inutile de signaler separement filiere/niveau comme en erreur (#172, evite 3
  // messages redondants sur un envoi vide alors qu'une seule action les resout tous).
  const fieldError = errors.subjectId ? undefined : errors.fieldId;
  const levelError = errors.subjectId ? undefined : errors.levelId;

  return (
    <>
      <SubjectSearch
        // Remonte le composant a chaque changement de matiere (y compris vide, "Changer de
        // matiere") : sans ca, sa recherche interne gardait l'ancien nom affiche meme apres
        // effacement de `subjectId` (revue Opus du lot, defaut important).
        key={values.subjectId}
        subjects={subjects}
        fields={fields}
        levels={levels}
        fieldId={values.fieldId}
        levelId={values.levelId}
        subjectId={values.subjectId}
        onSelect={handleSubjectSelect}
        error={errors.subjectId}
      />
      <p className="text-text-paragraph mb-0 text-sm">
        Matière manquante ?{" "}
        <a
          href="mailto:contact@kaizen.bj?subject=Mati%C3%A8re%20manquante%20sur%20Alexandria"
          className="font-medium underline"
        >
          Demandez son ajout à l&apos;administrateur.
        </a>
      </p>

      {/* lg plutot que md : un nom de filiere long (ex. "Telecommunications et Reseaux") se
          coupait dans un select trop etroit dès que les deux colonnes apparaissaient (#171). */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label
            htmlFor={subjectChosen ? undefined : "fieldId"}
            className="font-medium"
          >
            Filière *
          </label>
          {subjectChosen ? (
            <>
              <p className="text-text-paragraph bg-background-default mb-0 rounded-lg border border-gray-200 px-3 py-2">
                {fieldName}
              </p>
              <input type="hidden" name="fieldId" value={values.fieldId} />
            </>
          ) : (
            <select
              id="fieldId"
              name="fieldId"
              value={values.fieldId}
              onChange={(event) => onChange({ fieldId: event.target.value })}
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={fieldError ? "fieldId-error" : undefined}
              className={inputClass(fieldError)}
            >
              <option value="" disabled>
                Choisir une filière
              </option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          )}
          <FieldError name="fieldId" error={fieldError} />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={subjectChosen ? undefined : "levelId"}
            className="font-medium"
          >
            Niveau *
          </label>
          {subjectChosen ? (
            <>
              <p className="text-text-paragraph bg-background-default mb-0 rounded-lg border border-gray-200 px-3 py-2">
                {levelName}
              </p>
              <input type="hidden" name="levelId" value={values.levelId} />
            </>
          ) : (
            <select
              id="levelId"
              name="levelId"
              value={values.levelId}
              onChange={(event) => onChange({ levelId: event.target.value })}
              aria-invalid={levelError ? true : undefined}
              aria-describedby={levelError ? "levelId-error" : undefined}
              className={inputClass(levelError)}
            >
              <option value="" disabled>
                Choisir un niveau
              </option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          )}
          <FieldError name="levelId" error={levelError} />
        </div>
      </div>

      {subjectChosen ? (
        <button
          type="button"
          onClick={() => handleSubjectSelect(null)}
          className="text-text-default self-start text-sm font-medium underline"
        >
          Changer de matière
        </button>
      ) : null}

      <div className="grid gap-5 md:grid-cols-1">
        <ChoiceGroup
          name="examType"
          legend="Type *"
          choices={EXAM_TYPES.map((type) => ({
            label: EXAM_TYPE_LABELS[type],
            value: type,
          }))}
          value={values.examType}
          onChange={handleTypeChange}
          error={errors.examType}
        />
        {values.examType !== "Contrôle Continu" ? (
          <ChoiceGroup
            name="session"
            legend="Session *"
            choices={EXAM_SESSIONS.map((session) => ({
              label: SESSION_LABELS[session],
              value: session,
            }))}
            value={values.session}
            onChange={(session) => onChange({ session })}
            error={errors.session}
          />
        ) : null}
      </div>
    </>
  );
}
