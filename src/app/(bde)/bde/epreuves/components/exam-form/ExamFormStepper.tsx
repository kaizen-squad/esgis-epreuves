/**
 * Etapes des trois flux d'epreuve (ajout, modification, remplacement). L'indicateur visuel qui
 * vivait ici a ete retire (jugement trompeur, #130 puis #171 pour Modifier et Remplacer) ; ces
 * types restent la source commune des trois flux pour leur machine a etats interne.
 */
export type ExamFormStep = "form" | "saving" | "result";
