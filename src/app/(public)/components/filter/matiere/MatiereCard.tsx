import React from "react";

const MatiereCard = () => {
  return (
    <div className="mb-4">
      <label htmlFor="filiere" className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            id="filiere"
            name="filiere"
            className="checked:accent-background-accent aspect-square w-5"
          />
          <p className="w-9/10">Informatique Réseaux et Télécommunications</p>
        </div>
        <span>36</span>
      </label>
    </div>
  );
};

export default MatiereCard;
