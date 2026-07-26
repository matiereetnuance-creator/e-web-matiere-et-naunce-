/**
 * Module "03 - Chantiers"
 *
 * ⚠️ Cette feuille EXISTE DÉJÀ chez le client et sert de base de
 * données pour tout le reste du classeur. Ce module ne la crée ni ne
 * la modifie jamais (aucune valeur, colonne, ni mise en forme
 * touchée) : il se contente de LIRE ses en-têtes — dont les intitulés
 * attendus sont saisis par le client dans Paramètres!B12:B15 (voir
 * CHANTIERS_FIELDS, 00_Constantes.gs) — pour créer des plages nommées
 * que Dashboard, Prévisionnel et Analyse utilisent ensuite.
 *
 * Exception unique : si le classeur est totalement neuf et que
 * l'onglet Chantiers n'existe pas encore (ex. environnement de test),
 * un gabarit minimal est créé pour permettre l'installation — ce cas
 * ne doit jamais se produire chez le client.
 *
 * CHANTIERS_STATUT est relié mais volontairement non utilisé comme
 * filtre dans les formules de CA/marge : les valeurs réelles de ce
 * statut (ex. "Facturé", "Terminé"...) ne sont pas connues à l'avance,
 * et un filtre mal deviné fausserait silencieusement tous les
 * indicateurs. monthlyAmountFormula_() / annualAmountFormula_()
 * acceptent un paramètre extraCondition prêt à l'emploi pour brancher
 * ce filtre dès que le bon statut sera confirmé avec le client.
 */

/**
 * En-tête attendu pour un champ Chantiers : lu depuis la cellule
 * Paramètres correspondante si elle existe déjà (cas normal), sinon
 * repli sur la valeur par défaut (premier lancement, avant que
 * buildParametres_() n'ait créé la plage nommée).
 */
function getChantiersFieldHeader_(field) {
  var namedRange = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(field.headerNamedRange);
  if (namedRange) {
    var value = String(namedRange.getValue()).trim();
    if (value) return value;
  }
  return field.defaultHeader;
}

/** Relie les plages nommées Chantiers à la feuille existante. Retourne les en-têtes manquants. */
function ensureChantiersLinks_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.CHANTIERS);
  if (!sheet) {
    sheet = creerGabaritChantiersMinimal_();
  }

  var dataRows = 5000; // plage large fixe : robuste, pas de fonction volatile
  var missing = [];

  CHANTIERS_FIELDS.forEach(function (field) {
    var header = getChantiersFieldHeader_(field);
    var col = findColumnByHeader_(sheet, CHANTIERS_HEADER_ROW, header);
    if (col === -1) {
      missing.push(header + ' (' + field.label + ')');
      return;
    }
    var range = sheet.getRange(CHANTIERS_HEADER_ROW + 1, col, dataRows, 1);
    setNamedRange_(field.dataNamedRange, range);
  });

  return missing;
}

/**
 * Gabarit minimal, créé UNIQUEMENT si l'onglet Chantiers est absent
 * (classeur neuf). À remplacer par le vrai tableau du client avant
 * mise en production — voir l'avertissement en tête de fichier.
 */
function creerGabaritChantiersMinimal_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEETS.CHANTIERS);
  var parField = function (key) {
    var field = CHANTIERS_FIELDS.filter(function (f) { return f.key === key; })[0];
    return getChantiersFieldHeader_(field);
  };
  var headers = ['Nom du chantier', 'Client', parField('STATUT'), parField('DATE'), parField('CA_HT'), parField('MARGE_HT')];
  sheet.getRange(CHANTIERS_HEADER_ROW, 1, 1, headers.length).setValues([headers]);
  styleTableHeader_(sheet.getRange(CHANTIERS_HEADER_ROW, 1, 1, headers.length));
  sheet.setFrozenRows(CHANTIERS_HEADER_ROW);
  return sheet;
}

/**
 * Vérifie que la feuille Chantiers expose bien les en-têtes attendus
 * (tels que saisis dans Paramètres!B12:B15) et affiche le résultat à
 * l'écran. Accessible depuis le menu Pilotage.
 */
function verifierStructureChantiers() {
  var missing = ensureChantiersLinks_();
  var ui = SpreadsheetApp.getUi();
  var attendus = CHANTIERS_FIELDS.map(function (f) { return getChantiersFieldHeader_(f) + ' (' + f.label + ')'; });
  if (missing.length === 0) {
    ui.alert('Structure Chantiers ✓',
      'Toutes les colonnes attendues ont été trouvées et reliées avec succès :\n\n' +
      attendus.join('\n'),
      ui.ButtonSet.OK);
  } else {
    ui.alert('Structure Chantiers — action requise',
      'Colonnes introuvables dans "' + SHEETS.CHANTIERS + '" (ligne ' + CHANTIERS_HEADER_ROW + ') :\n\n' +
      missing.join('\n') +
      '\n\nCorrigez les en-têtes dans "' + SHEETS.PARAMETRES + '" (cellules B12 à B15, ' +
      'section "Connexion à l\'onglet Chantiers") pour qu\'ils correspondent aux ' +
      'véritables intitulés de colonnes, puis relancez cette vérification.',
      ui.ButtonSet.OK);
  }
}
