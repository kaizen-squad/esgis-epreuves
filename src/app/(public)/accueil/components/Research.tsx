import { FiArrowRight } from "react-icons/fi";

const Research = () => {
  return (
    <div className="mb-8 px-6 text-center">
      <div className="bg-background-primary mx-auto flex border border-gray-300 py-1 pr-2 pl-4 md:w-2/3 lg:w-1/3">
        <input
          className="min-w-0 flex-1 outline-none"
          type="search"
          placeholder="Rechercher une matière, un titre..."
        />
        <button className="bg-background-accent text-text-primary flex h-full min-w-0 cursor-pointer items-center gap-3 p-2">
          Rechercher
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

export default Research;
