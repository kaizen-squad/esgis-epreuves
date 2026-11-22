import { FiX } from "@/components/icons";
import type { CatalogueFilterOptions } from "@/components/exams/catalogueFilters";
import type { CatalogueFilters } from "@/components/exams/useCatalogueFilters";

interface ActiveFiltersProps {
  options: CatalogueFilterOptions;
  filters: CatalogueFilters;
}

/** Liste les filtres actifs du catalogue (hors recherche et page), avec un bouton pour retirer chacun. */
function activeChips(
  options: CatalogueFilterOptions,
  filters: CatalogueFilters,
) {
  const fieldId = filters.get("fieldId");
  const levelId = filters.get("levelId");
  const subjectId = filters.get("subjectId");
  const session = filters.get("session");
  const examType = filters.get("examType");
  const academicYear = filters.get("academicYear");

  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (fieldId) {
    const field = options.fields?.find((item) => item.id === fieldId);
    if (field)
      chips.push({
        key: "fieldId",
        label: field.name,
        onRemove: () => filters.set("fieldId", null),
      });
  }
  if (levelId) {
    const level = options.levels.find((item) => item.id === levelId);
    if (level)
      chips.push({
        key: "levelId",
        label: level.name,
        onRemove: () => filters.set("levelId", null),
      });
  }
  if (subjectId) {
    const subject = options.subjects.find((item) => item.id === subjectId);
    if (subject)
      chips.push({
        key: "subjectId",
        label: subject.name,
        onRemove: () => filters.set("subjectId", null),
      });
  }
  if (session)
    chips.push({
      key: "session",
      label: session,
      onRemove: () => filters.set("session", null),
    });
  if (examType)
    chips.push({
      key: "examType",
      label: examType,
      onRemove: () => filters.set("examType", null),
    });
  if (academicYear)
    chips.push({
      key: "academicYear",
      label: academicYear,
      onRemove: () => filters.set("academicYear", null),
    });

  return chips;
}

const ActiveFilters = ({ options, filters }: ActiveFiltersProps) => {
  const chips = activeChips(options, filters);
  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-text-paragraph text-sm font-medium">
        {chips.length} filtre{chips.length > 1 ? "s" : ""} actif
        {chips.length > 1 ? "s" : ""}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="bg-background-primary text-text-default flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-sm"
        >
          {chip.label}
          <FiX size={14} />
        </button>
      ))}
    </div>
  );
};

export default ActiveFilters;
