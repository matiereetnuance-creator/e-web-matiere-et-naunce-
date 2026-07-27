/**
 * Module "02 - Dashboard"
 *
 * L'onglet principal : 5 indicateurs clés + 2 graphiques, rien
 * d'autre. Grille pleine largeur calibrée pour un grand écran de
 * bureau (~1920px, V5 — DESIGN.WIDE_COLUMN_WIDTH) plutôt que
 * l'ancienne hypothèse V1-V4 "écran de 15 pouces sans défilement".
 */

var DASHBOARD_HELPER_COL_MOIS = 17;      // Q — données mensuelles (masquées)
var DASHBOARD_HELPER_COL_CATEGORIE = 20; // T — répartition charges (masquées)

function buildDashboard_() {
  var sheet = getOrCreateSheet_(SHEETS.DASHBOARD);
  resetSheet_(sheet);

  sheet.setColumnWidths(1, DESIGN.WIDE_GRID_COLUMNS, DESIGN.WIDE_COLUMN_WIDTH); // un seul appel plutôt que 14 (V4.1, perf)

  buildDashboardTitre_(sheet);
  buildDashboardSousTitre_(sheet);
  buildDashboardCartes_(sheet);
  buildDashboardGraphiques_(sheet);

  sheet.setFrozenRows(2);
  sheet.hideColumns(DASHBOARD_HELPER_COL_MOIS, 6);
}

function buildDashboardTitre_(sheet) {
  var titre = sheet.getRange('A1:F1');
  titre.merge().setValue('DASHBOARD');
  styleTitle_(titre);
  sheet.setRowHeight(1, DESIGN.HEADER_HEIGHT);
}

/** Légende discrète sous le titre (V5.1) — orientation immédiate, style "eyebrow" Notion/Linear. */
function buildDashboardSousTitre_(sheet) {
  var sousTitre = sheet.getRange('A2:F2');
  sousTitre.merge().setValue('Chiffre d\'affaires, marge et charges de l\'exercice en cours');
  stylePageSubtitle_(sousTitre);
  sheet.setRowHeight(2, DESIGN.SUBHEADER_HEIGHT);
}

function buildDashboardCartes_(sheet) {
  var row = 4;
  var width = 2;
  var startCols = [1, 4, 7, 10, 13]; // A, D, G, J, M — colonne C/F/I/L = espace

  var caFormula = annualAmountFormula_(NAMED_RANGES.CHANTIERS_CA_HT);
  var caCell = buildKpiCard_(sheet, row, startCols[0], width, 'CA RÉALISÉ', caFormula, FORMAT_EUR, true);
  setNamedRange_(NAMED_RANGES.DASHBOARD_CA_REALISE, caCell);
  var caA1 = caCell.getA1Notation();

  buildKpiCard_(sheet, row, startCols[1], width, 'OBJECTIF ANNUEL', '=' + NAMED_RANGES.OBJECTIF_CA, FORMAT_EUR, false);

  // V4.1.4 : ces 2 formules sont construites ici directement (pas via
  // avecIferror_, qui ne gère que le cas "corps + repli" simple) —
  // elles doivent donc aussi passer par appel_() (01_Utils.gs) pour le
  // séparateur d'arguments, comme partout ailleurs dans le projet.
  var avancementFormula = '=' + appel_('IFERROR', [caA1 + '/' + NAMED_RANGES.OBJECTIF_CA, '0']);
  buildKpiCard_(sheet, row, startCols[2], width, 'AVANCEMENT', avancementFormula, FORMAT_PERCENT, false);

  buildKpiCard_(sheet, row, startCols[3], width, 'CHARGES FIXES MENSUELLES', '=' + NAMED_RANGES.CHARGES_MENSUELLES, FORMAT_EUR, false);

  // Pas de LET() ici (depuis la V4.1.3) — "debut"/"fin"/"auj"/"ecoule"
  // réinjectés directement.
  var ecartTemps = '(TODAY()-' + NAMED_RANGES.DATE_DEBUT + ')/(' + NAMED_RANGES.DATE_FIN + '-' + NAMED_RANGES.DATE_DEBUT + ')';
  var ecoule = appel_('MAX', [appel_('MIN', [ecartTemps, '1']), '1/365']);
  var previsionFormula = '=' + appel_('IFERROR', [caA1 + '/' + ecoule, '0']);
  buildKpiCard_(sheet, row, startCols[4], width, 'PRÉVISION FIN D\'ANNÉE', previsionFormula, FORMAT_EUR, true);

  sheet.setRowHeight(row, DESIGN.CARD_LABEL_HEIGHT);
  sheet.setRowHeight(row + 1, DESIGN.CARD_HEIGHT);

  return caCell;
}

// Ancrage des 2 graphiques : colonnes/lignes couvertes (voir computeChartSize_).
var DASHBOARD_CHART_ROW = 8;
var DASHBOARD_CHART_ROWSPAN = 14;
var DASHBOARD_CHART_CA_COLSPAN = 7;
var DASHBOARD_CHART_REPARTITION_COLSPAN = 6;

function buildDashboardGraphiques_(sheet) {
  buildDashboardDonneesMensuelles_(sheet);
  buildDashboardDonneesCategories_(sheet);

  var moisRange = sheet.getRange(1, DASHBOARD_HELPER_COL_MOIS, 13, 2);
  var tailleCa = computeChartSize_(sheet, 1, DASHBOARD_CHART_CA_COLSPAN, DASHBOARD_CHART_ROW, DASHBOARD_CHART_ROWSPAN);
  var chartCa = creerGraphiqueBase_(sheet, Charts.ChartType.COLUMN)
    .addRange(moisRange)
    .setPosition(DASHBOARD_CHART_ROW, 1, 0, 0)
    .setOption('title', 'Évolution du CA par mois')
    .setOption('colors', [COLORS.ACCENT])
    .setOption('width', tailleCa.width)
    .setOption('height', tailleCa.height)
    .build();
  sheet.insertChart(chartCa);

  var catCount = PARAM_LISTES.CATEGORIES.values.length;
  var catRange = sheet.getRange(1, DASHBOARD_HELPER_COL_CATEGORIE, catCount + 1, 2);
  var colStartRepartition = 1 + DASHBOARD_CHART_CA_COLSPAN;
  var tailleRepartition = computeChartSize_(sheet, colStartRepartition, DASHBOARD_CHART_REPARTITION_COLSPAN, DASHBOARD_CHART_ROW, DASHBOARD_CHART_ROWSPAN);
  var chartCharges = creerGraphiqueBase_(sheet, Charts.ChartType.PIE)
    .addRange(catRange)
    .setPosition(DASHBOARD_CHART_ROW, colStartRepartition, 0, 0)
    .setOption('title', 'Répartition des charges fixes')
    .setOption('pieHole', 0.5)
    .setOption('legend', { position: 'right', textStyle: { color: COLORS.INK_MUTED, fontSize: DESIGN.NOTE_FONT_SIZE } })
    .setOption('colors', CHART_CATEGORY_COLORS)
    .setOption('width', tailleRepartition.width)
    .setOption('height', tailleRepartition.height)
    .build();
  sheet.insertChart(chartCharges);
}

/** Table cachée Mois / CA réalisé — source du graphique d'évolution du CA. */
function buildDashboardDonneesMensuelles_(sheet) {
  var col = DASHBOARD_HELPER_COL_MOIS;
  sheet.getRange(1, col).setValue('Mois');
  sheet.getRange(1, col + 1).setValue('CA réalisé');

  var moisRange = sheet.getRange(2, col, 12, 1);
  moisRange.setValues(MOIS_LABELS.map(function (m) { return [m]; }));

  for (var i = 0; i < 12; i++) {
    var cell = sheet.getRange(2 + i, col + 1);
    cell.setFormula(monthlyAmountFormula_(NAMED_RANGES.CHANTIERS_CA_HT, i + 1));
    cell.setNumberFormat(FORMAT_EUR);
  }
  protectAsCalculated_(sheet.getRange(2, col + 1, 12, 1));
}

/** Table cachée Catégorie / Montant mensuel — source du graphique de répartition des charges. */
function buildDashboardDonneesCategories_(sheet) {
  var col = DASHBOARD_HELPER_COL_CATEGORIE;
  var categories = PARAM_LISTES.CATEGORIES.values;

  sheet.getRange(1, col).setValue('Catégorie');
  sheet.getRange(1, col + 1).setValue('Montant mensuel');

  var catRange = sheet.getRange(2, col, categories.length, 1);
  catRange.setValues(categories.map(function (c) { return [c]; }));

  for (var i = 0; i < categories.length; i++) {
    var catCell = sheet.getRange(2 + i, col).getA1Notation();
    var montantCell = sheet.getRange(2 + i, col + 1);
    // Un seul argument pour SUMPRODUCT ici (produit via "*") : aucun
    // séparateur de formule requis à ce niveau ; appel_() reste utilisé
    // par cohérence (V4.1.4) et parce que chargesEquivalentMensuelFormula_()
    // en construit déjà en interne.
    montantCell.setFormula('=' + appel_('SUMPRODUCT', [
      '(' + NAMED_RANGES.CHARGES_CATEGORIE + '=' + catCell + ')*(' + chargesEquivalentMensuelFormula_() + ')'
    ]));
    montantCell.setNumberFormat(FORMAT_EUR);
  }
  protectAsCalculated_(sheet.getRange(2, col + 1, categories.length, 1));
}
