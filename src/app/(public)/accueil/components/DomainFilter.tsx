"use client";

import { useState } from "react";

const activityDomain = [
  "Informatique, Réseaux et Télécommunications",
  "Gestion",
];

const DomainFilter = () => {
  const [currentDomain, setCurrentDomain] = useState("Toutes");
  return (
    <div className="px-4">
      <h3 className="text-text-secondary mb-4 text-center text-3xl font-semibold">
        Filtrez par domaine d&apos;activité
      </h3>

      <div className="flex gap-4 overflow-x-auto">
        {["Toutes", ...activityDomain].map((domain) => {
          return (
            <button
              onClick={() => setCurrentDomain(domain)}
              className={`rounded-full border border-gray-400 px-3 py-2 whitespace-nowrap ${currentDomain === domain ? "bg-background-accent text-text-primary" : ""}`}
              key={domain}
            >
              {domain}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DomainFilter;
