export type PinnedField = {
  id: string;
  name: string;
};

export type ClasseurState = {
  version: 1;
  pinnedField: PinnedField | null;
};
