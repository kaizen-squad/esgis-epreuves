import React, { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Slider = (children: React.ReactNode) => {
  const containerRef = useRef<null | HTMLDivElement>(null);

  return (
    <div className="relative">
      <div className="flex snap-x overflow-x-hidden">{children}</div>

      <div className="flex items-center gap-2">
        <button>
          <FiChevronLeft />
        </button>
        <button>
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Slider;
