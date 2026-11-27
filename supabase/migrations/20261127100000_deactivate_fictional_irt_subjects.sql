-- Desactive les 6 matieres fictives inserees par erreur dans 20261126160000_real_referentials_irt_gestion.sql :
-- "Stage pratique en Entreprise" et "Rédaction et Soutenance de Mémoire" ne sont pas des matieres a
-- epreuves (jamais de copie associee), contrairement a "Méthodologie de Recherche et de Rédaction de
-- Mémoire" qui reste une vraie matiere. On desactive plutot que supprimer (coherent avec le reste des
-- referentiels, voir 20261113123319_referentials_active_flag.sql) : aucune epreuve ne les reference a ce
-- stade, mais `on delete restrict` empecherait de toute facon une suppression si c'etait le cas.
update public.subjects s
set is_active = false
from public.fields f, public.levels l
where s.field_id = f.id
  and s.level_id = l.id
  and f.name = 'Informatique, Réseaux et Télécommunications'
  and l.name = 'L3'
  and s.name in ('Stage pratique en Entreprise', 'Rédaction et Soutenance de Mémoire');
