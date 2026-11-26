begin;
select plan(17);

-- Referentiels de base : 5 niveaux (M1/M2 sans matiere, programme pas encore fourni, #195), 2 filieres
select is((select count(*) from public.levels)::int, 5, '5 niveaux (L1 a M2)');
select is((select count(*) from public.fields)::int, 2, '2 filieres (Gestion, IRT)');

-- Options de specialisation : une pour Gestion (CCA), trois pour IRT (AL, SI, SRC, #195)
select is(
  (select count(*) from public.options o join public.fields f on f.id = o.field_id where f.name = 'Gestion')::int,
  1,
  '1 option sous Gestion (CCA)'
);
select is(
  (select count(*) from public.options o join public.fields f on f.id = o.field_id where f.name = 'Informatique, Réseaux et Télécommunications')::int,
  3,
  '3 options sous IRT (AL, SI, SRC)'
);

-- Matieres : le vrai programme IRT/Gestion de L1 a L3 (#195), rien encore en M1/M2
select ok(
  (select count(*) from public.subjects) >= 100,
  'au moins 100 matieres reelles seedees (programmes IRT + Gestion, L1 a L3)'
);
select is(
  (select count(distinct level_id) from public.subjects)::int, 3,
  'seuls L1, L2 et L3 ont des matieres (M1/M2 hors perimetre de #195)'
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
  not exists (
    select 1 from public.exams e join public.levels l on l.id = e.level_id
    where l.name = 'L1' and e.option_id is not null
  ),
  'aucune epreuve factice de L1 (tronc commun) n''a d''option'
);
select ok(
  exists (
    select 1 from public.exams e join public.levels l on l.id = e.level_id
    where l.name = 'L2' and e.option_id is not null
  ),
  'au moins une epreuve factice de L2 a une option (programme IRT/Gestion reel, option des le S4, #195)'
);
select ok(
  not exists (
    select 1 from public.exams e
    join public.options o on o.id = e.option_id
    where o.field_id <> e.field_id
  ),
  'l''option d''une epreuve factice appartient toujours a sa filiere'
);

-- #196 : annee academique et session facultatives, Controle Continu jamais de session.
select ok(
  not exists (
    select 1 from public.exams where exam_type = 'Contrôle Continu' and session is not null
  ),
  'aucune epreuve factice de type Controle Continu n''a de session'
);
select ok(
  exists (select 1 from public.exams where academic_year is null),
  'au moins une epreuve factice a une annee academique inconnue (#196)'
);
select throws_ok(
  $$
  update public.exams set session = 'Session Normale'
  where id = (select id from public.exams where exam_type = 'Contrôle Continu' limit 1)
  $$,
  '23514',
  null,
  'la contrainte exams_cc_never_has_session bloque une session sur un Controle Continu'
);

-- #198 : sigle de filiere en base, remplace la table en dur de fieldLabel.ts, et search_text le
-- reprend (une recherche sur "IRT" doit trouver une epreuve sans l'avoir dans son titre genere).
select is(
  (select short_name from public.fields where name = 'Informatique, Réseaux et Télécommunications'),
  'IRT',
  'le sigle IRT est renseigne pour la filiere IRT'
);
select ok(
  (select count(*) from public.exams_catalog where search_text ilike '%irt%') > 0,
  'search_text contient le sigle de filiere (#198), pas seulement le nom complet'
);
select ok(
  not exists (select 1 from public.exams where title not like '%:%'),
  'chaque titre genere suit le format "Matière : Type[, session]"'
);

select * from finish();
rollback;
