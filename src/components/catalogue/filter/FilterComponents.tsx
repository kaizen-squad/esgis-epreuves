import { useId } from "react";
import { FiX } from "react-icons/fi";
import type { CatalogueFilterOptions } from "@/components/exams/catalogueFilters";
import type { CatalogueFilters } from "@/components/exams/useCatalogueFilters";
import { optionDisplayName } from "@/components/fields/fieldLabel";
import FiliereCard from "@/components/catalogue/filter/filiere/FiliereCard";
import HideFilterComponent from "@/components/catalogue/filter/HideFilterComponent";
import MatiereFilterWrapper from "@/components/catalogue/filter/matiere/MatiereFilterWrapper";
import NiveauCard from "@/components/catalogue/filter/niveau/NiveauCard";
import TypeEvaluationFilterWrapper from "@/components/catalogue/filter/type_evaluation/TypeEvaluationFilterWrapper";
import SessionFilterWrapper from "@/components/catalogue/filter/session/SessionFilterWrapper";

interface FilterComponentsProps {
  onClose?: () => void;
  options: CatalogueFilterOptions;
  filters: CatalogueFilters;
  total: number;
}

const FilterComponents = ({
  onClose,
  options,
  filters,
  total,
}: FilterComponentsProps) => {
  // Desktop et mobile sont montes en meme temps (l'aside reste dans le DOM, juste masque) : un
  // `name` de groupe unique par instance evite que les radios des deux se desynchronisent.
  const groupId = useId();
  const fieldId = filters.get("fieldId");
  const levelId = filters.get("levelId");
  const optionId = filters.get("optionId");
  const isContinuousControl = filters.get("examType") === "Contrôle Continu";
  // Options reellement presentes pour la combinaison filiere + niveau choisie (deduites des
  // matieres) : une filiere a des options mais ses niveaux de tronc commun (ex. L1 IRT) n'en ont
  // aucune, le filtre ne doit alors pas s'afficher pour rien (retour utilisateur, #201).
  const optionIdsInScope = new Set(
    options.subjects
      .filter(
        (subject) =>
          (!fieldId || subject.fieldId === fieldId) &&
          (!levelId || subject.levelId === levelId),
      )
      .map((subject) => subject.optionId)
      .filter((id): id is string => id !== null),
  );
  const availableOptions = options.options.filter(
    (option) =>
      (!fieldId || option.fieldId === fieldId) &&
      optionIdsInScope.has(option.id),
  );
  // Matieres restreintes a la filiere, au niveau et a l'option choisis, s'il y en a. Une option
  // active n'affiche jamais les matieres du tronc commun (decision du 2026-11-26, #201).
  const subjects = options.subjects.filter(
    (subject) =>
      (!fieldId || subject.fieldId === fieldId) &&
      (!levelId || subject.levelId === levelId) &&
      (!optionId || subject.optionId === optionId),
  );

  return (
    <>
      <div className="py-2">
        <div className="mx-auto mb-8 h-1 w-1/10 rounded-full bg-gray-500 lg:hidden"></div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4">
          <div className="flex items-center justify-between">
            <h3 className="text-text-secondary mb-4 text-xl font-semibold">
              Filtres
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer les filtres"
              className="text-text-primary bg-background-accent mb-4 cursor-pointer rounded-full p-1"
            >
              <FiX size={22} />
            </button>
          </div>
          <p>
            {total} résultat{total > 1 ? "s" : ""} disponible
            {total > 1 ? "s" : ""}
          </p>
        </div>
        <hr className="my-4 w-full text-gray-300" />
        <div className="px-4">
          <HideFilterComponent label="Niveau" defaultOpen>
            {/* Retour a la ligne plutot qu'un scroll horizontal (meme traitement qu'"Annee
                academique" plus bas) : peu d'options, pas besoin de scroll ni de son affordance. */}
            <div className="flex flex-wrap gap-2">
              {options.levels.map((level) => (
                <NiveauCard
                  key={level.id}
                  label={level.name}
                  active={levelId === level.id}
                  onClick={() => filters.toggle("levelId", level.id)}
                />
              ))}
            </div>
          </HideFilterComponent>
          {options.fields && (
            <HideFilterComponent label="Filière" defaultOpen>
              <div>
                {options.fields.map((field) => (
                  <FiliereCard
                    key={field.id}
                    name={`filiere-${groupId}`}
                    label={field.name}
                    checked={fieldId === field.id}
                    onChange={() => filters.toggle("fieldId", field.id)}
                  />
                ))}
              </div>
            </HideFilterComponent>
          )}
          {availableOptions.length > 0 && (
            <HideFilterComponent label="Option">
              <div className="flex flex-wrap gap-2">
                {availableOptions.map((option) => (
                  <NiveauCard
                    key={option.id}
                    label={optionDisplayName(option.name)}
                    active={optionId === option.id}
                    onClick={() => filters.toggle("optionId", option.id)}
                  />
                ))}
              </div>
            </HideFilterComponent>
          )}
          <HideFilterComponent label="Matière">
            <MatiereFilterWrapper
              name={`matiere-${groupId}`}
              subjects={subjects}
              selectedId={filters.get("subjectId")}
              onToggle={(subjectId) => filters.toggle("subjectId", subjectId)}
              examCounts={options.examCountsBySubjectId}
            />
          </HideFilterComponent>
          <HideFilterComponent label="Année académique">
            <div className="flex flex-wrap gap-2">
              {options.academicYears.map((year) => (
                <NiveauCard
                  key={year}
                  label={year}
                  active={filters.get("academicYear") === year}
                  onClick={() => filters.toggle("academicYear", year)}
                />
              ))}
            </div>
          </HideFilterComponent>
          <HideFilterComponent label="Type d'évaluation">
            <TypeEvaluationFilterWrapper
              current={filters.get("examType")}
              onChange={(value) => filters.set("examType", value)}
            />
          </HideFilterComponent>
          {isContinuousControl ? null : (
            <HideFilterComponent label="Session">
              <SessionFilterWrapper
                current={filters.get("session")}
                onChange={(value) => filters.set("session", value)}
              />
            </HideFilterComponent>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterComponents;
