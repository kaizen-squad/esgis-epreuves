begin;
select plan(17);

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
  ('11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222');

insert into public.profiles (id, email, role) values
  ('11111111-1111-1111-1111-111111111111', 'bde@esgis.test', 'BDE'),
  ('22222222-2222-2222-2222-222222222222', 'admin@esgis.test', 'ADMIN');

insert into public.fields (id, name) values ('33333333-3333-3333-3333-333333333333', 'Gestion');
insert into public.levels (id, name) values ('44444444-4444-4444-4444-444444444444', 'L1');
insert into public.subjects (id, field_id, level_id, name) values
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Comptabilite');

-- Lecture publique (role anon, sans session)
set local role anon;
select is(
  (select count(*) from public.fields)::int, 1,
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
reset role;

-- BDE authentifie : peut ecrire les epreuves, pas les referentiels
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select lives_ok(
  $$
  insert into public.exams (
    title, slug, academic_year, session, exam_type,
    subject_id, level_id, field_id,
    file_hash, file_mime_type, file_size, r2_key, created_by
  ) values (
    'Comptabilite generale', 'comptabilite-generale-2024-2025',
    '2024-2025', 'Session Normale', 'Contrôle Terminal',
    '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333',
    repeat('a', 64), 'application/pdf', 1024, 'exams/comptabilite-generale-2024-2025.pdf',
    '11111111-1111-1111-1111-111111111111'
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
  $$ insert into public.profiles (id, email, role) values ('66666666-6666-6666-6666-666666666666', 'x@esgis.test', 'BDE') $$,
  '42501',
  null,
  'BDE ne peut pas ecrire profiles'
);

-- ADMIN authentifie : peut ecrire les referentiels et profiles, pas les epreuves
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

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
    '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333',
    repeat('b', 64), 'application/pdf', 1024, 'exams/autre-epreuve-2024-2025.pdf',
    '22222222-2222-2222-2222-222222222222'
  )
  $$,
  '42501',
  null,
  'ADMIN ne peut pas deposer une epreuve'
);

select is(
  (select count(*) from public.exams)::int, 1,
  'un seul exam cree, celui du BDE'
);

-- Un BDE ne peut pas falsifier l'attribution d'une epreuve a un autre compte
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

insert into public.exams (
  title, slug, academic_year, session, exam_type,
  subject_id, level_id, field_id,
  file_hash, file_mime_type, file_size, r2_key, created_by
) values (
  'Epreuve falsifiee', 'epreuve-falsifiee-2024-2025',
  '2024-2025', 'Session Normale', 'Contrôle Terminal',
  '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333',
  repeat('c', 64), 'application/pdf', 1024, 'exams/epreuve-falsifiee-2024-2025.pdf',
  '22222222-2222-2222-2222-222222222222'
);

select is(
  (select created_by from public.exams where slug = 'epreuve-falsifiee-2024-2025'),
  '11111111-1111-1111-1111-111111111111'::uuid,
  'created_by est force a auth.uid(), pas a la valeur envoyee par le client'
);

select * from finish();
rollback;
