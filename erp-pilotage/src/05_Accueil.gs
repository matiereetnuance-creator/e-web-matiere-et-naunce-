/**
 * Module "01 - Accueil"
 *
 * Page extrêmement simple : titre, exercice en cours, bouton vers le
 * Dashboard. Aucun indicateur — c'est volontaire.
 */

function buildAccueil_() {
  var sheet = getOrCreateSheet_(SHEETS.ACCUEIL);
  resetSheet_(sheet);

  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 200);
  sheet.setHiddenGridlines(true);

  buildAccueilTitre_(sheet);
  buildAccueilExercice_(sheet);
  buildAccueilBouton_(sheet);
}

function buildAccueilTitre_(sheet) {
  var titre = sheet.getRange('A1:B1');
  titre.merge().setValue('MATIÈRE & NUANCE - PILOTAGE');
  titre.setFontFamily(FONT).setFontSize(24).setFontWeight('bold')
    .setFontColor(COLORS.INK).setVerticalAlignment('middle');
  sheet.setRowHeight(1, 60);
}

function buildAccueilExercice_(sheet) {
  var label = sheet.getRange('A3');
  label.setValue('Exercice').setFontFamily(FONT).setFontSize(12).setFontColor(COLORS.INK_MUTED);

  var valeur = sheet.getRange('B3');
  valeur.setFormula('=' + NAMED_RANGES.EXERCICE);
  valeur.setFontFamily(FONT).setFontSize(12).setFontWeight('bold').setFontColor(COLORS.INK);
  protectAsCalculated_(valeur);

  sheet.setRowHeight(3, 30);
}

function buildAccueilBouton_(sheet) {
  var dashboard = getRequiredSheet_(SHEETS.DASHBOARD);
  var bouton = sheet.getRange('A5:B6');
  bouton.merge();
  bouton.setFormula('=HYPERLINK("#gid=' + dashboard.getSheetId() + '","Ouvrir le Dashboard  →")');
  bouton.setBackground(COLORS.ACCENT)
    .setFontFamily(FONT).setFontSize(13).setFontWeight('bold').setFontColor(COLORS.WHITE)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  applyThinBorder_(bouton);
  protectAsCalculated_(bouton);
}
