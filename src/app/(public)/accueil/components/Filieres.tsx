import { FiArrowRight } from "react-icons/fi";
import FiliereCard from "../../components/FiliereCard";
import { filiereMocks } from "../../constants/filieres.constants";

const Filieres = () => {
  return (
    <div className="mb-30 w-full">
      <h3 className="text-text-secondary mb-1 text-center text-2xl font-semibold">
        Selectionnez votre <br />
        filière
      </h3>
      <div className="mb-6 grid grid-cols-1 grid-rows-3 gap-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3">
        {filiereMocks.map((filiere) => (
          <FiliereCard
            data={filiere}
            key={filiere.id}
            className={`${filiere.id > 3 && filiere.id <= 6 ? "hidden md:block" : "block"}`}
          />
        ))}
      </div>

      <button className="border-background-secondary text-text-primary bg-background-accent ml-auto flex items-center gap-2 rounded-lg border px-3 py-2 font-semibold">
        Voir toutes les filières <FiArrowRight />
      </button>
    </div>
  );
};

export default Filieres;
