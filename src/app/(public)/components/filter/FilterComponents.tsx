import { FiX } from "react-icons/fi";
import { niveauMocks } from "../../constants/filter.constants";
import FiliereCard from "./filiere/FiliereCard";
import HideFilterComponent from "./HideFilterComponent";
import MatiereFilterWrapper from "./matiere/MatiereFilterWrapper";
import NiveauCard from "./niveau/NiveauCard";

const FilterComponents = () => {
  return (
    <>
      <div className="py-2">
        <div className="mx-auto mb-8 h-1 w-1/10 rounded-full bg-gray-500"></div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4">
          <div>
            <div className="text-text-secondary mb-4 flex items-center gap-2 font-semibold">
              <h3 className="text-xl">Filtres</h3>
              <span className="rounded-full bg-[#0f2155]/10 px-4 py-2">0</span>
            </div>
            <button className="text-text-primary h-2 w-2 rounded-full p-1">
              <FiX size={22} />
            </button>
          </div>
          <p>120 résultats disponibles</p>
        </div>
        <hr className="my-4 w-full text-gray-300" />
        <div className="px-4">
          <HideFilterComponent label="Niveau">
            <div className="flex gap-2">
              {niveauMocks.map((niveau) => (
                <NiveauCard key={niveau.niveau} />
              ))}
            </div>
          </HideFilterComponent>
          <HideFilterComponent label="Filière">
            <div>
              {niveauMocks.map((niveau) => (
                <FiliereCard key={niveau.niveau} />
              ))}
            </div>
          </HideFilterComponent>
          <HideFilterComponent label="Matière">
            <MatiereFilterWrapper />
          </HideFilterComponent>
          <HideFilterComponent label="Année académique">
            <p>Année académique</p>
          </HideFilterComponent>
          <HideFilterComponent label="Type d'évaluation">
            <p>Type d&apos;évaluation</p>
          </HideFilterComponent>
          <HideFilterComponent label="Session">
            <p>Session</p>
          </HideFilterComponent>
          <HideFilterComponent label="Date d'ajout">
            <p>Date d&apos;ajout</p>
          </HideFilterComponent>
        </div>
      </div>
    </>
  );
};

export default FilterComponents;
