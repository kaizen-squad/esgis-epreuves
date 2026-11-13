# API backend

Documentation du contrat entre le backend (`src/features/*/queries.ts`, `actions.ts`, `schemas.ts`) et les écrans. Les signatures sont déjà visibles au survol dans l'éditeur : ce fichier documente les décisions de contrat, pas la mécanique. À tenir à jour à chaque ticket qui modifie un export de `queries.ts`/`actions.ts`/`schemas.ts` (critère de fin, voir #65).

## Conventions

- **`ActionResult<T>`** (`src/lib/action-result.ts`) : forme de retour unique pour toute Server Action (mutation), jamais pour une lecture. `{ ok: true, data }` en succès ; `{ ok: false, error, fieldErrors? }` en échec, avec `fieldErrors` optionnel pour une erreur de validation par champ ; une troisième forme `{ ok: false, error, duplicate }` signale un doublon détecté plutôt qu'une erreur bloquante. Construites via `actionOk`, `actionError`, `actionDuplicateWarning`, jamais à la main.
- **Lecture vs mutation** : les fonctions de `queries.ts` sont de simples fonctions async qui lèvent une exception sur erreur Supabase, jamais d'`ActionResult`. Une absence de ressource se traduit par `null`, à charge de la page d'appeler `notFound()` ; une vraie erreur Supabase remonte telle quelle et retombe sur `error.tsx` (à créer côté front, absent pour l'instant : en attendant, c'est la page d'erreur par défaut de Next.js qui s'affiche).
- **Tolérance des filtres invalides** : tout schéma Zod de filtres (ex. `examFiltersSchema`) retombe sur une valeur par défaut via `.catch()` plutôt que de lever sur un paramètre d'URL vide ou mal formé. Jamais de 500 pour un filtre invalide, même absurde ou de mauvais type.

## `src/lib/action-result.ts`

### `ActionResult<T>`, `actionOk`, `actionError`, `actionDuplicateWarning`

Import `import { actionOk, actionError, actionDuplicateWarning } from "@/lib/action-result"` depuis une Server Action, jamais depuis une lecture. `data` est typé par le générique `T` propre à l'action. Côté écran : `ok === true` affiche `data` ; `ok === false` avec `fieldErrors` répartit les messages sous les champs du formulaire concernés ; `ok === false` avec `duplicate` affiche un avertissement de doublon (lien vers `duplicate.slug`) plutôt qu'une erreur bloquante.

## `src/features/auth/schemas.ts`

### `loginSchema`

Schéma Zod de `{ email, password }` pour la connexion. `email` doit être un email bien formé ; `password` doit juste être non vide (la force du mot de passe est imposée par Supabase Auth à la création du compte, pas revalidée ici).

## `src/features/auth/actions.ts`

### `login(prevState: ActionResult<void> | null, formData: FormData): Promise<ActionResult<void>>`

Server Action de connexion BDE/Admin. Signature `(prevState, formData)` : à brancher avec `useActionState` côté écran (#17), seul moyen d'afficher l'erreur sous le formulaire sans recharger la page ; `prevState` n'est pas lu par l'action elle-même. Lit `email`/`password` du `FormData`, valide via `loginSchema`, puis `supabase.auth.signInWithPassword`. En cas de succès, redirige elle-même vers `/admin` (jamais d'`ActionResult` de succès à gérer côté écran). En cas d'échec, message générique ("Email ou mot de passe incorrect.") que l'identifiant soit inconnu ou le mot de passe faux, pour ne jamais confirmer l'existence d'un compte ; un 429 (limitation de débit Supabase Auth) renvoie un message distinct sans ambiguïté sur un compte. Pas d'inscription publique (#15) : les seuls comptes existants sont BDE/Admin, créés à la main. **Dépendance de prod à ne pas oublier (#26)** : `enable_signup = false` n'est posé que dans `supabase/config.toml` (stack locale) ; sur le projet Supabase hébergé, l'inscription publique reste ouverte tant qu'elle n'est pas coupée dans le dashboard (ou `supabase config push`).

### `logout(): Promise<never>`

Déconnecte uniquement la session courante (`scope: "local"`, jamais `"global"`) puis redirige vers `/login`, même si `signOut` échoue côté Supabase. Scope local : un compte BDE est partagé par toute l'équipe, une déconnexion sur un poste ne doit pas affecter les autres postes connectés avec le même compte.

## `src/proxy.ts`

### `proxy(request: NextRequest)`

Proxy racine (renommé ainsi depuis `middleware.ts` en Next.js 16, `config.matcher` limite son exécution à `/admin/:path*`). Redirige vers `/login` si la session Supabase est absente ou expirée. Confort uniquement : ne vérifie aucun rôle, puisque l'inscription publique est coupée, toute session valide appartient forcément à un compte BDE/Admin. La RLS (`private.has_role`, migration de #5) reste le seul vrai verrou pour chaque écriture.

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

### `slugify(title: string): string`

Convertit un titre en slug ascii (accents retirés, minuscule, espaces et ponctuation en tirets), suffixé d'un identifiant aléatoire de 8 caractères. Le suffixe garantit l'unicité sans requête préalable : deux dépôts du même titre produisent deux slugs distincts, jamais de collision à gérer côté appelant.

### `examUploadSchema`

Schéma Zod du dépôt d'une épreuve (`uploadExam`, #18) : `title`, `academicYear` (format `AAAA-AAAA`), `session`, `examType`, `fieldId`/`levelId`/`subjectId` (uuid requis), `optionId` (uuid optionnel), `file`. `file` doit être une instance de `File` non vide, de type MIME `application/pdf` et d'au plus 900 Ko (marge sous la limite par défaut de 1 Mo d'une Server Action Next.js). Contrairement à `examFiltersSchema`, ce schéma rejette (pas de `.catch()`) : un champ invalide doit bloquer l'envoi, jamais retomber sur une valeur par défaut silencieuse. Un fichier entre 900 Ko et ~1 Mo ne déclenche jamais le message de taille : Next refuse la requête avant d'exécuter l'action. L'écran doit donc aussi contrôler la taille côté client.

## `src/features/exams/queries.ts`

### `getExams(rawFilters: ExamFilters): Promise<ExamListResult>`

Point d'entrée unique du catalogue (recherche, filtres combinables, pagination). `rawFilters` est validé par `examFiltersSchema` (voir conventions : jamais de 500 sur un filtre mal formé). Retourne `ExamListResult` (`exams`, `total`, `page`, `pageSize`). Si la page demandée dépasse le total après filtrage (erreur PostgREST `PGRST103`), se rappelle elle-même sur la page 1 plutôt que de propager l'erreur : l'écran ne doit jamais recevoir cette erreur-là pour une page hors bornes, et doit afficher le `page` du résultat (1 dans ce cas), pas celui de l'URL.

### `getRecentExams(limit?: number): Promise<Exam[]>`

Appelle `getExams` avec juste une limite (8 par défaut), pour l'accueil. `limit` est borné comme `pageSize` (1 à 50) : hors bornes ou non entier, il retombe sur 20. Même comportement et mêmes garanties que `getExams`, pas de logique propre.

### `getFieldExams(fieldId: string, rawFilters?: ExamFilters): Promise<FieldExamsResult | null>`

Combine `getFieldById` et `getExams` pour la page filière. Retourne `null` si la filière n'existe pas (id invalide ou absent) : la page appelle `notFound()`. `fieldId` reçu dans `rawFilters` est toujours écrasé par le paramètre `fieldId` via `fixedFieldFilters`, jamais l'inverse.

### `getExamBySlug(slug: string): Promise<Exam | null>`

Lecture d'une épreuve par son slug, pour la page détail. Retourne `null` si absente : la page appelle `notFound()`. Toute autre erreur Supabase remonte en exception.

### `getExamR2Key(slug: string): Promise<string | null>`

Lit uniquement la clé R2 (`r2_key`) d'une épreuve par son slug, pour la route de prévisualisation/téléchargement (`/api/exams/[slug]`, #50). Retourne `null` si absente : la route répond alors `404`. Toute autre erreur Supabase remonte en exception.

## `src/features/exams/actions.ts`

### `uploadExam(formData: FormData): Promise<ActionResult<{ slug: string }>>`

Import `import { uploadExam } from "@/features/exams/actions"`. Dépôt d'une épreuve par le BDE (#18) : valide `formData` avec `examUploadSchema`, vérifie les octets de signature du fichier (`%PDF-`, le type MIME déclaré par le navigateur n'étant qu'une indication côté client) puis le hache (SHA-256) et vérifie ce hash contre `exams.file_hash`. Si le hash existe déjà, renvoie `{ ok: false, error, duplicate: { examId, slug, title } }` (voir conventions) sans aucun effet de bord. Sinon, insère l'épreuve (`slug` généré par `slugify(title)`, clé R2 `exams/<hash>.pdf`) puis dépose seulement ensuite le PDF sur R2. Ordre volontaire : l'insertion est la seule étape protégée par la RLS (`exams_write_bde`), donc la seule vraie vérification d'autorisation de l'action (aucune vérification de rôle dupliquée en JS) ; la faire passer avant R2 évite qu'une requête non autorisée (anonyme, ou authentifiée mais non-BDE) ne déclenche un dépôt R2 qui serait de toute façon rejeté ensuite par la base. Si le dépôt R2 échoue après l'insertion, la ligne est supprimée (jamais d'épreuve en base sans son fichier) et l'action renvoie une erreur générique. Toute erreur Supabase inattendue (lecture du hash, insertion hors doublon) est journalisée côté serveur (`console.error`) et renvoyée au client sous un message générique, jamais telle quelle. Détection de doublon limitée au hash exact pour l'instant ; #19 la remplacera par une détection par quadruplet (titre/matière/niveau/session) via une fonction partagée, aussi réutilisée par #55/#21/#56. Une violation d'unicité à l'insertion (course entre deux dépôts simultanés du même fichier, non éliminée par le contrôle préalable) retombe sur le même message de doublon générique, sans les métadonnées de l'épreuve existante. Signature `(formData)` sans `prevState` (contrairement à `login`) : utilisable en impératif (`startTransition`), pas directement avec `useActionState` ; à revoir avec le front si l'écran d'upload (#55) en a besoin.

## `src/lib/r2/presign.ts`

### `contentDisposition(download: boolean, filename: string): string`

Construit l'en-tête `Content-Disposition` : `inline` pour une prévisualisation, `attachment` pour un téléchargement. `filename` est toujours bâti côté appelant à partir du slug de l'épreuve (jamais du titre), qui ne contient aucun caractère à risque pour cet en-tête.

### `getPresignedExamUrl(r2Key: string, filename: string, download: boolean): Promise<string>`

Génère une URL R2 présignée (valide 5 minutes, usage immédiat par la redirection qui suit) pour le PDF à `r2Key`, avec `Content-Type` fixé à `application/pdf` et `Content-Disposition` selon `contentDisposition`. Le bucket R2 reste privé : c'est la seule façon d'accéder au fichier.

## `src/lib/r2/upload.ts`

### `putExamFile(r2Key: string, body: Buffer): Promise<void>`

Dépose un PDF sur R2 sous la clé fournie par l'appelant (`uploadExam`, #18, qui la calcule à partir du hash du fichier), avec `Content-Type` fixé à `application/pdf`. Ne vérifie rien (taille, type) : ces contrôles sont déjà faits par `examUploadSchema` avant l'appel.

## `src/app/api/exams/[slug]/route.ts`

### `GET /api/exams/[slug]`

Route publique (épreuves lisibles sans authentification, comme le catalogue) qui redirige (307) vers une URL R2 présignée. `?dl=1` pour un téléchargement (pièce jointe) ; sans ce paramètre, prévisualisation en ligne. Répond `404` si le slug ne correspond à aucune épreuve.
