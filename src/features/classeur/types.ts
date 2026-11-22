export type FavoriteSnapshot = {
  slug: string;
  title: string;
  field: string;
  subject: string;
  academicYear: string;
  savedAt: string;
};

export type PinnedField = {
  id: string;
  name: string;
};

export type ClasseurState = {
  version: 1;
  favorites: Record<string, FavoriteSnapshot>;
  pinnedField: PinnedField | null;
  lastVisits: Record<string, string>;
};
