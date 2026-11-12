-- Vue de catalogue pour la recherche et les filtres du #9 : joint les referentiels,
-- expose un search_text insensible aux accents (extension unaccent) pour la recherche libre.
-- security_invoker : la vue respecte les politiques RLS des tables sous-jacentes (lecture publique deja en place).

create extension if not exists unaccent with schema extensions;

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
  e.level_id,
  l.name as level_name,
  e.subject_id,
  s.name as subject_name,
  e.option_id,
  o.name as option_name,
  extensions.unaccent(lower(e.title || ' ' || s.name || ' ' || f.name)) as search_text
from public.exams e
join public.fields f on f.id = e.field_id
join public.levels l on l.id = e.level_id
join public.subjects s on s.id = e.subject_id
left join public.options o on o.id = e.option_id;

-- Les privileges par defaut sur une vue couvrent plus que select (insert/update/delete echouent
-- de toute facon sur une vue non modifiable, et RLS s'appliquerait en plus) : explicite par surete.
revoke all on public.exams_catalog from anon, authenticated;
grant select on public.exams_catalog to anon, authenticated;
