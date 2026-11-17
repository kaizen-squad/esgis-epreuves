"use client";

import Link from "next/link";
import type { Field } from "@/features/referentials/types";
import { activityDomain } from "../constants/domain.constants";
import { useDomainStore } from "../store/domain.store";

type DomainSelectFilterProps = {
  fields?: Field[];
  selectedFieldId?: string | null;
  basePath?: string;
};

const pillClassName = (isActive: boolean) =>
  `rounded-full border border-gray-400 px-3 py-2 whitespace-nowrap ${isActive ? "bg-background-accent text-text-primary" : ""}`;

const DomainSelectFilter = ({
  fields,
  selectedFieldId = null,
  basePath = "/",
}: DomainSelectFilterProps) => {
  const { currentDomain, setDomain } = useDomainStore();

  if (fields) {
    const hrefFor = (fieldId?: string) =>
      fieldId ? `${basePath}?domain=${encodeURIComponent(fieldId)}` : basePath;

    return (
      <div className="my-10 flex w-full max-w-full gap-4 overflow-x-auto md:mx-auto md:w-fit">
        <Link
          href={hrefFor()}
          className={pillClassName(selectedFieldId === null)}
        >
          Toutes
        </Link>
        {fields.map((field) => (
          <Link
            href={hrefFor(field.id)}
            className={pillClassName(selectedFieldId === field.id)}
            key={field.id}
          >
            {field.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="my-10 flex w-full max-w-full gap-4 overflow-x-auto md:mx-auto md:w-fit">
      {["Toutes", ...activityDomain].map((domain) => {
        return (
          <button
            onClick={() => setDomain(domain)}
            className={pillClassName(currentDomain === domain)}
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
