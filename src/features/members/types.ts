export type UserRole = "BDE" | "ADMIN";

/** Compte BDE tel qu'affiche dans la page Membres de l'Admin. */
export type BdeMember = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  /** `false` : compte desactive, connexion bloquee et plus aucun droit d'ecriture. */
  isActive: boolean;
  /** Nombre d'epreuves versees par ce membre (#166), pour decider une desactivation en connaissance de cause. */
  examCount: number;
  /** Date du dernier depot, `null` si aucun. */
  lastDepositAt: string | null;
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
