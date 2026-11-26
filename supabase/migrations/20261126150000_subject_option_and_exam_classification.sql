-- #197 : classement d'une epreuve deduit de la matiere, remplace la verification croisee
-- manquante (#181). Chaque matiere appartient a une option unique (ou aucune, tronc commun) :
-- `subjects.option_id` porte ce lien, jamais un `fieldId`/`levelId`/`optionId` envoye par le
-- client pour classer une epreuve.

alter table public.subjects add column option_id uuid references public.options (id) on delete restrict;

-- Garantit que l'option d'une matiere appartient bien a la meme filiere que la matiere : une FK
-- composite a besoin d'une cle (unique ou primaire) cote reference sur les deux colonnes.
alter table public.options add constraint options_id_field_id_key unique (id, field_id);
alter table public.subjects drop constraint subjects_field_id_level_id_name_key;
alter table public.subjects add constraint subjects_option_id_field_id_fkey
  foreign key (option_id, field_id) references public.options (id, field_id);
-- Remplace l'ancienne contrainte : deux options differentes du meme niveau/filiere peuvent
-- desormais porter une matiere de meme nom (ex. "Methodologie de Recherche..." en AL/SI/SRC).
alter table public.subjects add constraint subjects_field_id_level_id_option_id_name_key
  unique (field_id, level_id, option_id, name);

create index subjects_option_id_idx on public.subjects (option_id);

-- Deduit field_id/level_id/option_id de la matiere choisie, en ignorant ce qu'envoie le client
-- pour ces 3 colonnes (#181) : le classement devient structurellement impossible a violer plutot
-- que verifie apres coup dans chaque action.
create function private.set_exam_classification()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  found_field_id uuid;
  found_level_id uuid;
  found_option_id uuid;
begin
  select field_id, level_id, option_id
    into found_field_id, found_level_id, found_option_id
    from public.subjects
    where id = new.subject_id;

  if not found then
    raise exception 'subject_id inconnu : %', new.subject_id;
  end if;

  new.field_id = found_field_id;
  new.level_id = found_level_id;
  new.option_id = found_option_id;
  return new;
end;
$$;

create trigger exams_set_classification
  before insert or update on public.exams
  for each row
  execute function private.set_exam_classification();
