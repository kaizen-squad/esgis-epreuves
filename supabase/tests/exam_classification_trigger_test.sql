-- #197 : le classement d'une epreuve (field_id/level_id/option_id) est deduit de subject_id par
-- le trigger exams_set_classification, jamais confie a ce qu'envoie le client.
begin;
select plan(5);

insert into auth.users (id) values ('11111111-1111-4111-8111-111111111111');
insert into public.profiles (id, email, role, full_name) values
  ('11111111-1111-4111-8111-111111111111', 'bde@esgis.test', 'BDE', 'BDE Trigger Test');

insert into public.fields (id, name) values
  ('33333333-3333-4333-8333-333333333333', 'Filiere Trigger Test A'),
  ('33333333-3333-4333-8333-333333333334', 'Filiere Trigger Test B');
insert into public.levels (id, name) values
  ('44444444-4444-4444-8444-444444444444', 'Niveau Trigger Test');
insert into public.options (id, field_id, name) values
  ('66666666-6666-4666-8666-666666666666', '33333333-3333-4333-8333-333333333333', 'Option Trigger Test');

-- Matiere avec option, rattachee a la filiere A.
insert into public.subjects (id, field_id, level_id, option_id, name) values
  ('55555555-5555-4555-8555-555555555555', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-444444444444', '66666666-6666-4666-8666-666666666666', 'Matiere avec option');
-- Matiere sans option (tronc commun), rattachee a la filiere B.
insert into public.subjects (id, field_id, level_id, option_id, name) values
  ('77777777-7777-4777-8777-777777777777', '33333333-3333-4333-8333-333333333334', '44444444-4444-4444-8444-444444444444', null, 'Matiere sans option');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true);

-- Le client envoie volontairement un classement incoherent (mauvaise filiere/niveau, option
-- d'une autre filiere) : le trigger doit l'ecraser avec celui de la matiere choisie.
insert into public.exams (
  title, slug, academic_year, session, exam_type,
  subject_id, level_id, field_id, option_id,
  file_hash, file_mime_type, file_size, r2_key, created_by
) values (
  'Epreuve avec option', 'epreuve-avec-option-2024-2025',
  '2024-2025', 'Session Normale', 'Contrôle Terminal',
  '55555555-5555-4555-8555-555555555555',
  '00000000-0000-4000-8000-000000000000', '33333333-3333-4333-8333-333333333334', null,
  repeat('a', 64), 'application/pdf', 1024, 'exams/epreuve-avec-option-2024-2025.pdf',
  '11111111-1111-4111-8111-111111111111'
);

select results_eq(
  $$ select field_id, level_id, option_id from public.exams where slug = 'epreuve-avec-option-2024-2025' $$,
  $$ values ('33333333-3333-4333-8333-333333333333'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, '66666666-6666-4666-8666-666666666666'::uuid) $$,
  'le trigger deduit field_id/level_id/option_id de la matiere, en ignorant ceux envoyes'
);

insert into public.exams (
  title, slug, academic_year, session, exam_type,
  subject_id, level_id, field_id, option_id,
  file_hash, file_mime_type, file_size, r2_key, created_by
) values (
  'Epreuve sans option', 'epreuve-sans-option-2024-2025',
  '2024-2025', 'Session Normale', 'Contrôle Terminal',
  '77777777-7777-4777-8777-777777777777',
  '44444444-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333334', '66666666-6666-4666-8666-666666666666',
  repeat('b', 64), 'application/pdf', 1024, 'exams/epreuve-sans-option-2024-2025.pdf',
  '11111111-1111-4111-8111-111111111111'
);

select is(
  (select option_id from public.exams where slug = 'epreuve-sans-option-2024-2025'),
  null,
  'une matiere de tronc commun efface l''option envoyee, meme non nulle'
);

select throws_ok(
  $$
  insert into public.exams (
    title, slug, academic_year, session, exam_type,
    subject_id,
    file_hash, file_mime_type, file_size, r2_key, created_by
  ) values (
    'Epreuve matiere inconnue', 'epreuve-matiere-inconnue-2024-2025',
    '2024-2025', 'Session Normale', 'Contrôle Terminal',
    '99999999-9999-4999-8999-999999999999',
    repeat('c', 64), 'application/pdf', 1024, 'exams/epreuve-matiere-inconnue-2024-2025.pdf',
    '11111111-1111-4111-8111-111111111111'
  )
  $$,
  'P0001',
  'subject_id inconnu : 99999999-9999-4999-8999-999999999999',
  'une matiere inconnue leve une exception explicite plutot que d''inserer un classement incoherent'
);

-- Un UPDATE qui change la matiere rededuit aussi le classement (pas seulement a l'INSERT).
update public.exams
  set subject_id = '77777777-7777-4777-8777-777777777777'
  where slug = 'epreuve-avec-option-2024-2025';

select results_eq(
  $$ select field_id, level_id, option_id from public.exams where slug = 'epreuve-avec-option-2024-2025' $$,
  $$ values ('33333333-3333-4333-8333-333333333334'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, null::uuid) $$,
  'un changement de matiere a la modification rededuit aussi le classement'
);

reset role;
select is(
  (select count(*) from public.exams where created_by = '11111111-1111-4111-8111-111111111111')::int, 2,
  'seules les 2 insertions reussies de ce test sont en base (la matiere inconnue a ete rejetee)'
);

select * from finish();
rollback;
