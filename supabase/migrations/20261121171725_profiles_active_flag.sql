-- Desactivation des comptes BDE (#100). Un membre ne se supprime pas : `exams.created_by`
-- reference `profiles` sans `on delete`, et on garde qui a depose quoi. Un profil desactive
-- perd tout role dans `has_role`, donc toute ecriture via la RLS, meme avec une session encore
-- valide ; le bannissement Auth (pose par la Server Action) bloque en plus la connexion.

alter table public.profiles add column is_active boolean not null default true;

create or replace function private.has_role(required_role text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = required_role
      and is_active
  );
$$;
