interface MatiereCardProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const MatiereCard = ({ label, checked, onChange }: MatiereCardProps) => {
  return (
    <div className="mb-4">
      <label className="flex cursor-pointer items-center gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="checked:accent-background-accent size-5 shrink-0"
        />
        <span className="min-w-0 flex-1 text-sm">{label}</span>
      </label>
    </div>
  );
};

export default MatiereCard;
