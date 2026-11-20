interface SegmentedFilterProps {
  /** `value: null` = "Tous/Toutes" (filtre inactif). */
  choices: { label: string; value: string | null }[];
  current: string | null;
  onChange: (value: string | null) => void;
}

/** Choix exclusif en ligne (session, type d'evaluation). */
const SegmentedFilter = ({
  choices,
  current,
  onChange,
}: SegmentedFilterProps) => {
  return (
    <div className="bg-background-default flex rounded p-1">
      {choices.map((choice) => (
        <button
          type="button"
          onClick={() => onChange(choice.value)}
          aria-pressed={current === choice.value}
          key={choice.label}
          className={`flex min-w-0 flex-1 cursor-pointer flex-col rounded p-1 text-center ${current === choice.value ? "bg-background-accent text-text-primary" : ""}`}
        >
          <span className="w-full truncate text-sm">{choice.label}</span>
        </button>
      ))}
    </div>
  );
};

export default SegmentedFilter;
