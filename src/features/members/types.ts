export type UserRole = "BDE" | "ADMIN";

/** Compte BDE tel qu'affiche dans le tableau de bord Admin. */
export type BdeMember = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
};

/** Compte BDE en edition : nom et prenoms separes, tels que saisis a la creation. */
export type BdeMemberDetail = BdeMember & {
  lastName: string;
  firstNames: string;
};

export type BdeMemberPage = {
  members: BdeMember[];
  /** Nombre de membres correspondant a la recherche (toutes pages confondues). */
  total: number;
  page: number;
  pageCount: number;
};
