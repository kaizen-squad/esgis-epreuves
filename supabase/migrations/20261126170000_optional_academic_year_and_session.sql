-- #196 : annee academique et session facultatives (vieille epreuve dont elles sont inconnues au
-- depot), Controle Continu jamais de session (regle universelle, valable pour toute filiere).

alter table public.exams alter column academic_year drop not null;
alter table public.exams alter column session drop not null;

alter table public.exams add constraint exams_cc_never_has_session
  check (exam_type <> 'Contrôle Continu' or session is null);
