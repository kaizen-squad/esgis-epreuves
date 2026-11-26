export type Field = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export type Level = {
  id: string;
  name: string;
  isActive: boolean;
};

export type Subject = {
  id: string;
  name: string;
  fieldId: string;
  levelId: string;
  /** Option a laquelle la matiere est rattachee (#197), `null` pour le tronc commun. */
  optionId: string | null;
  isActive: boolean;
};

export type Option = {
  id: string;
  name: string;
  fieldId: string;
  isActive: boolean;
};
