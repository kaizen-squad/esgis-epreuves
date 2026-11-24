begin;
select plan(40);

-- Tables et RLS forcee
select has_table('public', 'profiles', 'profiles existe');
select has_table('public', 'levels', 'levels existe');
select has_table('public', 'fields', 'fields existe');
select has_table('public', 'options', 'options existe');
select has_table('public', 'subjects', 'subjects existe');
select has_table('public', 'exams', 'exams existe');

select ok(
  (select bool_and(relrowsecurity and relforcerowsecurity)
   from pg_class
   where relname in ('profiles', 'levels', 'fields', 'options', 'subjects', 'exams')
     and relnamespace = 'public'::regnamespace),
  'RLS activee et forcee sur les 6 tables'
);

-- Fixtures : un compte BDE, un compte ADMIN, un referentiel minimal
insert into auth.users (id) values
  ('11111111-1111-4111-8111-111111111111'),
  ('22222222-2222-4222-8222-222222222222');

insert into public.profiles (id, email, role, full_name) values
  ('11111111-1111-4111-8111-111111111111', 'bde@esgis.test', 'BDE', 'BDE RLS Test'),
  ('22222222-2222-4222-8222-222222222222', 'admin@esgis.test', 'ADMIN', 'Admin RLS Test');

insert into public.fields (id, name) values ('33333333-3333-4333-8333-333333333333', 'Filiere RLS Test');
insert into public.levels (id, name) values ('44444444-4444-4444-8444-444444444444', 'Niveau RLS Test');
insert into public.subjects (id, field_id, level_id, name) values
  ('55555555-5555-4555-8555-555555555555', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444', 'Matiere RLS Test');

-- Lecture publique (role anon, sans session)
set local role anon;
select is(
  (select count(*) from public.fields where name = 'Filiere RLS Test')::int, 1,
  'anon lit les referentiels publics'
);
select throws_ok(
  $$ insert into public.fields (name) values ('IRT') $$,
  '42501',
  null,
  'anon ne peut pas ecrire les referentiels'
);
select is(
  (select count(*) from public.profiles)::int, 0,
  'anon ne voit aucun profil (pas de politique de lecture)'
);
-- has_function_privilege plutot que throws_ok + appel reel : invoquer une fonction a colonnes
-- (RETURNS TABLE) sans le droit EXECUTE fait planter ce Postgres local (segfault observe,
-- CLI 2.95.4) quand throws_ok intercepte l'erreur de permission via sa propre savepoint.
select is(
  has_function_privilege('anon', 'public.current_profile_status()', 'execute'),
  false,
  'anon ne peut pas appeler current_profile_status (#164)'
);
select is(
  has_function_privilege('anon', 'public.profile_display_name(uuid)', 'execute'),
  false,
  'anon ne peut pas appeler profile_display_name (#176)'
);
reset role;

-- BDE authentifie : peut ecrire les epreuves, pas les referentiels
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$
  insert into public.exams (
    title, slug, academic_year, session, exam_type,
    subject_id, level_id, field_id,
    file_hash, file_mime_type, file_size, r2_key, created_by
  ) values (
    'Comptabilite generale', 'comptabilite-generale-2024-2025',
    '2024-2025', 'Session Normale', 'Contrôle Terminal',
    '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333',
    repeat('a', 64), 'application/pdf', 1024, 'exams/comptabilite-generale-2024-2025.pdf',
    '11111111-1111-4111-8111-111111111111'
  )
  $$,
  'BDE peut deposer une epreuve'
);

select throws_ok(
  $$ insert into public.fields (name) values ('IRT') $$,
  '42501',
  null,
  'BDE ne peut pas ecrire les referentiels'
);

select throws_ok(
  $$ insert into public.profiles (id, email, role) values ('66666666-6666-4666-8666-666666666666', 'x@esgis.test', 'BDE') $$,
  '42501',
  null,
  'BDE ne peut pas ecrire profiles'
);

-- current_profile_status (#164) : un compte voit son propre role et statut, jamais celui d'un
-- autre (profiles reste autrement illisible pour un BDE, voir plus haut).
select results_eq(
  $$ select role, is_active from public.current_profile_status() $$,
  $$ values ('BDE'::text, true) $$,
  'current_profile_status renvoie le role et le statut du compte BDE connecte'
);

-- profile_display_name (#176) : un BDE actif peut lire le nom d'un collegue (profiles reste
-- autrement illisible, voir plus haut), jamais plus (email, role).
select results_eq(
  $$ select public.profile_display_name('22222222-2222-4222-8222-222222222222') $$,
  $$ values ('Admin RLS Test'::text) $$,
  'profile_display_name renvoie le nom d''un autre profil pour un BDE actif'
);

-- ADMIN authentifie : peut ecrire les referentiels et profiles, pas les epreuves
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);

select results_eq(
  $$ select role, is_active from public.current_profile_status() $$,
  $$ values ('ADMIN'::text, true) $$,
  'current_profile_status renvoie le role et le statut du compte ADMIN connecte'
);

select lives_ok(
  $$ insert into public.fields (name) values ('IRT') $$,
  'ADMIN peut ecrire les referentiels'
);

select throws_ok(
  $$
  insert into public.exams (
    title, slug, academic_year, session, exam_type,
    subject_id, level_id, field_id,
    file_hash, file_mime_type, file_size, r2_key, created_by
  ) values (
    'Autre epreuve', 'autre-epreuve-2024-2025',
    '2024-2025', 'Session Normale', 'Contrôle Terminal',
    '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333',
    repeat('b', 64), 'application/pdf', 1024, 'exams/autre-epreuve-2024-2025.pdf',
    '22222222-2222-4222-8222-222222222222'
  )
  $$,
  '42501',
  null,
  'ADMIN ne peut pas deposer une epreuve'
);

select is(
  (select count(*) from public.exams where field_id = '33333333-3333-4333-8333-333333333333')::int, 1,
  'un seul exam cree, celui du BDE'
);

-- Un BDE ne peut pas falsifier l'attribution d'une epreuve a un autre compte
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

insert into public.exams (
  title, slug, academic_year, session, exam_type,
  subject_id, level_id, field_id,
  file_hash, file_mime_type, file_size, r2_key, created_by
) values (
  'Epreuve falsifiee', 'epreuve-falsifiee-2024-2025',
  '2024-2025', 'Session Normale', 'Contrôle Terminal',
  '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333',
  repeat('c', 64), 'application/pdf', 1024, 'exams/epreuve-falsifiee-2024-2025.pdf',
  '22222222-2222-4222-8222-222222222222'
);

select is(
  (select created_by from public.exams where slug = 'epreuve-falsifiee-2024-2025'),
  '11111111-1111-4111-8111-111111111111'::uuid,
  'created_by est force a auth.uid(), pas a la valeur envoyee par le client'
);

-- #94 : private.set_updated_at et private.set_exam_created_by ont desormais un search_path fixe,
-- comme private.has_role (advisor Supabase function_search_path_mutable). Comme pour has_role,
-- le schema private n'est pas expose a authenticated : appel en proprietaire.
reset role;
select is(
  (select proconfig from pg_proc where oid = 'private.set_updated_at()'::regprocedure),
  array['search_path=""'],
  'set_updated_at a un search_path fixe'
);
select is(
  (select proconfig from pg_proc where oid = 'private.set_exam_created_by()'::regprocedure),
  array['search_path=""'],
  'set_exam_created_by a un search_path fixe'
);
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

-- set_updated_at fonctionne toujours : now() dans le trigger resout bien pg_catalog.now() malgre
-- `set search_path = ''` (pg_catalog est cherche en premier, meme absent du search_path).
-- updated_at est fige dans le passe hors trigger (reset role, pas de politique RLS a contourner),
-- puisque now() est constant pour toute la transaction du test : sans ce repere, le trigger
-- pourrait ne rien faire et le test passerait quand meme.
reset role;
update public.exams set updated_at = '2000-01-01'
where slug = 'comptabilite-generale-2024-2025';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$ update public.exams set title = 'Comptabilite generale (revisee)'
     where slug = 'comptabilite-generale-2024-2025' $$,
  'le trigger set_updated_at (search_path fixe) ne leve pas d''erreur'
);

select is(
  (select updated_at from public.exams where slug = 'comptabilite-generale-2024-2025'),
  now(),
  'set_updated_at remet bien updated_at a now(), malgre le search_path fixe'
);

-- Un BDE desactive perd tout droit d'ecriture, meme avec une session encore valide
reset role;
update public.profiles set is_active = false where id = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

select throws_ok(
  $$
  insert into public.exams (
    title, slug, academic_year, session, exam_type,
    subject_id, level_id, field_id,
    file_hash, file_mime_type, file_size, r2_key, created_by
  ) values (
    'Epreuve apres desactivation', 'epreuve-apres-desactivation-2024-2025',
    '2024-2025', 'Session Normale', 'Contrôle Terminal',
    '55555555-5555-4555-8555-555555555555', '44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333',
    repeat('d', 64), 'application/pdf', 1024, 'exams/epreuve-apres-desactivation-2024-2025.pdf',
    '11111111-1111-4111-8111-111111111111'
  )
  $$,
  '42501',
  null,
  'BDE desactive ne peut plus deposer une epreuve'
);

-- Le schema private n'est pas expose a authenticated : appel en proprietaire, meme JWT simule.
reset role;
select is(
  (select private.has_role('BDE')), false,
  'has_role renvoie false pour un compte desactive'
);
set local role authenticated;

select results_eq(
  $$ select role, is_active from public.current_profile_status() $$,
  $$ values ('BDE'::text, false) $$,
  'current_profile_status detecte un compte BDE desactive en cours de session (#164)'
);

with modifiees as (
  update public.exams set title = 'Titre pirate'
  where slug = 'comptabilite-generale-2024-2025'
  returning 1
)
select is(
  (select count(*) from modifiees)::int, 0,
  'BDE desactive ne peut plus modifier une epreuve'
);

-- profile_display_name (#176) : un jeton de session encore valide pour un compte desactive ne
-- doit pas pouvoir resoudre le nom de qui que ce soit (meme fenetre que les autres ecritures).
select is(
  (select public.profile_display_name('22222222-2222-4222-8222-222222222222')),
  null,
  'profile_display_name renvoie null pour un compte desactive'
);

-- Reglages du site (numero WhatsApp du BDE) : une seule ligne, lue par tous, modifiee par le BDE.
reset role;
update public.profiles set is_active = true where id = '11111111-1111-4111-8111-111111111111';

select has_table('public', 'site_settings', 'site_settings existe');
select ok(
  (select relrowsecurity and relforcerowsecurity from pg_class
   where relname = 'site_settings' and relnamespace = 'public'::regnamespace),
  'RLS activee et forcee sur site_settings'
);

set local role anon;
select is(
  (select count(*) from public.site_settings)::int, 1,
  'anon lit l''unique ligne des reglages'
);
with modifiees as (
  update public.site_settings set bde_whatsapp_number = '+22900000000'
  returning 1
)
select is(
  (select count(*) from modifiees)::int, 0,
  'anon ne peut pas modifier les reglages'
);
select throws_ok(
  $$ insert into public.site_settings (id, bde_whatsapp_number) values (false, '+22900000000') $$,
  '42501',
  null,
  'anon ne peut pas inserer de reglages'
);
reset role;

-- ADMIN authentifie : le numero appartient au BDE, pas a l'administration.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}', true);
with modifiees as (
  update public.site_settings set bde_whatsapp_number = '+22900000000'
  returning 1
)
select is(
  (select count(*) from modifiees)::int, 0,
  'ADMIN ne peut pas modifier les reglages'
);

-- BDE authentifie : peut renseigner le numero.
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);
with modifiees as (
  update public.site_settings set bde_whatsapp_number = '+2290123456789'
  returning bde_whatsapp_number
)
select is(
  (select bde_whatsapp_number from modifiees), '+2290123456789',
  'BDE peut renseigner le numero WhatsApp'
);
select throws_ok(
  $$ update public.site_settings set bde_whatsapp_number = '0123 45' $$,
  '23514',
  null,
  'un numero hors format international est refuse par la base'
);

-- BDE desactive : ne peut plus toucher aux reglages non plus (meme garde que sur public.exams).
reset role;
update public.profiles set is_active = false where id = '11111111-1111-4111-8111-111111111111';
set local role authenticated;
with modifiees as (
  update public.site_settings set bde_whatsapp_number = '+2290198765432'
  returning 1
)
select is(
  (select count(*) from modifiees)::int, 0,
  'BDE desactive ne peut plus modifier les reglages'
);

select * from finish();
rollback;
