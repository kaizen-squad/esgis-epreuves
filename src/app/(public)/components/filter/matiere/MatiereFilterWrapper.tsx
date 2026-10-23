import { matiereMock } from "@/app/(public)/constants/filter.constants";
import React from "react";
import { FiSearch } from "react-icons/fi";
import MatiereCard from "./MatiereCard";

const MatiereFilterWrapper = () => {
  return (
    <div>
      <div className="mb-6 flex items-center rounded-lg border border-gray-400 px-3 py-2">
        <FiSearch />
        <input
          type="text"
          placeholder="Recherche une matière"
          className="ml-4 w-full min-w-0 flex-1 outline-none"
        />
      </div>
      <div>
        {matiereMock.map((matiere) => (
          <MatiereCard key={matiere.niveau} />
        ))}
      </div>
    </div>
  );
};

export default MatiereFilterWrapper;
