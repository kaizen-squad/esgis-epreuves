-- #176 : afficher sur la fiche d'une epreuve le nom de son depositaire. `profiles` n'est lisible
-- que par un ADMIN (`profiles_write_admin`, voir 20261121171725_profiles_active_flag.sql) : un
-- compte BDE ne peut pas lire le nom d'un collegue par une requete normale, pas meme le sien.
-- Cette fonction (meme principe que `current_profile_status`) expose juste le nom affichable
-- d'un profil quelconque, jamais son email ni son role.

create function public.profile_display_name(profile_id uuid)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select p.full_name
  from public.profiles p
  where p.id = profile_id;
$$;

revoke execute on function public.profile_display_name(uuid) from public, anon;
grant execute on function public.profile_display_name(uuid) to authenticated;

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
  e.created_by,
  public.profile_display_name(e.created_by) as created_by_name
from public.exams e
join public.fields f on f.id = e.field_id
join public.levels l on l.id = e.level_id
join public.subjects s on s.id = e.subject_id
left join public.options o on o.id = e.option_id;

revoke all on public.exams_catalog from anon, authenticated;
grant select on public.exams_catalog to anon, authenticated;
