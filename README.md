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

## Variables d'environnement

Copier `.env.example` vers `.env.local` et renseigner les valeurs. `.env.local` n'est jamais versionné.

- En local, utiliser le projet Supabase `esgis-epreuves-dev` (organisation KAIZEN). L'URL et la clé publique se trouvent dans le tableau de bord Supabase, sous Project Settings puis API Keys.
- Le projet `esgis-epreuves` est la production : ne pas s'y connecter depuis une machine de développement.
- `SUPABASE_SECRET_KEY` donne un accès total à la base : serveur uniquement, jamais préfixée par `NEXT_PUBLIC_`, jamais dans un commit, un ticket ou un message.
- Le projet `dev` sera arrêté après la mise en production définitive (limite d'instances actives de l'offre gratuite).

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

## Architecture

Monolithe Next.js (App Router, Server Actions), découpé par fonctionnalité.

```
src/
  app/
    (public)/            pages étudiants : accueil, liste, détail d'une épreuve
    (admin)/admin/       espace BDE : login, gestion des épreuves
  features/
    exams/               components/, queries.ts, actions.ts, schemas.ts, types.ts
    auth/
    referentials/        filières, niveaux, matières
  components/ui/         composants génériques réutilisables
  lib/
    supabase/            clients navigateur, serveur, middleware
    r2/                  stockage des PDF
supabase/migrations/     SQL versionné
scripts/                 seed en masse (créé avec le ticket dédié)
public/                  fichiers statiques
```

Règles :

- Les pages (`src/app`) restent fines : elles composent des éléments de `features/` et n'ont pas de logique métier.
- L'accès aux données (Supabase, R2) se fait uniquement dans `queries.ts` et `actions.ts` d'une feature, jamais dans un composant.
- Les entrées utilisateur sont validées avec zod dans `schemas.ts`.
- Le `types.ts` d'une feature est le contrat entre les composants et les requêtes : à convenir avant de coder chaque côté.
- Les dossiers contenant un `.gitkeep` sont vides en attendant leur premier fichier : supprimer le `.gitkeep` au premier ajout.

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
