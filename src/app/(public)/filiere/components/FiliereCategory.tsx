import FiliereCard from "../../components/FiliereCard";
import { filiereMocks } from "../../constants/filieres.constants";

interface FiliereCategoryProps {
  title: string;
}

const FiliereCategory = ({ title }: FiliereCategoryProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-text-secondary text-3xl font-semibold">{title}</h3>
      <div className="grid w-full grid-cols-1 gap-4 py-0 md:grid-cols-2 lg:grid-cols-3">
        {filiereMocks.map((filiere) => (
          <FiliereCard data={filiere} key={filiere.id} />
        ))}
      </div>
    </div>
  );
};

export default FiliereCategory;
