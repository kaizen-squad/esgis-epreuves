"use client";

import { useState, useTransition } from "react";
import { getDomainExams } from "@/features/exams/actions";
import type { Exam } from "@/features/exams/types";
import type { Field } from "@/features/referentials/types";
import EpreuveCard from "@/components/exams/EpreuveCard";
import DomainSelectFilter from "@/components/exams/DomainSelectFilter";
import { toEpreuveCardProps } from "@/components/exams/toEpreuveCardProps";

const GRID_CLASS =
  "mb-4 grid grid-cols-1 justify-center gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

type DomainFilterContentProps = {
  fields: Field[];
  initialExams: Exam[];
};

export default function DomainFilterContent({
  fields,
  initialExams,
}: DomainFilterContentProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [exams, setExams] = useState(initialExams);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedField = selectedFieldId
    ? fields.find((field) => field.id === selectedFieldId)
    : undefined;

  const handleSelect = (fieldId: string | null) => {
    if (fieldId === selectedFieldId || isPending) return;

    const previousFieldId = selectedFieldId;
    setSelectedFieldId(fieldId);
    setError(null);

    startTransition(async () => {
      try {
        setExams(await getDomainExams(fieldId));
      } catch {
        setSelectedFieldId(previousFieldId);
        setError("Impossible de charger les épreuves de ce domaine.");
      }
    });
  };

  return (
    <>
      <DomainSelectFilter
        fields={fields}
        selectedFieldId={selectedFieldId}
        onSelect={handleSelect}
        disabled={isPending}
      />

      {error ? (
        <p className="text-text-paragraph" role="alert">
          {error}
        </p>
      ) : isPending ? (
        <div className={GRID_CLASS} aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      ) : exams.length === 0 ? (
        <p className="text-text-paragraph">
          {selectedField
            ? `Aucune épreuve n'a encore été ajoutée pour ${selectedField.name}.`
            : "Aucune épreuve n'a encore été ajoutée."}
        </p>
      ) : (
        <div className={GRID_CLASS}>
          {exams.map((exam) => (
            <EpreuveCard {...toEpreuveCardProps(exam)} key={exam.id} />
          ))}
        </div>
      )}
    </>
  );
}
