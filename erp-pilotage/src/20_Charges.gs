/**
 * Module "04 - Charges"
 *
 * Base des charges fixes. Le tableau (colonnes A:H) est une zone de
 * saisie : une réinstallation ne doit JAMAIS effacer les lignes déjà
 * remplies par le client. Seules la mise en forme, les validations et
 * les deux cartes KPI (haut de page) sont reconstruites à chaque
 * installation.
 */

function buildCharges_() {
  var sheet = getOrCreateSheet_(SHEETS.CHARGES);

  sheet.getCharts().forEach(function (chart) { sheet.removeChart(chart); });
  removeAllProtections_(sheet);
  sheet.setHiddenGridlines(true);

  sheet.setColumnWidth(1, 170); // Catégorie
  sheet.setColumnWidth(2, 220); // Libellé
  sheet.setColumnWidth(3, 150); // Fournisseur
  sheet.setColumnWidth(4, 120); // Périodicité
  sheet.setColumnWidth(5, 110); // Montant HT
  sheet.setColumnWidth(6, 80);  // TVA
  sheet.setColumnWidth(7, 110); // Date de début
  sheet.setColumnWidth(8, 80);  // Actif

  buildChargesTitre_(sheet);
  buildChargesEnTete_(sheet);

  var namedRanges = buildChargesPlagesNommees_(sheet);
  buildChargesCartes_(sheet);
  buildChargesValidations_(sheet, namedRanges);

  sheet.setFrozenRows(CHARGES_HEADER_ROW);
}

function buildChargesTitre_(sheet) {
  sheet.getRange('A1:H1').breakApart().clearContent();
  var titreRange = sheet.getRange('A1:C1');
  titreRange.merge().setValue('CHARGES FIXES');
  styleTitle_(titreRange);
  sheet.setRowHeight(1, 40);
}

function buildChargesEnTete_(sheet) {
  var header = sheet.getRange(CHARGES_HEADER_ROW, 1, 1, CHARGES_COLUMNS.length);
  header.setValues([CHARGES_COLUMNS]);
  styleTableHeader_(header);
  sheet.setRowHeight(CHARGES_HEADER_ROW, 28);
}

/** Crée/rafraîchit les plages nommées pointant vers les colonnes de données. */
function buildChargesPlagesNommees_(sheet) {
  var firstRow = CHARGES_FIRST_DATA_ROW;
  var nbRows = CHARGES_LAST_DATA_ROW - firstRow + 1;

  var categorie = sheet.getRange(firstRow, 1, nbRows, 1);
  var periodicite = sheet.getRange(firstRow, 4, nbRows, 1);
  var montant = sheet.getRange(firstRow, 5, nbRows, 1);
  var tva = sheet.getRange(firstRow, 6, nbRows, 1);
  var actif = sheet.getRange(firstRow, 8, nbRows, 1);

  setNamedRange_(NAMED_RANGES.CHARGES_CATEGORIE, categorie);
  setNamedRange_(NAMED_RANGES.CHARGES_PERIODICITE, periodicite);
  setNamedRange_(NAMED_RANGES.CHARGES_MONTANT_HT, montant);
  setNamedRange_(NAMED_RANGES.CHARGES_ACTIF, actif);

  return { categorie: categorie, periodicite: periodicite, montant: montant, tva: tva, actif: actif };
}

/**
 * Formule d'équivalent mensuel d'une charge, quelle que soit sa
 * périodicité (ponctuelle exclue du récurrent). Réutilisée pour les
 * deux cartes KPI et pour la répartition par catégorie (Analyse).
 */
function chargesEquivalentMensuelFormula_() {
  var actif = NAMED_RANGES.CHARGES_ACTIF;
  var periodicite = NAMED_RANGES.CHARGES_PERIODICITE;
  var montant = NAMED_RANGES.CHARGES_MONTANT_HT;
  return [
    'IF(', actif, '<>"Oui", 0,',
    ' IFS(',
    periodicite, '="Mensuelle", ', montant, ',',
    periodicite, '="Trimestrielle", ', montant, '/3,',
    periodicite, '="Annuelle", ', montant, '/12,',
    'TRUE, 0',
    '))'
  ].join('');
}

function buildChargesCartes_(sheet) {
  var mensuelFormula = '=LET(mensuel,' + chargesEquivalentMensuelFormula_() + ',SUM(mensuel))';

  var valeurMensuelle = buildKpiCard_(sheet, 3, 1, 3, 'CHARGES MENSUELLES', mensuelFormula, FORMAT_EUR, true);
  setNamedRange_(NAMED_RANGES.CHARGES_MENSUELLES, valeurMensuelle);

  var annuelFormula = '=' + valeurMensuelle.getA1Notation() + '*12';
  var valeurAnnuelle = buildKpiCard_(sheet, 3, 5, 3, 'CHARGES ANNUELLES', annuelFormula, FORMAT_EUR, false);
  setNamedRange_(NAMED_RANGES.CHARGES_ANNUELLES, valeurAnnuelle);

  sheet.setRowHeight(4, 34);
}

function buildChargesValidations_(sheet, namedRanges) {
  setDropdownFromNamedRange_(namedRanges.categorie, NAMED_RANGES.LISTE_CATEGORIES);
  setDropdownFromNamedRange_(namedRanges.periodicite, NAMED_RANGES.LISTE_PERIODICITE);
  setDropdownFromNamedRange_(namedRanges.tva, NAMED_RANGES.LISTE_TVA);
  setDropdownFromNamedRange_(namedRanges.actif, NAMED_RANGES.LISTE_OUI_NON);

  namedRanges.montant.setNumberFormat(FORMAT_EUR_2DEC);
  namedRanges.tva.setNumberFormat(FORMAT_PERCENT_TVA);
  sheet.getRange(CHARGES_FIRST_DATA_ROW, 7, CHARGES_LAST_DATA_ROW - CHARGES_FIRST_DATA_ROW + 1, 1).setNumberFormat(FORMAT_DATE);

  styleInputCell_(sheet.getRange(CHARGES_FIRST_DATA_ROW, 1, CHARGES_LAST_DATA_ROW - CHARGES_FIRST_DATA_ROW + 1, CHARGES_COLUMNS.length));
}
