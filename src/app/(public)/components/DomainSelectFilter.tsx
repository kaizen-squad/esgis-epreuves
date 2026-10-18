import React from "react";
import { activityDomain } from "../constants/domain.constants";
import { useDomainStore } from "../store/domain.store";

const DomainSelectFilter = () => {
  const { currentDomain, setDomain } = useDomainStore();
  return (
    <div className="my-10 flex w-full max-w-full gap-4 overflow-x-auto md:mx-auto md:w-fit">
      {["Toutes", ...activityDomain].map((domain) => {
        return (
          <button
            onClick={() => setDomain(domain)}
            className={`rounded-full border border-gray-400 px-3 py-2 whitespace-nowrap ${currentDomain === domain ? "bg-background-accent text-text-primary" : ""}`}
            key={domain}
          >
            {domain}
          </button>
        );
      })}
    </div>
  );
};

export default DomainSelectFilter;
