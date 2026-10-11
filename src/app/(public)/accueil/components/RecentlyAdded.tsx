"use client";

import Slider from "@/components/ui/Slider";
import EpreuveCard from "../../components/EpreuveCard";
import { epreuvesMock } from "../../constants/epreuve_constants";

const RecentlyAdded = () => {
  return (
    <div className="mb-16 px-6">
      <h3 className="text-text-secondary mb-1 text-3xl font-semibold">
        Récemment ajoutées...
      </h3>
      <Slider>
        {epreuvesMock.map((epreuve) => (
          <div
            key={epreuve.name}
            className="relative w-full shrink-0 snap-start md:w-[calc((100%-2rem)/3)]"
          >
            <EpreuveCard {...epreuve} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default RecentlyAdded;
