-- Reglages du site modifiables par le BDE sans toucher au code. Une seule ligne (cle `id`
-- toujours vraie), une colonne typee par reglage : en ajouter un autre, c'est un `alter table
-- add column` avec sa propre contrainte, sans table cle/valeur a valider cote application.

create table public.site_settings (
  id boolean primary key default true check (id),
  -- Numero WhatsApp du BDE (bouton "Nous contacter" du pied de page, FAQ de l'accueil), au
  -- format international E.164 (`+` puis 8 a 15 chiffres). `null` tant qu'il n'est pas defini :
  -- le lien wa.me s'ouvre alors sans destinataire et laisse choisir un contact.
  bde_whatsapp_number text check (bde_whatsapp_number ~ '^\+[1-9][0-9]{7,14}$'),
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (true);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row
  execute function private.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.site_settings force row level security;

-- Lecture publique : le site public affiche le contact sans session.
create policy site_settings_select_public on public.site_settings
  for select to anon, authenticated using (true);

-- Modification reservee au BDE (actif, via has_role). Pas d'insertion ni de suppression : la
-- ligne unique est creee ci-dessus et ne disparait jamais.
create policy site_settings_update_bde on public.site_settings
  for update to authenticated
  using ((select private.has_role('BDE'))) with check ((select private.has_role('BDE')));
