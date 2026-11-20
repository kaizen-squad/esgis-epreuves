"use client";

import { useActionState, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { updateExamMetadata } from "@/features/exams/actions";
import { EXAM_SESSIONS, EXAM_TYPES } from "@/features/exams/schemas";
import type { Exam } from "@/features/exams/types";
import type {
  Field,
  Level,
  Option,
  Subject,
} from "@/features/referentials/types";
import type { ActionResult } from "@/lib/action-result";
import ExamActionMessage from "./ExamActionMessage";

type ExamMetadataFormProps = {
  exam: Exam;
  fields: Field[];
  levels: Level[];
  subjects: Subject[];
  options: Option[];
};

const INPUT_CLASS = "w-full rounded-lg border px-3 py-2 outline-none";

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="text-sm text-red-600">
      {errors[0]}
    </p>
  );
}

/**
 * Formulaire de modification des metadonnees d'une epreuve (fichier inchange), prerempli avec
 * les valeurs actuelles. Les matieres proposees dependent de la filiere et du niveau choisis,
 * les options de la filiere ; la matiere ou l'option devenue incompatible est videe.
 */
export default function ExamMetadataForm({
  exam,
  fields,
  levels,
  subjects,
  options,
}: ExamMetadataFormProps) {
  const [fieldId, setFieldId] = useState(exam.fieldId);
  const [levelId, setLevelId] = useState(exam.levelId);
  const [subjectId, setSubjectId] = useState(exam.subjectId);
  const [optionId, setOptionId] = useState(exam.optionId ?? "");

  const [state, formAction, pending] = useActionState<
    ActionResult<{ slug: string }> | null,
    FormData
  >((_prev, formData) => updateExamMetadata(exam.id, formData), null);

  const fieldErrors =
    state && !state.ok && "fieldErrors" in state
      ? state.fieldErrors
      : undefined;

  const availableSubjects = subjects.filter(
    (subject) => subject.fieldId === fieldId && subject.levelId === levelId,
  );
  const availableOptions = options.filter(
    (option) => option.fieldId === fieldId,
  );

  const handleFieldChange = (value: string) => {
    setFieldId(value);
    if (!subjects.some((s) => s.id === subjectId && s.fieldId === value)) {
      setSubjectId("");
    }
    if (!options.some((o) => o.id === optionId && o.fieldId === value)) {
      setOptionId("");
    }
  };

  const handleLevelChange = (value: string) => {
    setLevelId(value);
    if (!subjects.some((s) => s.id === subjectId && s.levelId === value)) {
      setSubjectId("");
    }
  };

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="font-medium">
          Titre
        </label>
        <input
          id="title"
          name="title"
          defaultValue={exam.title}
          required
          aria-invalid={fieldErrors?.title ? true : undefined}
          aria-describedby={fieldErrors?.title ? "title-error" : undefined}
          className={INPUT_CLASS}
        />
        <FieldError id="title-error" errors={fieldErrors?.title} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="academicYear" className="font-medium">
          Année académique
        </label>
        <input
          id="academicYear"
          name="academicYear"
          defaultValue={exam.academicYear}
          placeholder="2024-2025"
          pattern="\d{4}-\d{4}"
          required
          aria-invalid={fieldErrors?.academicYear ? true : undefined}
          aria-describedby={
            fieldErrors?.academicYear ? "academicYear-error" : undefined
          }
          className={INPUT_CLASS}
        />
        <FieldError
          id="academicYear-error"
          errors={fieldErrors?.academicYear}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="session" className="font-medium">
            Session
          </label>
          <select
            id="session"
            name="session"
            defaultValue={exam.session}
            className={INPUT_CLASS}
          >
            {EXAM_SESSIONS.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
          <FieldError id="session-error" errors={fieldErrors?.session} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="examType" className="font-medium">
            Type d&apos;évaluation
          </label>
          <select
            id="examType"
            name="examType"
            defaultValue={exam.examType}
            className={INPUT_CLASS}
          >
            {EXAM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <FieldError id="examType-error" errors={fieldErrors?.examType} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="fieldId" className="font-medium">
            Filière
          </label>
          <select
            id="fieldId"
            name="fieldId"
            value={fieldId}
            onChange={(event) => handleFieldChange(event.target.value)}
            className={INPUT_CLASS}
          >
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
          <FieldError id="fieldId-error" errors={fieldErrors?.fieldId} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="levelId" className="font-medium">
            Niveau
          </label>
          <select
            id="levelId"
            name="levelId"
            value={levelId}
            onChange={(event) => handleLevelChange(event.target.value)}
            className={INPUT_CLASS}
          >
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
          <FieldError id="levelId-error" errors={fieldErrors?.levelId} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="subjectId" className="font-medium">
            Matière
          </label>
          <select
            id="subjectId"
            name="subjectId"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            aria-invalid={fieldErrors?.subjectId ? true : undefined}
            aria-describedby={
              fieldErrors?.subjectId ? "subjectId-error" : undefined
            }
            className={INPUT_CLASS}
          >
            <option value="" disabled>
              {availableSubjects.length
                ? "Choisir une matière"
                : "Aucune matière pour cette filière et ce niveau"}
            </option>
            {availableSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <FieldError id="subjectId-error" errors={fieldErrors?.subjectId} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="optionId" className="font-medium">
            Option (facultatif)
          </label>
          <select
            id="optionId"
            name="optionId"
            value={optionId}
            onChange={(event) => setOptionId(event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Aucune</option>
            {availableOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <FieldError id="optionId-error" errors={fieldErrors?.optionId} />
        </div>
      </div>

      <ExamActionMessage
        state={state}
        successMessage="Les données de l'épreuve ont été modifiées."
      />

      <button
        type="submit"
        disabled={pending}
        className="bg-background-accent flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-white disabled:opacity-50"
      >
        Enregistrer les modifications
        {pending ? <CgSpinner className="animate-spin" size={20} /> : null}
      </button>
    </form>
  );
}
