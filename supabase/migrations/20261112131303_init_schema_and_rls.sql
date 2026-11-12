-- Schema initial : profiles, referentiels (levels, fields, options, subjects), exams.
-- RLS sur chaque table, jamais une table exposee sans politique.

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('BDE', 'ADMIN')),
  created_at timestamptz not null default now()
);

create table public.levels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.fields (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields (id) on delete restrict,
  name text not null,
  unique (field_id, name)
);

create index options_field_id_idx on public.options (field_id);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.fields (id) on delete restrict,
  level_id uuid not null references public.levels (id) on delete restrict,
  name text not null,
  unique (field_id, level_id, name)
);

create index subjects_field_id_level_id_idx on public.subjects (field_id, level_id);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  academic_year text not null check (academic_year ~ '^\d{4}-\d{4}$'),
  session text not null check (session in ('Session Normale', 'Rattrapage')),
  exam_type text not null check (exam_type in ('Contrôle Terminal', 'Contrôle Continu')),
  subject_id uuid not null references public.subjects (id) on delete restrict,
  level_id uuid not null references public.levels (id) on delete restrict,
  field_id uuid not null references public.fields (id) on delete restrict,
  option_id uuid references public.options (id) on delete restrict,
  file_hash text not null unique check (char_length(file_hash) = 64),
  file_mime_type text not null check (file_mime_type = 'application/pdf'),
  file_size bigint not null check (file_size > 0),
  r2_key text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exams_subject_id_idx on public.exams (subject_id);
create index exams_level_id_idx on public.exams (level_id);
create index exams_field_id_idx on public.exams (field_id);
create index exams_option_id_idx on public.exams (option_id);
create index exams_created_by_idx on public.exams (created_by);

create function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger exams_set_updated_at
  before update on public.exams
  for each row
  execute function private.set_updated_at();

-- created_by est un champ d'audit : jamais la valeur envoyee par le client, toujours auth.uid()
-- sur creation, jamais modifiable ensuite (sinon un BDE pourrait falsifier l'attribution).
create function private.set_exam_created_by()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by = auth.uid();
  else
    new.created_by = old.created_by;
  end if;
  return new;
end;
$$;

create trigger exams_set_created_by
  before insert or update on public.exams
  for each row
  execute function private.set_exam_created_by();

-- Verifie le role de l'utilisateur courant sans dependre d'une politique SELECT sur profiles
-- (profiles n'a pas de lecture publique : cette fonction contourne la RLS par securite definer).
create function private.has_role(required_role text)
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
  );
$$;

revoke execute on function private.has_role(text) from public, anon;
grant execute on function private.has_role(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.levels enable row level security;
alter table public.levels force row level security;
alter table public.fields enable row level security;
alter table public.fields force row level security;
alter table public.options enable row level security;
alter table public.options force row level security;
alter table public.subjects enable row level security;
alter table public.subjects force row level security;
alter table public.exams enable row level security;
alter table public.exams force row level security;

-- Lecture publique (cle publique) sur les referentiels et les epreuves.
create policy levels_select_public on public.levels for select to anon, authenticated using (true);
create policy fields_select_public on public.fields for select to anon, authenticated using (true);
create policy options_select_public on public.options for select to anon, authenticated using (true);
create policy subjects_select_public on public.subjects for select to anon, authenticated using (true);
create policy exams_select_public on public.exams for select to anon, authenticated using (true);

-- Ecriture des referentiels et des profils reservee a ADMIN.
create policy levels_write_admin on public.levels for all to authenticated
  using ((select private.has_role('ADMIN'))) with check ((select private.has_role('ADMIN')));
create policy fields_write_admin on public.fields for all to authenticated
  using ((select private.has_role('ADMIN'))) with check ((select private.has_role('ADMIN')));
create policy options_write_admin on public.options for all to authenticated
  using ((select private.has_role('ADMIN'))) with check ((select private.has_role('ADMIN')));
create policy subjects_write_admin on public.subjects for all to authenticated
  using ((select private.has_role('ADMIN'))) with check ((select private.has_role('ADMIN')));
create policy profiles_write_admin on public.profiles for all to authenticated
  using ((select private.has_role('ADMIN'))) with check ((select private.has_role('ADMIN')));

-- Ecriture des epreuves reservee a BDE.
create policy exams_write_bde on public.exams for all to authenticated
  using ((select private.has_role('BDE'))) with check ((select private.has_role('BDE')));
