import React, { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Slider = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<null | HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const move = 16 + container.clientWidth;
    container.scrollBy({
      left: direction === "left" ? -move : move,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mx-auto max-w-7xl">
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-x-hidden py-4"
        ref={containerRef}
      >
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
