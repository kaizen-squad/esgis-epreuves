-- Donnees de developpement uniquement (jamais executees en production, voir db reset).
-- Les referentiels (niveaux, filieres, options, matieres) sont desormais les vrais, poses par la
-- migration `..._real_referentials_irt_gestion.sql` (#195) : ce fichier ne genere plus que des
-- epreuves factices sur ces matieres reelles, pointant vers 1-2 PDF d'exemple du bucket dev, pour
-- ne pas bloquer le front avant la collecte reelle (#23).

-- Compte sans mot de passe : sert uniquement d'attribution pour created_by, pas a se connecter
-- (l'auth BDE/Admin reelle arrive avec #15). aud/role et les colonnes token sont renseignees
-- explicitement, GoTrue n'aime pas les lire a NULL (Studio, listUsers).
insert into auth.users (
  id, aud, role, email,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, reauthentication_token
) values (
  '00000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'bde-dev@esgis.test',
  '', '', '', '',
  '', ''
);

insert into public.profiles (id, email, full_name, role) values
  ('00000000-0000-4000-8000-000000000001', 'bde-dev@esgis.test', 'Compte BDE de developpement', 'BDE');

-- created_by est force par trigger a auth.uid() : il faut simuler la session du compte BDE de dev
-- avant l'insertion des epreuves ci-dessous.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000001"}', false);

-- Numero stable par matiere, pour deriver des epreuves factices variees sans recalculer
-- row_number() plusieurs fois (meme fenetre repetee, mais illisible et fragile aux retouches).
-- L'option (#197) vient directement de `subjects.option_id`, plus d'une table a part a tenir
-- alignee a la main. exam_type calcule a part : un Controle Continu n'a jamais de session (#196),
-- la session en depend.
with numbered_subjects as (
  select s.*, l.name as level_name, f.name as field_name,
         row_number() over (order by s.id) as n
  from public.subjects s
  join public.levels l on l.id = s.level_id
  join public.fields f on f.id = s.field_id
),
typed_subjects as (
  select ns.*,
    case when (ns.n / 2) % 2 = 0 then 'Contrôle Terminal' else 'Contrôle Continu' end as exam_type
  from numbered_subjects ns
),
sessioned_subjects as (
  select ts.*,
    case when ts.exam_type = 'Contrôle Continu' then null
      when ts.n % 2 = 0 then 'Session Normale' else 'Rattrapage'
    end as session
  from typed_subjects ts
)
-- Epreuves factices : une par matiere ci-dessus, combinaisons session/type/annee decorrelees
-- (periodes 2/4/3 sur n) pour couvrir plusieurs croisements de filtres, toutes pointant vers
-- 1 des 2 PDF d'exemple du bucket dev (objets a deposer manuellement sur R2, hors seed SQL).
-- Une annee academique sur 7 est volontairement laissee inconnue (#196), pour exercer l'affichage
-- "Inconnue" en dev sans fausser les autres croisements de filtres.
-- `field_id`/`level_id`/`option_id` ne sont plus fournis : le trigger `exams_set_classification`
-- (#197) les deduit de `subject_id`. Titre au meme format que `examTitle()` (#198/#206, "Matiere :
-- Rattrapage" pour un rattrapage, sinon "Matiere : Type[, session]"), jamais la matiere seule : le
-- seed doit refleter ce que l'application ecrit reellement, sinon un bug de format ne serait
-- jamais visible en local.
insert into public.exams (
  title, slug, academic_year, session, exam_type,
  subject_id,
  file_hash, file_mime_type, file_size, r2_key
)
select
  ts.name ||
    (case
      when ts.session = 'Rattrapage' then ' : Rattrapage'
      when ts.exam_type = 'Contrôle Continu' then ' : Contrôle continu'
      when ts.session = 'Session Normale' then ' : Contrôle terminal, session normale'
      else ' : Contrôle terminal'
    end),
  lower(ts.level_name) || '-' || (case when ts.field_name = 'Gestion' then 'gestion' else 'irt' end)
    || '-' || ts.n,
  case when ts.n % 7 = 0 then null
    else case (ts.n % 3) when 0 then '2022-2023' when 1 then '2023-2024' else '2024-2025' end
  end,
  ts.session,
  ts.exam_type,
  ts.id,
  lpad(ts.n::text, 64, '0'),
  'application/pdf',
  524288,
  case when ts.n % 2 = 0 then 'dev/exemple-1.pdf' else 'dev/exemple-2.pdf' end
from sessioned_subjects ts;
