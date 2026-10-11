"use client";

import { useState } from "react";
import { epreuvesMock } from "../../constants/epreuve_constants";
import EpreuveCard from "../../components/EpreuveCard";
import { FiArrowRight } from "react-icons/fi";

const activityDomain = [
  "Informatique, Réseaux et Télécommunications",
  "Gestion",
];

const DomainFilter = () => {
  const [currentDomain, setCurrentDomain] = useState("Toutes");
  return (
    <div className="w-full px-4">
      <h3 className="text-text-secondary mb-8 text-center text-3xl font-semibold">
        Filtrez par domaine d&apos;activité
      </h3>

      <div className="mb-4 flex w-full max-w-full gap-4 overflow-x-auto md:mx-auto md:w-fit">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {epreuvesMock.map((epreuve) => (
          <div key={epreuve.name} className="">
            <EpreuveCard {...epreuve} />
          </div>
        ))}
      </div>

      <button className="bg-background-accent text-text-primary my-2 ml-auto flex items-center gap-2 rounded-lg px-3 py-2 font-semibold">
        Voir le catalogue <FiArrowRight />
      </button>
    </div>
  );
};

export default DomainFilter;
