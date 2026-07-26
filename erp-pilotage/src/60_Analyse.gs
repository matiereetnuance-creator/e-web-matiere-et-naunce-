/**
 * Module "07 - Analyse"
 *
 * Exactement trois graphiques, aucun autre indicateur : CA par mois,
 * Marge par mois, Charges par catégorie. Les deux premiers sont
 * calculés ici (table cachée) ; le troisième réutilise directement la
 * répartition des charges déjà calculée sur le Dashboard, pour éviter
 * de dupliquer le même calcul deux fois dans le classeur.
 */

var ANALYSE_HELPER_COL = 10; // J — données mensuelles (masquées)

function buildAnalyse_() {
  var sheet = getOrCreateSheet_(SHEETS.ANALYSE);
  resetSheet_(sheet);

  sheet.setColumnWidths(1, 8, 95); // un seul appel plutôt que 8 (V4.1, perf)

  buildAnalyseTitre_(sheet);
  buildAnalyseDonneesMensuelles_(sheet);
  buildAnalyseGraphiques_(sheet);

  sheet.hideColumns(ANALYSE_HELPER_COL, 3);
}

function buildAnalyseTitre_(sheet) {
  var titre = sheet.getRange('A1:F1');
  titre.merge().setValue('ANALYSE');
  styleTitle_(titre);
  sheet.setRowHeight(1, DESIGN.HEADER_HEIGHT);
}

/**
 * Table cachée Mois / CA / Marge — source des deux premiers
 * graphiques. Formules calculées en JavaScript puis écrites en un
 * seul appel par colonne (au lieu de 12 appels setFormula séparés —
 * V3, audit performance).
 */
function buildAnalyseDonneesMensuelles_(sheet) {
  var col = ANALYSE_HELPER_COL;
  sheet.getRange(1, col).setValue('Mois');
  sheet.getRange(1, col + 1).setValue('CA');
  sheet.getRange(1, col + 2).setValue('Marge');

  var moisRange = sheet.getRange(2, col, 12, 1);
  moisRange.setValues(MOIS_LABELS.map(function (m) { return [m]; }));

  var caFormulas = [];
  var margeFormulas = [];
  for (var i = 0; i < 12; i++) {
    caFormulas.push([monthlyAmountFormula_(NAMED_RANGES.CHANTIERS_CA_HT, i + 1)]);
    margeFormulas.push([monthlyAmountFormula_(NAMED_RANGES.CHANTIERS_MARGE_HT, i + 1)]);
  }

  var caRange = sheet.getRange(2, col + 1, 12, 1);
  var margeRange = sheet.getRange(2, col + 2, 12, 1);
  caRange.setFormulas(caFormulas);
  margeRange.setFormulas(margeFormulas);
  sheet.getRange(2, col + 1, 12, 2).setNumberFormat(FORMAT_EUR);

  protectAsCalculated_(sheet.getRange(2, col + 1, 12, 2));
}

var ANALYSE_CHART_ROWSPAN = 13;
var ANALYSE_CHART_COLSPAN = 7;
var ANALYSE_CHART_CATEGORIES_ROW = 20;

function buildAnalyseGraphiques_(sheet) {
  var col = ANALYSE_HELPER_COL;

  var tailleCa = computeChartSize_(sheet, 1, ANALYSE_CHART_COLSPAN, 3, ANALYSE_CHART_ROWSPAN);
  var chartCa = creerGraphiqueBase_(sheet, Charts.ChartType.COLUMN)
    .addRange(sheet.getRange(1, col, 13, 2)) // Mois, CA
    .setPosition(3, 1, 0, 0)
    .setOption('title', 'CA par mois')
    .setOption('colors', [COLORS.ACCENT])
    .setOption('width', tailleCa.width)
    .setOption('height', tailleCa.height)
    .build();
  sheet.insertChart(chartCa);

  var colStartMarge = 1 + ANALYSE_CHART_COLSPAN;
  var tailleMarge = computeChartSize_(sheet, colStartMarge, ANALYSE_CHART_COLSPAN, 3, ANALYSE_CHART_ROWSPAN);
  var chartMarge = creerGraphiqueBase_(sheet, Charts.ChartType.COLUMN)
    .addRange(sheet.getRange(1, col, 13, 1))     // Mois
    .addRange(sheet.getRange(1, col + 2, 13, 1)) // Marge
    .setPosition(3, colStartMarge, 0, 0)
    .setOption('title', 'Marge par mois')
    .setOption('colors', [COLORS.INK])
    .setOption('width', tailleMarge.width)
    .setOption('height', tailleMarge.height)
    .build();
  sheet.insertChart(chartMarge);

  var dashboard = getRequiredSheet_(SHEETS.DASHBOARD);
  var catCount = PARAM_LISTES.CATEGORIES.values.length;
  var catRange = dashboard.getRange(1, DASHBOARD_HELPER_COL_CATEGORIE, catCount + 1, 2);
  var tailleCharges = computeChartSize_(sheet, 1, ANALYSE_CHART_COLSPAN, ANALYSE_CHART_CATEGORIES_ROW, ANALYSE_CHART_ROWSPAN);
  var chartCharges = creerGraphiqueBase_(sheet, Charts.ChartType.PIE)
    .addRange(catRange)
    .setPosition(ANALYSE_CHART_CATEGORIES_ROW, 1, 0, 0)
    .setOption('title', 'Charges par catégorie')
    .setOption('pieHole', 0.5)
    .setOption('legend', { position: 'right', textStyle: { color: COLORS.INK_MUTED, fontSize: DESIGN.NOTE_FONT_SIZE } })
    .setOption('colors', CHART_CATEGORY_COLORS)
    .setOption('width', tailleCharges.width)
    .setOption('height', tailleCharges.height)
    .build();
  sheet.insertChart(chartCharges);
}
