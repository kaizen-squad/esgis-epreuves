import EpreuveCard from "../../components/EpreuveCard";
import { epreuvesMock } from "../../constants/epreuve_constants";

const RecentlyAdded = () => {
  return (
    <div className="px-4">
      <h3>Récemment ajoutées...</h3>
      <div>
        {epreuvesMock.map((epreuve) => (
          <EpreuveCard {...epreuve} key={epreuve.name} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyAdded;
