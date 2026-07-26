/**
 * Module "06 - Prévisionnel"
 *
 * Vue mensuelle Objectif / Réalisé / Ecart, de janvier à décembre,
 * suivie d'un unique graphique annuel. L'objectif mensuel est
 * l'objectif annuel réparti à parts égales (solution la plus simple
 * et la plus robuste, aucun paramètre de saisonnalité n'étant demandé).
 */

var PREVISIONNEL_HEADER_ROW = 3;
var PREVISIONNEL_FIRST_ROW = 4; // Janvier

function buildPrevisionnel_() {
  var sheet = getOrCreateSheet_(SHEETS.PREVISIONNEL);
  resetSheet_(sheet);

  sheet.setColumnWidth(1, 140);
  sheet.setColumnWidth(2, 130);
  sheet.setColumnWidth(3, 130);
  sheet.setColumnWidth(4, 130);

  buildPrevisionnelTitre_(sheet);
  buildPrevisionnelTableau_(sheet);
  buildPrevisionnelGraphique_(sheet);

  sheet.setFrozenRows(PREVISIONNEL_HEADER_ROW);
}

function buildPrevisionnelTitre_(sheet) {
  var titre = sheet.getRange('A1:D1');
  titre.merge().setValue('PRÉVISIONNEL');
  styleTitle_(titre);
  sheet.setRowHeight(1, 40);
}

function buildPrevisionnelTableau_(sheet) {
  var header = sheet.getRange(PREVISIONNEL_HEADER_ROW, 1, 1, 4);
  header.setValues([['Mois', 'Objectif', 'Réalisé', 'Ecart']]);
  styleTableHeader_(header);

  for (var m = 1; m <= 12; m++) {
    var row = PREVISIONNEL_FIRST_ROW + m - 1;

    var moisCell = sheet.getRange(row, 1);
    moisCell.setValue(MOIS_LABELS[m - 1]);
    moisCell.setFontFamily(FONT).setFontColor(COLORS.INK);
    protectAsCalculated_(moisCell);

    var objectifCell = sheet.getRange(row, 2);
    objectifCell.setFormula('=' + NAMED_RANGES.OBJECTIF_CA + '/12');
    objectifCell.setNumberFormat(FORMAT_EUR);

    var realiseCell = sheet.getRange(row, 3);
    realiseCell.setFormula(monthlyAmountFormula_(NAMED_RANGES.CHANTIERS_CA_HT, m));
    realiseCell.setNumberFormat(FORMAT_EUR);

    var ecartCell = sheet.getRange(row, 4);
    ecartCell.setFormula('=C' + row + '-B' + row);
    ecartCell.setNumberFormat(FORMAT_EUR);

    var ligne = sheet.getRange(row, 1, 1, 4);
    if (m % 2 === 0) ligne.setBackground(COLORS.CARD_BG);
    protectAsCalculated_(sheet.getRange(row, 2, 1, 3));
  }

  var totalRow = PREVISIONNEL_FIRST_ROW + 12;
  var totalLabel = sheet.getRange(totalRow, 1);
  totalLabel.setValue('Total').setFontFamily(FONT).setFontWeight('bold').setFontColor(COLORS.INK);

  ['B', 'C', 'D'].forEach(function (col) {
    var cell = sheet.getRange(col + totalRow);
    cell.setFormula('=SUM(' + col + PREVISIONNEL_FIRST_ROW + ':' + col + (totalRow - 1) + ')');
    cell.setNumberFormat(FORMAT_EUR).setFontWeight('bold');
  });

  var totalRange = sheet.getRange(totalRow, 1, 1, 4);
  totalRange.setBorder(true, false, false, false, false, false, COLORS.INK, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  protectAsCalculated_(totalRange);
}

function buildPrevisionnelGraphique_(sheet) {
  var totalRow = PREVISIONNEL_FIRST_ROW + 12;
  var dataRange = sheet.getRange(PREVISIONNEL_HEADER_ROW, 1, totalRow - PREVISIONNEL_HEADER_ROW, 3); // Mois, Objectif, Réalisé

  var chart = sheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(dataRange)
    .setPosition(totalRow + 2, 1, 0, 0)
    .setOption('title', 'Objectif vs Réalisé par mois')
    .setOption('colors', [COLORS.INK_MUTED, COLORS.ACCENT])
    .setOption('legend', { position: 'top' })
    .setOption('width', 720)
    .setOption('height', 320)
    .setOption('backgroundColor', COLORS.WHITE)
    .build();
  sheet.insertChart(chart);
}
