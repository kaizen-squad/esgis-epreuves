/**
 * Comptes et donnees de reference des trois parcours E2E (#114), partages entre `scripts/seed-e2e.ts`
 * (creation) et les specs Playwright (connexion).
 */
export const E2E_PASSWORD = "mot-de-passe-e2e-114!";

export const e2eBde = {
  email: "e2e-bde@esgis.test",
  password: E2E_PASSWORD,
  fullName: "BDE E2E",
  role: "BDE" as const,
  isActive: true,
};

export const e2eAdmin = {
  email: "e2e-admin@esgis.test",
  password: E2E_PASSWORD,
  fullName: "Admin E2E",
  role: "ADMIN" as const,
  isActive: true,
};

/** Desactive au depart : le parcours admin l'active puis le desactive, dans cet ordre (#114). */
export const e2eMember = {
  email: "e2e-membre@esgis.test",
  password: E2E_PASSWORD,
  fullName: "Membre E2E",
  role: "BDE" as const,
  isActive: false,
};

export const E2E_USERS = [e2eBde, e2eAdmin, e2eMember];

/** Matiere du seed de dev (`supabase/seed.sql`), titre sans chevauchement avec une autre matiere. */
export const SEARCHABLE_EXAM_TITLE = "Fiscalité";

/** Matiere du seed de dev pour le formulaire d'ajout (#114, parcours BDE). */
export const ADD_EXAM_SUBJECT = "Routage IP";
