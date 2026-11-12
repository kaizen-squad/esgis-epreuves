-- Donnees de developpement uniquement (jamais executees en production, voir db reset).
-- Referentiels (niveaux, filieres, options, matieres) et une vingtaine d'epreuves factices
-- pointant vers 1-2 PDF d'exemple du bucket dev, pour ne pas bloquer le front avant la collecte reelle (#23).

-- Compte sans mot de passe : sert uniquement d'attribution pour created_by, pas a se connecter
-- (l'auth BDE/Admin reelle arrive avec #15). aud/role et les colonnes token sont renseignees
-- explicitement, GoTrue n'aime pas les lire a NULL (Studio, listUsers).
insert into auth.users (
  id, aud, role, email,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  email_change_token_current, reauthentication_token
) values (
  '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'bde-dev@esgis.test',
  '', '', '', '',
  '', ''
);

insert into public.profiles (id, email, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'bde-dev@esgis.test', 'Compte BDE de developpement', 'BDE');

insert into public.levels (id, name) values
  ('10000000-0000-0000-0000-000000000001', 'L1'),
  ('10000000-0000-0000-0000-000000000002', 'L2'),
  ('10000000-0000-0000-0000-000000000003', 'L3'),
  ('10000000-0000-0000-0000-000000000004', 'M1'),
  ('10000000-0000-0000-0000-000000000005', 'M2');

insert into public.fields (id, name) values
  ('20000000-0000-0000-0000-000000000001', 'Gestion'),
  ('20000000-0000-0000-0000-000000000002', 'Informatique, Réseaux et Télécommunications');

-- Options de specialisation, a partir du S5 (L3) : tronc commun en L1/L2 (option_id nul sur les epreuves correspondantes).
insert into public.options (id, field_id, name) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Comptabilité, Contrôle, Audit (CCA)'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Architecture Logicielle (AL)'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'Systèmes, Réseaux et Sécurité (SRS)');

-- Matieres : un echantillon representatif par niveau et par filiere (programme ESGIS), pas le catalogue complet.
insert into public.subjects (id, field_id, level_id, name) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Comptabilité Générale 1'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Introduction au Management'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Mathématiques Générales'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Microéconomie'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Analyse des États Financiers'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Bases de Données'),
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Comptabilité Analytique de Gestion 2'),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Fiscalité'),
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'Contrôle de Gestion'),
  ('4000000a-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Management Stratégique'),
  ('4000000a-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Audit et Gouvernance d''Entreprise'),
  ('40000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Algorithmique et Structures de Données'),
  ('40000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Langage C'),
  ('40000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Architecture des Ordinateurs'),
  ('40000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Développement Web Back-End'),
  ('40000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Administration des Bases de Données'),
  ('40000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Routage IP'),
  ('40000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Architectures Distribuées et Microservices'),
  ('40000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Sécurité des Réseaux et Pare-feu'),
  ('4000000a-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'DevOps et Intégration Continue'),
  ('4000000a-0000-0000-0000-000000000021', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'Cloud Computing et Virtualisation Avancée'),
  ('4000000a-0000-0000-0000-000000000022', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'Intelligence Artificielle Appliquée');

-- created_by est force par trigger a auth.uid() : il faut simuler la session du compte BDE de dev
-- avant l'insertion des epreuves ci-dessous.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);

-- Option de specialisation par matiere, a partir du S5 (L3, M1, M2) : tronc commun en L1/L2,
-- donc pas de ligne ici pour elles (left join -> option_id nul). CCA couvre tout Gestion a partir
-- du S5 (une seule option) ; AL/SRS sont assignes matiere par matiere pour IRT (jamais par hasard).
with subject_options (subject_id, option_id) as (
  values
    ('40000000-0000-0000-0000-000000000007'::uuid, '30000000-0000-0000-0000-000000000001'::uuid), -- Comptabilité Analytique de Gestion 2 -> CCA
    ('40000000-0000-0000-0000-000000000008'::uuid, '30000000-0000-0000-0000-000000000001'::uuid), -- Fiscalité -> CCA
    ('40000000-0000-0000-0000-000000000009'::uuid, '30000000-0000-0000-0000-000000000001'::uuid), -- Contrôle de Gestion -> CCA
    ('4000000a-0000-0000-0000-000000000010'::uuid, '30000000-0000-0000-0000-000000000001'::uuid), -- Management Stratégique -> CCA
    ('4000000a-0000-0000-0000-000000000011'::uuid, '30000000-0000-0000-0000-000000000001'::uuid), -- Audit et Gouvernance d'Entreprise -> CCA
    ('40000000-0000-0000-0000-000000000018'::uuid, '30000000-0000-0000-0000-000000000002'::uuid), -- Architectures Distribuées et Microservices -> AL
    ('40000000-0000-0000-0000-000000000019'::uuid, '30000000-0000-0000-0000-000000000003'::uuid), -- Sécurité des Réseaux et Pare-feu -> SRS
    ('4000000a-0000-0000-0000-000000000020'::uuid, '30000000-0000-0000-0000-000000000002'::uuid), -- DevOps et Intégration Continue -> AL
    ('4000000a-0000-0000-0000-000000000021'::uuid, '30000000-0000-0000-0000-000000000003'::uuid), -- Cloud Computing et Virtualisation Avancée -> SRS
    ('4000000a-0000-0000-0000-000000000022'::uuid, '30000000-0000-0000-0000-000000000002'::uuid)  -- Intelligence Artificielle Appliquée -> AL
),
-- Numero stable par matiere, pour deriver des epreuves factices variees sans recalculer
-- row_number() plusieurs fois (meme fenetre repetee, mais illisible et fragile aux retouches).
numbered_subjects as (
  select s.*, l.name as level_name, f.name as field_name,
         row_number() over (order by s.id) as n
  from public.subjects s
  join public.levels l on l.id = s.level_id
  join public.fields f on f.id = s.field_id
)
-- Epreuves factices : une par matiere ci-dessus, combinaisons session/type/annee decorrelees
-- (periodes 2/4/3 sur n) pour couvrir plusieurs croisements de filtres, toutes pointant vers
-- 1 des 2 PDF d'exemple du bucket dev (objets a deposer manuellement sur R2, hors seed SQL).
insert into public.exams (
  title, slug, academic_year, session, exam_type,
  subject_id, level_id, field_id, option_id,
  file_hash, file_mime_type, file_size, r2_key
)
select
  ns.name,
  lower(ns.level_name) || '-' || (case when ns.field_name = 'Gestion' then 'gestion' else 'irt' end)
    || '-' || ns.n,
  case (ns.n % 3) when 0 then '2022-2023' when 1 then '2023-2024' else '2024-2025' end,
  case when ns.n % 2 = 0 then 'Session Normale' else 'Rattrapage' end,
  case when (ns.n / 2) % 2 = 0 then 'Contrôle Terminal' else 'Contrôle Continu' end,
  ns.id,
  ns.level_id,
  ns.field_id,
  so.option_id,
  lpad(ns.n::text, 64, '0'),
  'application/pdf',
  524288,
  case when ns.n % 2 = 0 then 'dev/exemple-1.pdf' else 'dev/exemple-2.pdf' end
from numbered_subjects ns
left join subject_options so on so.subject_id = ns.id;
