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
          <div
            key={epreuve.name}
            className="bg-background-primary relative w-full shrink-0 snap-start rounded-lg p-3 md:w-[calc((100%-2rem)/3)]"
          >
            <EpreuveCard {...epreuve} key={epreuve.name} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default RecentlyAdded;
