-- #164 : la garde BDE ne verifiait que la presence d'une session, jamais le role ni le statut
-- actif. `private.has_role` fait deja les deux (voir 20261121171725_profiles_active_flag.sql)
-- mais vit dans le schema `private`, non expose par PostgREST (schemas exposes : `public` et
-- `graphql_public`, voir supabase/config.toml) : impossible de l'appeler depuis le client. Un
-- compte BDE ne peut pas non plus lire sa propre ligne `profiles` par une requete normale
-- (`profiles_write_admin` reserve toute lecture a un ADMIN). Cette fonction expose juste assez
-- (role et is_active du compte courant, jamais celui d'un autre) pour que `requireBdeSession`
-- decide sans rien d'autre.

create function public.current_profile_status()
returns table (role text, is_active boolean)
language sql
security definer
set search_path = ''
stable
as $$
  select p.role, p.is_active
  from public.profiles p
  where p.id = (select auth.uid());
$$;

revoke execute on function public.current_profile_status() from public, anon;
grant execute on function public.current_profile_status() to authenticated;
