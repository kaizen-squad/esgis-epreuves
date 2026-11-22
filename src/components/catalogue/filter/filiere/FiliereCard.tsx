interface FiliereCardProps {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const FiliereCard = ({ name, label, checked, onChange }: FiliereCardProps) => {
  return (
    <div className="mb-4">
      <label className="flex cursor-pointer items-center gap-4">
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onChange}
          onClick={checked ? onChange : undefined}
          className="checked:accent-background-accent aspect-square w-5 shrink-0"
        />
        <span className="min-w-0 flex-1">{label}</span>
      </label>
    </div>
  );
};

export default FiliereCard;
