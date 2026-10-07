interface ResearchProps {
  label: string;
}

const Research = ({ label }: ResearchProps) => {
  return (
    <div className="mb-8 px-6 text-center">
      <p className="mb-4 text-lg">{label}</p>

      <div className="bg-background-primary flex border border-gray-300 px-2 py-1">
        <input
          className="min-w-0 flex-1 outline-none"
          type="search"
          placeholder="Rechercher une matière, un titre..."
        />
        <button className="bg-background-accent text-text-primary h-full min-w-0 p-2">
          Rechercher
        </button>
      </div>
    </div>
  );
};

export default Research;
