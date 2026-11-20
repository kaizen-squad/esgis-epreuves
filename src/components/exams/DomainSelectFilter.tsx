"use client";

import type { Field } from "@/features/referentials/types";
import { activityDomain } from "@/components/exams/domain.constants";
import { useDomainStore } from "@/components/exams/domain.store";

type DomainSelectFilterProps = {
  fields?: Field[];
  selectedFieldId?: string | null;
  onSelect?: (fieldId: string | null) => void;
  disabled?: boolean;
};

const pillClassName = (isActive: boolean) =>
  `rounded-full border border-gray-400 px-3 py-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 ${isActive ? "bg-background-accent text-text-primary" : ""}`;

const DomainSelectFilter = ({
  fields,
  selectedFieldId = null,
  onSelect,
  disabled = false,
}: DomainSelectFilterProps) => {
  const { currentDomain, setDomain } = useDomainStore();

  if (fields) {
    return (
      <div className="my-10 flex w-full max-w-full gap-4 overflow-x-auto md:mx-auto md:w-fit">
        <button
          type="button"
          onClick={() => onSelect?.(null)}
          className={pillClassName(selectedFieldId === null)}
          aria-pressed={selectedFieldId === null}
          disabled={disabled}
        >
          Toutes
        </button>
        {fields.map((field) => (
          <button
            type="button"
            onClick={() => onSelect?.(field.id)}
            className={pillClassName(selectedFieldId === field.id)}
            aria-pressed={selectedFieldId === field.id}
            disabled={disabled}
            key={field.id}
          >
            {field.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="my-10 flex w-full max-w-full gap-4 overflow-x-auto md:mx-auto md:w-fit">
      {["Toutes", ...activityDomain].map((domain) => {
        return (
          <button
            type="button"
            onClick={() => setDomain(domain)}
            className={pillClassName(currentDomain === domain)}
            aria-pressed={currentDomain === domain}
            key={domain}
          >
            {domain}
          </button>
        );
      })}
    </div>
  );
};

export default DomainSelectFilter;
