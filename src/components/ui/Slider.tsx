import React, { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Slider = (children: React.ReactNode) => {
  const containerRef = useRef<null | HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollBy({
      left:
        direction === "left" ? -container.clientWidth : container.clientWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div className="flex snap-x overflow-x-hidden" ref={containerRef}>
        {children}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="bg-background-primary rounded border border-gray-300 p-2"
          onClick={() => scroll("left")}
        >
          <FiChevronLeft />
        </button>
        <button
          className="bg-background-primary rounded border border-gray-300 p-2"
          onClick={() => scroll("right")}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Slider;
