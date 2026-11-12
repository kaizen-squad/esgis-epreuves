-- Donnees de developpement uniquement (jamais executees en production, voir db reset).
-- Referentiels (niveaux, filieres, options, matieres) et une vingtaine d'epreuves factices
-- pointant vers 1-2 PDF d'exemple du bucket dev, pour ne pas bloquer le front avant la collecte reelle (#23).

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000001', 'bde-dev@esgis.test');

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

-- Epreuves factices : une par matiere ci-dessus, annee academique et session alternees,
-- toutes pointant vers 1 des 2 PDF d'exemple du bucket dev (objets a deposer manuellement sur R2, hors seed SQL).
-- created_by est force par trigger a auth.uid() : il faut simuler la session du compte BDE de dev.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001"}', false);

insert into public.exams (
  title, slug, academic_year, session, exam_type,
  subject_id, level_id, field_id, option_id,
  file_hash, file_mime_type, file_size, r2_key, created_by
)
select
  s.name,
  lower(l.name) || '-' || (case when f.name = 'Gestion' then 'gestion' else 'irt' end)
    || '-' || (row_number() over (order by s.id)) || '-2024-2025',
  '2024-2025',
  case when row_number() over (order by s.id) % 2 = 0 then 'Session Normale' else 'Rattrapage' end,
  case when row_number() over (order by s.id) % 2 = 0 then 'Contrôle Terminal' else 'Contrôle Continu' end,
  s.id,
  s.level_id,
  s.field_id,
  case
    when l.name <> 'L3' then null::uuid
    when f.name = 'Gestion' then '30000000-0000-0000-0000-000000000001'::uuid
    when row_number() over (order by s.id) % 2 = 0 then '30000000-0000-0000-0000-000000000002'::uuid
    else '30000000-0000-0000-0000-000000000003'::uuid
  end,
  lpad((row_number() over (order by s.id))::text, 64, '0'),
  'application/pdf',
  524288,
  case when row_number() over (order by s.id) % 2 = 0 then 'dev/exemple-1.pdf' else 'dev/exemple-2.pdf' end,
  '00000000-0000-0000-0000-000000000001'
from public.subjects s
join public.levels l on l.id = s.level_id
join public.fields f on f.id = s.field_id;
