"use client";

import React, { useEffect, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const AUTO_SCROLL_INTERVAL_MS = 5000;

const Slider = ({ children }: { children: React.ReactNode }) => {
  const containerRef = useRef<null | HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    const move = 16 + container.clientWidth;

    // Boucle : a la fin (ou au debut) on revient de l'autre cote plutot que de buter.
    const atEnd =
      container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
    const atStart = container.scrollLeft <= 0;
    if (direction === "right" && atEnd) {
      container.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction === "left" && atStart) {
      container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
      return;
    }

    container.scrollBy({
      left: direction === "left" ? -move : move,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const id = setInterval(() => {
      if (!isPausedRef.current) scroll("right");
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  const pause = () => {
    isPausedRef.current = true;
  };
  const resume = () => {
    isPausedRef.current = false;
  };

  return (
    <div
      className="relative mx-auto w-full"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      <div
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto py-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
        ref={containerRef}
      >
        {children}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Défiler vers la gauche"
          className="bg-background-primary touch-manipulation rounded border border-gray-300 p-3"
          onClick={() => scroll("left")}
        >
          <FiChevronLeft />
        </button>
        <button
          type="button"
          aria-label="Défiler vers la droite"
          className="bg-background-primary touch-manipulation rounded border border-gray-300 p-3"
          onClick={() => scroll("right")}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Slider;
