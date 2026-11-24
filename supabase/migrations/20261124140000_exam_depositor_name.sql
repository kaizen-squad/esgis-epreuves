-- #176 : afficher sur la fiche d'une epreuve le nom de son depositaire. `profiles` n'est lisible
-- que par un ADMIN (`profiles_write_admin`, voir 20261121171725_profiles_active_flag.sql) : un
-- compte BDE ne peut pas lire le nom d'un collegue par une requete normale, pas meme le sien.
-- Cette fonction expose juste le nom affichable d'un profil quelconque, jamais son email ni son
-- role, mais seulement pour un appelant qui a lui-meme un role connu et actif : revue de code
-- (#176, apres coup) a releve que n'importe quel `authenticated` aurait pu sinon appeler ce RPC
-- directement (sans passer par `requireBdeSession`) pour retrouver le nom de n'importe quel
-- depositaire. `private.has_role` ne verifie pas `is_active` (voir sa definition) : on revérifie
-- l'activite ici, pour fermer la meme fenetre qu'un compte desactive dont le jeton reste valide
-- jusqu'a une heure (voir `requireBdeSession`).
--
-- Reservee a `authenticated`, jamais `anon` : `exams_catalog` (vue ci-dessous, inchangee) sert
-- aussi bien la page publique d'une epreuve (client anonyme) que sa fiche BDE, donc le nom du
-- depositaire ne peut pas vivre dans une colonne de cette vue (anon devrait alors executer la
-- fonction pour lire n'importe quelle ligne, meme sans l'afficher) : le nom est lu a part, par
-- `getExamDepositorName`, appele seulement depuis le rendu BDE avec un client authentifie.

create function public.profile_display_name(profile_id uuid)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select p.full_name
  from public.profiles p
  where p.id = profile_id
    and exists (
      select 1
      from public.profiles caller
      where caller.id = (select auth.uid())
        and caller.role in ('BDE', 'ADMIN')
        and caller.is_active
    );
$$;

revoke execute on function public.profile_display_name(uuid) from public, anon;
grant execute on function public.profile_display_name(uuid) to authenticated;
