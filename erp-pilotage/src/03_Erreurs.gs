/**
 * Bibliothèque utilitaire de gestion des erreurs (V3).
 *
 * Deux familles de protection distinctes :
 *
 * 1. Erreurs Apps Script (exceptions JS) : les fonctions `*Safe_`
 *    ci-dessous ne lèvent jamais d'exception — une feuille ou une
 *    plage nommée absente renvoie `null`/une valeur par défaut au
 *    lieu de faire planter le script avec un message technique
 *    illisible pour le client.
 *
 * 2. Erreurs de formule (#REF!, #N/A, #VALUE!, #ERROR!, #NOM?) :
 *    `avecIferror_()` encapsule systématiquement les formules générées
 *    par le script pour qu'une dépendance cassée retombe sur une
 *    valeur neutre (0, ou un tiret) plutôt que d'afficher une erreur
 *    dans la cellule. Le vrai diagnostic du problème se fait ensuite
 *    via Pilotage ▸ Diagnostic (90_Diagnostic.gs), pas par la lecture
 *    d'un symbole d'erreur au milieu du classeur.
 */

/** Feuille par nom, ou `null` si absente — ne lève jamais d'exception. */
function getSheetSafe_(nom) {
  return getSpreadsheet_().getSheetByName(nom) || null;
}

/** Plage nommée par nom, ou `null` si absente/supprimée — ne lève jamais d'exception. */
function getNamedRangeSafe_(nom) {
  try {
    return getSpreadsheet_().getRangeByName(nom) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Valeur d'une plage nommée à une seule cellule, avec repli si la
 * plage est absente OU si la cellule est vide.
 */
function getNamedValueSafe_(nom, valeurParDefaut) {
  var range = getNamedRangeSafe_(nom);
  if (!range) return valeurParDefaut;
  var valeur = range.getValue();
  return (valeur === '' || valeur === null || valeur === undefined) ? valeurParDefaut : valeur;
}

/** Affiche une erreur utilisateur compréhensible (boîte de dialogue). */
function afficherErreur_(titre, message) {
  var ui = SpreadsheetApp.getUi();
  ui.alert('⚠️ ' + titre, message, ui.ButtonSet.OK);
}

/**
 * Enveloppe le corps d'une formule (sans le signe "=" initial) dans
 * IFERROR, pour qu'une dépendance cassée (plage nommée supprimée,
 * feuille absente, division par zéro...) retombe sur `repli` au lieu
 * d'afficher une erreur. N'affecte jamais le résultat du chemin normal
 * (sans erreur) : ce n'est jamais un changement de logique métier.
 *
 * Utilise `appel_()` (`01_Utils.gs`, V4.1.4) plutôt qu'une virgule
 * écrite en dur entre `corpsFormule` et `repli` — cette virgule doit
 * être un point-virgule sur un classeur dont la locale utilise la
 * virgule comme séparateur décimal (ex. français), sous peine de
 * "Erreur d'analyse de formule" (confirmé par test réel).
 *
 * @param {string} corpsFormule Expression de formule, SANS le "=" initial.
 * @param {(number|string)=} repli Valeur de repli (0 par défaut).
 * @return {string} Formule complète, prête pour setFormula().
 */
function avecIferror_(corpsFormule, repli) {
  if (repli === undefined) repli = 0;
  var repliFormule = (typeof repli === 'string') ? '"' + repli + '"' : repli;
  return '=' + appel_('IFERROR', [corpsFormule, repliFormule]);
}
