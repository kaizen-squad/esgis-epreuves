/** Libelle d'une matiere dans le filtre, avec son nombre d'epreuves quand il est connu (#147). */
export function subjectLabelWithCount(
  name: string,
  count: number | undefined,
): string {
  return count === undefined ? name : `${name} (${count})`;
}
