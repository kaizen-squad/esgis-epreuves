export type Field = {
  id: string;
  name: string;
  description: string | null;
};

export type Level = {
  id: string;
  name: string;
};

export type Subject = {
  id: string;
  name: string;
  fieldId: string;
  levelId: string;
};
