"use client";

import {
  EPREUVE_GRID_CLASSES,
  epreuvesMock,
} from "../../constants/epreuve.constants";
import EpreuveCard from "../../components/EpreuveCard";
import { FiArrowRight } from "react-icons/fi";
import DomainSelectFilter from "../../components/DomainSelectFilter";

const DomainFilter = () => {
  return (
    <div className="mb-30 w-full lg:px-30">
      <h3 className="text-text-secondary mb-8 text-center text-3xl font-semibold">
        Filtrez par domaine d&apos;activité
      </h3>

      <DomainSelectFilter />

      <div className={`${EPREUVE_GRID_CLASSES} mb-4 justify-center`}>
        {epreuvesMock.map((epreuve) => (
          <EpreuveCard {...epreuve} key={epreuve.name} />
        ))}
      </div>

      <button className="bg-background-accent text-text-primary my-2 ml-auto flex items-center gap-2 rounded-lg px-3 py-2 font-semibold">
        Voir le catalogue <FiArrowRight />
      </button>
    </div>
  );
};

export default DomainFilter;
