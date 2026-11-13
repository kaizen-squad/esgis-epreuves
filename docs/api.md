# API backend

Documentation du contrat entre le backend (`src/features/*/queries.ts`, `actions.ts`, `schemas.ts`) et les écrans. Les signatures sont déjà visibles au survol dans l'éditeur : ce fichier documente les décisions de contrat, pas la mécanique. À tenir à jour à chaque ticket qui modifie un export de `queries.ts`/`actions.ts`/`schemas.ts` (critère de fin, voir #65).

## Conventions

- **`ActionResult<T>`** (`src/lib/action-result.ts`) : forme de retour unique pour toute Server Action (mutation), jamais pour une lecture. `{ ok: true, data }` en succès ; `{ ok: false, error, fieldErrors? }` en échec, avec `fieldErrors` optionnel pour une erreur de validation par champ ; une troisième forme `{ ok: false, error, duplicate }` signale un doublon détecté plutôt qu'une erreur bloquante. Construites via `actionOk`, `actionError`, `actionDuplicateWarning`, jamais à la main.
- **Lecture vs mutation** : les fonctions de `queries.ts` sont de simples fonctions async qui lèvent une exception sur erreur Supabase, jamais d'`ActionResult`. Une absence de ressource se traduit par `null`, à charge de la page d'appeler `notFound()` ; une vraie erreur Supabase remonte telle quelle et retombe sur `error.tsx` (à créer côté front, absent pour l'instant : en attendant, c'est la page d'erreur par défaut de Next.js qui s'affiche).
- **Tolérance des filtres invalides** : tout schéma Zod de filtres (ex. `examFiltersSchema`) retombe sur une valeur par défaut via `.catch()` plutôt que de lever sur un paramètre d'URL vide ou mal formé. Jamais de 500 pour un filtre invalide, même absurde ou de mauvais type.

## `src/lib/action-result.ts`

### `ActionResult<T>`, `actionOk`, `actionError`, `actionDuplicateWarning`

Import `import { actionOk, actionError, actionDuplicateWarning } from "@/lib/action-result"` depuis une Server Action, jamais depuis une lecture. `data` est typé par le générique `T` propre à l'action. Côté écran : `ok === true` affiche `data` ; `ok === false` avec `fieldErrors` répartit les messages sous les champs du formulaire concernés ; `ok === false` avec `duplicate` affiche un avertissement de doublon (lien vers `duplicate.slug`) plutôt qu'une erreur bloquante. Aucune Server Action n'existe encore sur ce dépôt (mutations à partir de #15/#18) : ce contrat est posé en amont pour que le front s'aligne dès #54.

## `src/features/referentials/queries.ts`

### `getFields(): Promise<Field[]>`

Import `import { getFields } from "@/features/referentials/queries"`. Aucun paramètre, retourne `Field[]` (`id`, `name`, `description`), trié par nom. Pas de pagination (référentiel court). Erreur Supabase : exception, à laisser remonter vers `error.tsx`.

### `getFieldById(id: string): Promise<Field | null>`

Prend un `id` (uuid attendu). Retourne `null` si `id` n'est pas un uuid valide (évite un 500 Postgres `22P02`) ou si la filière n'existe pas : dans les deux cas, la page appelle `notFound()`, jamais une erreur affichée. `description` peut être `null` (pas encore collectée) : l'écran doit gérer son absence sans supposer qu'elle est toujours renseignée.

### `getLevels(): Promise<Level[]>`

Aucun paramètre, retourne `Level[]` (`id`, `name`) trié par nom, pour les filtres du catalogue.

### `getSubjects(): Promise<Subject[]>`

Aucun paramètre, retourne `Subject[]` (`id`, `name`, `fieldId`, `levelId`) trié par nom. Pas de filtrage côté requête : à combiner côté écran avec `fieldId`/`levelId` choisis par l'utilisateur.

## `src/features/exams/schemas.ts`

### `searchTokens(term: string | undefined): string[]`

Découpe un terme de recherche en mots normalisés (NFD, accents retirés, minuscule, ligatures œ/æ/ß repliées à la main) pour correspondre à `search_text` tel que calculé en base par la vue `exams_catalog`. Plusieurs mots filtrent en ET (un `ilike` par mot côté requête) : l'ordre des mots n'importe pas. Retourne `[]` si `term` est vide ou absent. Ne pas simplifier la normalisation sans vérifier qu'elle reste alignée avec l'extension `unaccent` côté Postgres.

### `examFiltersSchema`

Schéma Zod de validation de `ExamFilters` (voir conventions : chaque champ invalide retombe sur `undefined`/une valeur par défaut via `.catch()`, jamais d'exception). `page` et `pageSize` sont convertis en nombre puis bornés (`pageSize` entre 1 et 50, défaut 20). `academicYear` doit respecter le format `AAAA-AAAA`, sinon ignoré plutôt que rejeté. `search` au-delà de 100 caractères est ignoré en entier (retombe sur `undefined`) : l'écran affiche alors un résultat non filtré, sans erreur.

### `ExamFiltersParsed`

Type de sortie de `examFiltersSchema` (`z.output<typeof examFiltersSchema>`), après validation : `search` devient un `string[]` de mots (plus une `string` brute), `page` et `pageSize` sont toujours renseignés. Aucun export ne l'utilise encore à ce jour.

### `fixedFieldFilters(fieldId: string, rawFilters?: ExamFilters): ExamFilters`

Force `fieldId` dans les filtres fournis, en priorité sur tout `fieldId` qu'ils contiendraient déjà. Appelé en interne par `getFieldExams` ; la page filière n'a pas à l'appeler elle-même.

## `src/features/exams/queries.ts`

### `getExams(rawFilters: ExamFilters): Promise<ExamListResult>`

Point d'entrée unique du catalogue (recherche, filtres combinables, pagination). `rawFilters` est validé par `examFiltersSchema` (voir conventions : jamais de 500 sur un filtre mal formé). Retourne `ExamListResult` (`exams`, `total`, `page`, `pageSize`). Si la page demandée dépasse le total après filtrage (erreur PostgREST `PGRST103`), se rappelle elle-même sur la page 1 plutôt que de propager l'erreur : l'écran ne doit jamais recevoir cette erreur-là pour une page hors bornes, et doit afficher le `page` du résultat (1 dans ce cas), pas celui de l'URL.

### `getRecentExams(limit?: number): Promise<Exam[]>`

Appelle `getExams` avec juste une limite (8 par défaut), pour l'accueil. `limit` est borné comme `pageSize` (1 à 50) : hors bornes ou non entier, il retombe sur 20. Même comportement et mêmes garanties que `getExams`, pas de logique propre.

### `getFieldExams(fieldId: string, rawFilters?: ExamFilters): Promise<FieldExamsResult | null>`

Combine `getFieldById` et `getExams` pour la page filière. Retourne `null` si la filière n'existe pas (id invalide ou absent) : la page appelle `notFound()`. `fieldId` reçu dans `rawFilters` est toujours écrasé par le paramètre `fieldId` via `fixedFieldFilters`, jamais l'inverse.

### `getExamBySlug(slug: string): Promise<Exam | null>`

Lecture d'une épreuve par son slug, pour la page détail. Retourne `null` si absente : la page appelle `notFound()`. Toute autre erreur Supabase remonte en exception.
