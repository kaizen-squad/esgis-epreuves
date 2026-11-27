-- #197 (corrige la migration 20261126150000) : deux matieres de tronc commun (option_id null)
-- portant le meme nom dans la meme filiere/niveau ne violaient jusqu'ici aucune contrainte,
-- Postgres traitant par defaut deux NULL comme distincts dans un index unique. L'admin pouvait
-- ainsi creer des doublons en silence (`createSubject` renvoie toujours `option_id: null` pour le
-- tronc commun), et `buildReferentialMaps`/`resolveSeedRow` n'auraient alors gardé qu'un des deux
-- sans jamais le signaler. Constat de revue, lot metadonnees 2026-11-26.
alter table public.subjects drop constraint subjects_field_id_level_id_option_id_name_key;
alter table public.subjects add constraint subjects_field_id_level_id_option_id_name_key
  unique nulls not distinct (field_id, level_id, option_id, name);
