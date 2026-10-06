# Épreuves ESGIS

Plateforme web de consultation et de téléchargement des épreuves d'examens et devoirs de l'ESGIS, avec un espace de gestion pour le BDE et l'administration.

Stack : Next.js (App Router), React, TypeScript, Tailwind CSS. Base de données et authentification via Supabase, stockage des PDF sur Cloudflare R2, hébergement sur Vercel.

## Prérequis

- Node.js 22 ou plus (la version de référence est dans `.nvmrc`)
- pnpm, activé via Corepack : `corepack enable pnpm` (la version exacte est fixée par `packageManager` dans `package.json`)

## Démarrage

```bash
pnpm install
pnpm dev
```

L'application tourne sur http://localhost:3000. `pnpm install` active aussi les hooks Git (voir plus bas).

## Scripts

| Commande            | Rôle                                      |
| ------------------- | ----------------------------------------- |
| `pnpm dev`          | Serveur de développement                  |
| `pnpm build`        | Build de production                       |
| `pnpm start`        | Lance le build de production              |
| `pnpm lint`         | ESLint, sans aucun warning toléré         |
| `pnpm typecheck`    | Génération des types de routes puis `tsc` |
| `pnpm test`         | Tests unitaires (Vitest)                  |
| `pnpm format`       | Formate le code avec Prettier             |
| `pnpm format:check` | Vérifie le formatage sans modifier        |

## Structure

```
src/app/   routes et layouts (App Router)
public/    fichiers statiques
```

Les autres dossiers (`src/components`, `src/lib`, `scripts`) sont créés avec le premier code qui en a besoin.

## Conventions de travail

- Aucun commit direct sur `main` : une branche par ticket, nommée `type/numéro-sujet` (ex. `feat/9-recherche-filtres`), puis une Pull Request.
- Commits au format [Conventional Commits](https://www.conventionalcommits.org/fr) (`feat(search): ...`, `fix(upload): ...`), vérifié par commitlint.
- Pas de relecture obligatoire des PR : une PR se merge une fois la CI verte, en rebase pour garder un historique linéaire.
- Hooks Git installés automatiquement : à chaque commit, lint et formatage des fichiers modifiés, détection de secrets avec [gitleaks](https://github.com/gitleaks/gitleaks) si l'outil est installé en local, et contrôle du message de commit.

## Intégration continue

Le workflow `.github/workflows/ci.yml` s'exécute sur chaque Pull Request et sur `main` :

1. `quality` : formatage, lint, typecheck, tests, build.
2. `security` : recherche de secrets dans l'historique (gitleaks) et audit des dépendances de production.

Les actions sont épinglées par SHA et le `GITHUB_TOKEN` est limité à la lecture. Dependabot propose chaque semaine les mises à jour des dépendances npm et des actions.

## Déploiement

Le déploiement est assuré par Vercel. Vérifier le résultat de la CI et du build Vercel avant de merger.
