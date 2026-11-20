"use client";

import ExamCard from "@/components/exams/ExamCard";
import { epreuvesMock } from "@/app/(public)/constants/epreuve.constants";
import Slider from "@/components/ui/Slider";

const AddedExams = ({ title }: { title: string }) => {
  return (
    <div className="mx-auto mb-16 max-w-7xl">
      <h3 className="section-title">{title}</h3>
      <Slider>
        {epreuvesMock.map((epreuve) => (
          <div
            key={epreuve.name}
            className="relative w-full shrink-0 snap-start md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
          >
            <ExamCard {...epreuve} manageable />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AddedExams;
