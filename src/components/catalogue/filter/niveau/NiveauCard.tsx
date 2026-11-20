interface NiveauCardProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const NiveauCard = ({ label, active, onClick }: NiveauCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-5 py-2 ${active ? "border-background-accent bg-background-accent text-text-primary" : "border-gray-400"}`}
    >
      <span className="font-semibold">{label}</span>
    </button>
  );
};

export default NiveauCard;
