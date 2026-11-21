-- Fixe le search_path de ces deux triggers (#94, advisor function_search_path_mutable), comme
-- private.has_role. Sans search_path fixe, un role capable de modifier le search_path de sa
-- session pourrait faire resoudre now()/auth.uid() vers une fonction de meme nom posee dans un
-- schema qu'il controle. Risque faible ici (triggers, jamais appeles directement), corrige quand
-- meme pour que l'advisor Supabase ne le signale plus.

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.set_exam_created_by()
returns trigger
language plpgsql
set search_path = ''
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
