/**
 * Module "05 - Paramètres"
 *
 * Contient les réglages généraux de l'exercice ainsi que les listes
 * techniques (catégories, TVA, périodicité, oui/non) qui alimentent
 * TOUTES les listes déroulantes du classeur. Rien n'est jamais écrit
 * en dur dans les formules des autres onglets : elles pointent vers
 * les plages nommées créées ici.
 *
 * IMPORTANT : les cellules de saisie (colonne B, lignes 4 à 9) sont
 * des données client. Une réinstallation ne les efface JAMAIS — seules
 * les zones entièrement générées par le script (titre, libellés,
 * bloc de listes techniques) sont effacées puis reconstruites.
 */

function buildParametres_() {
  var sheet = getOrCreateSheet_(SHEETS.PARAMETRES);

  removeAllProtections_(sheet);
  sheet.setHiddenGridlines(true);

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 200);
  for (var c = 3; c <= 6; c++) sheet.setColumnWidth(c, 24);

  // Zones entièrement régénérées par le script (jamais de saisie
  // client) : titre, sous-titre, libellés colonne A, listes techniques.
  // La colonne B (lignes 4 à 9, cellules de saisie) n'est jamais touchée ici.
  sheet.getRange('A1:B1').breakApart().clearContent().clearFormat();
  sheet.getRange('A3').clearContent().clearFormat();
  sheet.getRange('A4:A9').clearContent().clearFormat();
  sheet.getRange('H1:K200').clearContent().clearFormat();

  buildParametresTitre_(sheet);
  buildParametresGeneraux_(sheet);
  buildParametresListes_(sheet);

  sheet.setFrozenRows(1);
}

function buildParametresTitre_(sheet) {
  var titre = sheet.getRange('A1:B1');
  titre.merge().setValue('PARAMÈTRES');
  styleTitle_(titre);
  sheet.setRowHeight(1, 40);
}

function buildParametresGeneraux_(sheet) {
  var sousTitre = sheet.getRange('A3');
  sousTitre.setValue('Paramètres généraux')
    .setFontFamily(FONT).setFontSize(11).setFontWeight('bold').setFontColor(COLORS.INK_MUTED);

  var anneeCourante = new Date().getFullYear();
  var rows = [
    { row: 4, label: 'Exercice', cell: PARAM_CELLS.EXERCICE, name: NAMED_RANGES.EXERCICE, format: '0', defaultValue: anneeCourante },
    { row: 5, label: 'Date début', cell: PARAM_CELLS.DATE_DEBUT, name: NAMED_RANGES.DATE_DEBUT, format: FORMAT_DATE, defaultValue: new Date(anneeCourante, 0, 1) },
    { row: 6, label: 'Date fin', cell: PARAM_CELLS.DATE_FIN, name: NAMED_RANGES.DATE_FIN, format: FORMAT_DATE, defaultValue: new Date(anneeCourante, 11, 31) },
    { row: 7, label: 'Objectif CA HT', cell: PARAM_CELLS.OBJECTIF_CA, name: NAMED_RANGES.OBJECTIF_CA, format: FORMAT_EUR, defaultValue: null },
    { row: 8, label: 'Objectif Marge (%)', cell: PARAM_CELLS.OBJECTIF_MARGE, name: NAMED_RANGES.OBJECTIF_MARGE, format: FORMAT_PERCENT, defaultValue: null },
    { row: 9, label: 'Salaire mensuel souhaité', cell: PARAM_CELLS.SALAIRE_MENSUEL, name: NAMED_RANGES.SALAIRE_MENSUEL, format: FORMAT_EUR, defaultValue: null }
  ];

  rows.forEach(function (r) {
    var label = sheet.getRange(r.row, 1);
    label.setValue(r.label).setFontFamily(FONT).setFontSize(11).setFontColor(COLORS.INK).setVerticalAlignment('middle');

    var input = sheet.getRange(r.cell);
    var etaitVide = input.isBlank();
    styleInputCell_(input);
    input.setNumberFormat(r.format).setVerticalAlignment('middle');
    // Valeur de démarrage uniquement si la cellule est réellement vide,
    // pour ne jamais écraser une saisie déjà faite par le client.
    if (etaitVide && r.defaultValue !== null) {
      input.setValue(r.defaultValue);
    }

    setNamedRange_(r.name, input);
    sheet.setRowHeight(r.row, 26);
  });
}

function buildParametresListes_(sheet) {
  var titre = sheet.getRange('H1');
  titre.setValue('Listes techniques (ne pas supprimer)')
    .setFontFamily(FONT).setFontSize(10).setFontWeight('bold').setFontColor(COLORS.INK_MUTED);

  var keys = Object.keys(PARAM_LISTES);
  keys.forEach(function (key) {
    var liste = PARAM_LISTES[key];
    var headerCell = sheet.getRange(liste.col + PARAM_LISTES_HEADER_ROW);
    headerCell.setValue(liste.header).setFontFamily(FONT).setFontWeight('bold');

    var firstRow = PARAM_LISTES_FIRST_ROW;
    var lastRow = firstRow + liste.values.length - 1;
    var valuesRange = sheet.getRange(liste.col + firstRow + ':' + liste.col + lastRow);
    valuesRange.setValues(liste.values.map(function (v) { return [v]; }));
    if (key === 'TVA') valuesRange.setNumberFormat(FORMAT_PERCENT_TVA);

    var namedRangeKey = 'LISTE_' + key;
    setNamedRange_(NAMED_RANGES[namedRangeKey], valuesRange);
  });

  // Colonnes techniques masquées : les plages nommées restent valides.
  sheet.hideColumns(8, 4); // H:K
}
