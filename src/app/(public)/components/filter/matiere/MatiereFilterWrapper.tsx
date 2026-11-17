import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import type { Subject } from "@/features/referentials/types";
import { searchTokens } from "@/features/exams/schemas";
import MatiereCard from "./MatiereCard";

interface MatiereFilterWrapperProps {
  subjects: Subject[];
  selectedId: string | null;
  onToggle: (subjectId: string) => void;
}

const MatiereFilterWrapper = ({
  subjects,
  selectedId,
  onToggle,
}: MatiereFilterWrapperProps) => {
  const [query, setQuery] = useState("");
  const tokens = searchTokens(query);
  const visible = subjects.filter((subject) => {
    const name = searchTokens(subject.name).join(" ");
    return tokens.every((token) => name.includes(token));
  });

  return (
    <div>
      <div className="mb-6 flex items-center rounded-lg border border-gray-400 px-3 py-2">
        <FiSearch />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Recherche une matière"
          className="ml-4 w-full min-w-0 flex-1 outline-none"
        />
      </div>
      <div>
        {visible.length === 0 ? (
          <p className="text-text-paragraph mb-4 text-sm">
            Aucune matière ne correspond.
          </p>
        ) : (
          visible.map((subject) => (
            <MatiereCard
              key={subject.id}
              label={subject.name}
              checked={selectedId === subject.id}
              onChange={() => onToggle(subject.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MatiereFilterWrapper;
