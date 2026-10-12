import FiliereCard from "../../components/FiliereCard";
import { filiereMocks } from "../../constants/filieres.constants";

const Filieres = () => {
  return (
    <div className="w-full">
      <h3 className="text-text-secondary mb-1 text-center text-2xl font-semibold">
        Selectionnez votre <br />
        filière
      </h3>
      <div className="grid grid-cols-1 grid-rows-3 gap-4 md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3">
        {filiereMocks.map((filiere) => (
          <FiliereCard
            data={filiere}
            key={filiere.id}
            className={`${filiere.id > 3 && filiere.id <= 6 ? "hidden md:block" : "block"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Filieres;
