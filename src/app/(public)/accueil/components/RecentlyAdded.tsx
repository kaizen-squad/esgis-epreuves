"use client";

import Slider from "@/components/ui/Slider";
import EpreuveCard from "../../components/EpreuveCard";
import { epreuvesMock } from "../../constants/epreuve_constants";

const RecentlyAdded = () => {
  return (
    <div className="mb-12 px-10">
      <h3 className="text-text-secondary mb-1 text-3xl font-semibold">
        Récemment ajoutées...
      </h3>
      <Slider>
        {epreuvesMock.map((epreuve) => (
          <EpreuveCard {...epreuve} key={epreuve.name} />
        ))}
      </Slider>
    </div>
  );
};

export default RecentlyAdded;
