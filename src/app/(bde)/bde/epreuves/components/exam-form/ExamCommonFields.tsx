"use client";

import type { ReactNode } from "react";
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
 * en premier), filiere, niveau, session et type. Changer de filiere ou de niveau vide la matiere
 * devenue incompatible ; choisir une matiere renseigne sa filiere et son niveau.
 */
export default function ExamCommonFields({
  fields,
  levels,
  subjects,
  values,
  errors,
  onChange,
  afterSubject,
}: {
  fields: Field[];
  levels: Level[];
  subjects: Subject[];
  values: ExamCommonValues;
  errors: Partial<Record<ExamCommonField, string>>;
  onChange: (patch: Partial<ExamCommonValues>) => void;
  /** Champ supplementaire affiche sous filiere/niveau (ex. option, en modification). */
  afterSubject?: ReactNode;
}) {
  const subjectFits = (fieldId: string, levelId: string) =>
    subjects.some(
      (s) =>
        s.id === values.subjectId &&
        (!fieldId || s.fieldId === fieldId) &&
        (!levelId || s.levelId === levelId),
    );

  const handleFieldChange = (fieldId: string) =>
    onChange({
      fieldId,
      ...(subjectFits(fieldId, values.levelId) ? {} : { subjectId: "" }),
    });

  const handleLevelChange = (levelId: string) =>
    onChange({
      levelId,
      ...(subjectFits(values.fieldId, levelId) ? {} : { subjectId: "" }),
    });

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

  return (
    <>
      <SubjectSearch
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
        Matière manquante ? Demandez son ajout à l&apos;administrateur.
      </p>

      {/* lg plutot que md : un nom de filiere long (ex. "Telecommunications et Reseaux") se
          coupait dans un select trop etroit dès que les deux colonnes apparaissaient (#171). */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="fieldId" className="font-medium">
            Filière *
          </label>
          <select
            id="fieldId"
            name="fieldId"
            value={values.fieldId}
            onChange={(event) => handleFieldChange(event.target.value)}
            aria-invalid={errors.fieldId ? true : undefined}
            aria-describedby={errors.fieldId ? "fieldId-error" : undefined}
            className={inputClass(errors.fieldId)}
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
          <FieldError name="fieldId" error={errors.fieldId} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="levelId" className="font-medium">
            Niveau *
          </label>
          <select
            id="levelId"
            name="levelId"
            value={values.levelId}
            onChange={(event) => handleLevelChange(event.target.value)}
            aria-invalid={errors.levelId ? true : undefined}
            aria-describedby={errors.levelId ? "levelId-error" : undefined}
            className={inputClass(errors.levelId)}
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
          <FieldError name="levelId" error={errors.levelId} />
        </div>
      </div>

      {afterSubject}

      <div className="grid gap-5 md:grid-cols-1">
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
        <ChoiceGroup
          name="examType"
          legend="Type *"
          choices={EXAM_TYPES.map((type) => ({
            label: EXAM_TYPE_LABELS[type],
            value: type,
          }))}
          value={values.examType}
          onChange={(examType) => onChange({ examType })}
          error={errors.examType}
        />
      </div>
    </>
  );
}
