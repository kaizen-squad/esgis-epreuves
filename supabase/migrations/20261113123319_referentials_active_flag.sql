-- Drapeau d'activation sur les referentiels geres en CRUD Admin (#64) : filieres, niveaux,
-- matieres, options. Desactiver plutot que supprimer, puisque `on delete restrict` empeche
-- deja toute suppression d'un referentiel reference par une epreuve ; un referentiel desactive
-- disparait des listes de creation/filtres cote public sans casser les epreuves existantes qui
-- le referencent encore.
alter table public.fields add column is_active boolean not null default true;
alter table public.levels add column is_active boolean not null default true;
alter table public.options add column is_active boolean not null default true;
alter table public.subjects add column is_active boolean not null default true;
