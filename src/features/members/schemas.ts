import { z } from "zod";

export const MEMBERS_PAGE_SIZE = 10;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;

const nameSchema = (label: string) =>
  z
    .string(`${label} est requis.`)
    .trim()
    .min(1, `${label} est requis.`)
    .max(80, `${label} est trop long (80 caractères maximum).`);

const passwordSchema = z
  .string("Le mot de passe est requis.")
  .min(
    MIN_PASSWORD_LENGTH,
    `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
  )
  .max(
    MAX_PASSWORD_LENGTH,
    `Le mot de passe est trop long (${MAX_PASSWORD_LENGTH} caractères maximum).`,
  );

const memberBaseSchema = z.object({
  lastName: nameSchema("Le nom"),
  firstNames: nameSchema("Le ou les prénoms"),
  email: z
    .string("L'email est requis.")
    .trim()
    .toLowerCase()
    .pipe(z.email("Email invalide.")),
});

/** Creation d'un compte BDE par l'Admin : toutes les informations sont obligatoires. */
export const memberCreateSchema = memberBaseSchema.extend({
  password: passwordSchema,
});

/** Modification : mot de passe vide = inchange. */
export const memberUpdateSchema = memberBaseSchema.extend({
  password: z.union([z.literal(""), passwordSchema]),
});

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
export type MemberFormField = keyof MemberCreateInput;

/** Nom complet stocke dans `profiles.full_name` : NOM en premier, comme sur une liste d'appel. */
export function toFullName(lastName: string, firstNames: string): string {
  return `${lastName.trim()} ${firstNames.trim()}`;
}

/**
 * Nettoie une recherche avant de l'inserer dans un filtre PostgREST `or(...)` : retire les
 * caracteres qui ont un sens dans cette syntaxe (virgule, parentheses) ou dans un motif `ilike`
 * (`%`, `_`, `*`, `\`).
 */
export function sanitizeMemberSearch(search: string): string {
  return search
    .replace(/[,()%_*\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/** Numero de page lu dans l'URL : entier >= 1, 1 sinon. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}
