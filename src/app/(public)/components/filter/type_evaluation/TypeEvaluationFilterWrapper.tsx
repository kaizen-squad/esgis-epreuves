import { useState } from "react";

const type_evaluation = [
  { name: "Tous", count: 10 },
  { name: "Examen", count: 4 },
  { name: "Devoir", count: 6 },
];

const TypeEvaluationFilterWrapper = () => {
  const [currentTypeEvaluation, setCurrentTypeEvaluation] = useState("Tous");
  return (
    <div className="bg-background-default flex rounded p-1">
      {type_evaluation.map((type_evaluation) => (
        <div
          onClick={() => setCurrentTypeEvaluation(type_evaluation.name)}
          key={type_evaluation.name}
          className={`flex min-w-0 flex-1 cursor-pointer flex-col rounded p-1 text-center ${currentTypeEvaluation == type_evaluation.name ? "bg-background-accent text-text-primary" : ""}`}
        >
          <span className="w-full truncate text-sm">
            {type_evaluation.name}
          </span>
          <span>{type_evaluation.count}</span>
        </div>
      ))}
    </div>
  );
};

export default TypeEvaluationFilterWrapper;
