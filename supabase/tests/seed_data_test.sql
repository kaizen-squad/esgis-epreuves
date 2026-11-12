begin;
select plan(9);

-- Referentiels de base : 5 niveaux, 2 filieres
select is((select count(*) from public.levels)::int, 5, '5 niveaux (L1 a M2)');
select is((select count(*) from public.fields)::int, 2, '2 filieres (Gestion, IRT)');

-- Options de specialisation : une pour Gestion, deux pour IRT
select is(
  (select count(*) from public.options o join public.fields f on f.id = o.field_id where f.name = 'Gestion')::int,
  1,
  '1 option sous Gestion (CCA)'
);
select is(
  (select count(*) from public.options o join public.fields f on f.id = o.field_id where f.name = 'Informatique, Réseaux et Télécommunications')::int,
  2,
  '2 options sous IRT (AL, SRS)'
);

-- Matieres : au moins une par niveau et par filiere
select ok(
  (select count(*) from public.subjects) >= 10,
  'au moins 10 matieres seedees'
);
select is(
  (select count(distinct level_id) from public.subjects)::int, 5,
  'les 5 niveaux ont au moins une matiere'
);

-- Epreuves factices de dev : une vingtaine, pointant vers 1 ou 2 PDF d'exemple
select ok(
  (select count(*) from public.exams) >= 20,
  'au moins 20 epreuves factices'
);
select ok(
  (select count(distinct r2_key) from public.exams) <= 2,
  'les epreuves factices pointent vers 1 ou 2 PDF d''exemple au plus'
);
select ok(
  (select bool_and(file_mime_type = 'application/pdf') from public.exams),
  'toutes les epreuves factices sont des PDF'
);

select * from finish();
rollback;
