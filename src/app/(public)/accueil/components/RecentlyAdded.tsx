"use client";

import Slider from "@/components/ui/Slider";
import EpreuveCard from "../../components/EpreuveCard";
import { epreuvesMock } from "../../constants/epreuve.constants";

const RecentlyAdded = () => {
  return (
    <div className="mx-auto mb-16 max-w-7xl">
      <h3 className="text-text-secondary mb-1 text-3xl font-semibold">
        Récemment ajoutées...
      </h3>
      <Slider>
        {epreuvesMock.map((epreuve) => (
          <div
            key={epreuve.name}
            className="relative w-full shrink-0 snap-start md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
          >
            <EpreuveCard {...epreuve} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default RecentlyAdded;
