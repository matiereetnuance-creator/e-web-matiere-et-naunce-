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

/** Même style de titre que les 6 autres feuilles (styleTitle_) — V4, harmonisation. */
function buildAccueilTitre_(sheet) {
  var titre = sheet.getRange('A1:B1');
  titre.merge().setValue('MATIÈRE & NUANCE - PILOTAGE');
  styleTitle_(titre);
  sheet.setRowHeight(1, DESIGN.HEADER_HEIGHT);
}

function buildAccueilExercice_(sheet) {
  var label = sheet.getRange('A3');
  label.setValue('Exercice').setFontFamily(FONT).setFontSize(DESIGN.INPUT_FONT_SIZE).setFontColor(COLORS.INK_MUTED);

  var valeur = sheet.getRange('B3');
  valeur.setFormula(avecIferror_(NAMED_RANGES.EXERCICE, '—'));
  valeur.setFontFamily(FONT).setFontSize(DESIGN.INPUT_FONT_SIZE).setFontWeight('bold').setFontColor(COLORS.INK);
  valeur.setNote('Repris automatiquement de 05 - Paramètres.');
  protectAsCalculated_(valeur);

  sheet.setRowHeight(3, DESIGN.INPUT_ROW_HEIGHT);
}

function buildAccueilBouton_(sheet) {
  var dashboard = getRequiredSheet_(SHEETS.DASHBOARD);
  var bouton = sheet.getRange('A5:B6');
  bouton.merge();
  bouton.setFormula('=HYPERLINK("#gid=' + dashboard.getSheetId() + '","Ouvrir le Dashboard  →")');
  bouton.setBackground(COLORS.ACCENT)
    .setFontFamily(FONT).setFontSize(DESIGN.BUTTON_FONT_SIZE).setFontWeight('bold').setFontColor(COLORS.WHITE)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  applyThinBorder_(bouton);
  protectAsCalculated_(bouton);
}
