-- Registre "Mes derniers versements" du poste de travail BDE (R-15) : getExams a besoin de
-- filtrer sur le depositaire, absent de la vue exams_catalog jusqu'ici.

create or replace view public.exams_catalog
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
  extensions.unaccent(lower(e.title || ' ' || s.name || ' ' || f.name)) as search_text,
  e.created_by
from public.exams e
join public.fields f on f.id = e.field_id
join public.levels l on l.id = e.level_id
join public.subjects s on s.id = e.subject_id
left join public.options o on o.id = e.option_id;

revoke all on public.exams_catalog from anon, authenticated;
grant select on public.exams_catalog to anon, authenticated;
