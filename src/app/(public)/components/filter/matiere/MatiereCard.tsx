import React from "react";

const MatiereCard = () => {
  return (
    <div className="mb-4">
      <label className="flex items-center justify-between gap-4">
        <input
          type="checkbox"
          name="filiere"
          className="checked:accent-background-accent size-5 shrink-0"
        />
        <span className="min-w-0 flex-1 text-sm">
          Informatique Réseaux et Télécommunications
        </span>
        <span>36</span>
      </label>
    </div>
  );
};

export default MatiereCard;
