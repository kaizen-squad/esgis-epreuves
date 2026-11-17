/** Abreviations d'affichage des filieres dont le nom complet est trop long pour une carte. */
const FIELD_ABBREVIATIONS: Record<string, string> = {
  "informatique, reseaux et telecommunication": "IRT",
};

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/s$/, "");
}

/** Nom affiche d'une filiere : "Informatique, Réseaux et Télécommunications" devient "IRT", les autres restent tels quels. */
export function fieldDisplayName(name: string): string {
  return FIELD_ABBREVIATIONS[normalize(name)] ?? name;
}
