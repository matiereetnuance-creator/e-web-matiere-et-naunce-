/**
 * Module "01 - Accueil"
 *
 * Page extrêmement simple : titre, exercice en cours, bouton vers le
 * Dashboard. Aucun indicateur — c'est volontaire.
 */

function buildAccueil_() {
  var sheet = getOrCreateSheet_(SHEETS.ACCUEIL);
  resetSheet_(sheet);

  // V5 : proportions légèrement élargies pour accompagner l'échelle
  // typographique agrandie (DESIGN, 00_Constantes.gs) — Accueil reste
  // une page volontairement étroite (titre, exercice, bouton), pas une
  // grille pleine largeur comme Dashboard/Prévisionnel/Analyse.
  sheet.setColumnWidth(1, 300);
  sheet.setColumnWidth(2, 240);
  sheet.setHiddenGridlines(true);

  buildAccueilTitre_(sheet);
  buildAccueilSousTitre_(sheet);
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

/** Légende discrète sous le titre (V5.1) — orientation immédiate, style "eyebrow" Notion/Linear. */
function buildAccueilSousTitre_(sheet) {
  var sousTitre = sheet.getRange('A2:B2');
  sousTitre.merge().setValue('Pilotage de l\'activité — chiffre d\'affaires, marge, charges');
  stylePageSubtitle_(sousTitre);
  sheet.setRowHeight(2, DESIGN.SUBHEADER_HEIGHT);
}

function buildAccueilExercice_(sheet) {
  var label = sheet.getRange('A4');
  label.setValue('Exercice').setFontFamily(FONT).setFontSize(DESIGN.INPUT_FONT_SIZE).setFontColor(COLORS.INK_MUTED);

  var valeur = sheet.getRange('B4');
  valeur.setFormula(avecIferror_(NAMED_RANGES.EXERCICE, '—'));
  valeur.setFontFamily(FONT).setFontSize(DESIGN.INPUT_FONT_SIZE).setFontWeight('bold').setFontColor(COLORS.INK);
  valeur.setNote('Repris automatiquement de 05 - Paramètres.');
  protectAsCalculated_(valeur);

  sheet.setRowHeight(4, DESIGN.INPUT_ROW_HEIGHT);
}

function buildAccueilBouton_(sheet) {
  var dashboard = getRequiredSheet_(SHEETS.DASHBOARD);
  var bouton = sheet.getRange('A6:B7');
  bouton.merge();
  // V4.1.4 : via appel_() (01_Utils.gs) plutôt qu'une virgule écrite en
  // dur entre les 2 arguments de HYPERLINK (voir CHANGELOG.md V4.1.4).
  bouton.setFormula('=' + appel_('HYPERLINK', ['"#gid=' + dashboard.getSheetId() + '"', '"Ouvrir le Dashboard  →"']));
  // V5.1 : bouton plein, sans bordure (style Stripe/Linear — un aplat
  // de couleur suffit, aucun contour nécessaire).
  bouton.setBackground(COLORS.ACCENT)
    .setFontFamily(FONT).setFontSize(DESIGN.BUTTON_FONT_SIZE).setFontWeight('bold').setFontColor(COLORS.WHITE)
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  protectAsCalculated_(bouton);
}
