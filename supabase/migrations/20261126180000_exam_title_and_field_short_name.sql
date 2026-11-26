-- #198 : titre d'une epreuve genere depuis ses metadonnees, jamais saisi. Remplace la table en
-- dur de sigles de filiere (fieldLabel.ts) par une vraie colonne, modifiable depuis l'Admin.

alter table public.fields add column short_name text;

update public.fields set short_name = 'IRT'
  where name = 'Informatique, Réseaux et Télécommunications' and short_name is null;

-- search_text reconstruit a partir de matiere, filiere, sigle de filiere, niveau, option, annee,
-- type et session : le titre (desormais lui-meme derive de ces memes colonnes) n'y apporterait
-- rien de plus, et une recherche sur un sigle ("IRT") doit trouver une epreuve meme si son titre
-- genere ne le contient jamais.
-- `create or replace view` refuse d'inserer une colonne au milieu de la liste existante (elle ne
-- peut qu'ajouter des colonnes a la fin) : `field_short_name` se glisse juste apres `field_name`,
-- d'ou drop puis create plutot qu'un simple replace.
drop view public.exams_catalog;

create view public.exams_catalog
  with (security_invoker = true)
as
select
  e.id,
  e.title,
  e.slug,
  e.academic_year,
  e.session,
  e.exam_type,
  e.file_size,
  e.created_at,
  e.field_id,
  f.name as field_name,
  f.short_name as field_short_name,
  e.level_id,
  l.name as level_name,
  e.subject_id,
  s.name as subject_name,
  e.option_id,
  o.name as option_name,
  extensions.unaccent(lower(concat_ws(' ',
    s.name, f.name, f.short_name, l.name, o.name,
    e.academic_year, e.exam_type, e.session
  ))) as search_text,
  e.created_by
from public.exams e
join public.fields f on f.id = e.field_id
join public.levels l on l.id = e.level_id
join public.subjects s on s.id = e.subject_id
left join public.options o on o.id = e.option_id;

revoke all on public.exams_catalog from anon, authenticated;
grant select on public.exams_catalog to anon, authenticated;
