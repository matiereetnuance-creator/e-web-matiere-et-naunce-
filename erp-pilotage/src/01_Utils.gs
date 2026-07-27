/**
 * ERP Matière & Nuance — Fonctions utilitaires réutilisables.
 *
 * Toute mise en forme, protection ou validation commune aux modules
 * passe par ces fonctions afin d'éviter la duplication de code et de
 * garder une charte graphique cohérente sur l'ensemble du classeur.
 */

var _spreadsheetActifCache_ = null;

/**
 * Classeur actif, mis en cache pour la durée d'une exécution.
 *
 * Chaque installation appelle SpreadsheetApp.getActiveSpreadsheet()
 * des dizaines de fois (une fois par feuille créée/lue, plage nommée
 * posée, etc.). Comme le classeur actif ne change jamais au cours
 * d'une même exécution Apps Script, ce cache évite ces appels
 * redondants au service Sheets (V3 — audit performance). Le cache est
 * réinitialisé à chaque nouvelle exécution du script (portée globale
 * remise à zéro par le moteur Apps Script), jamais de risque de
 * pointer vers un classeur périmé d'une exécution à l'autre.
 *
 * ⚠️ Ne jamais utiliser cette fonction pour manipuler la copie créée
 * par "Nouvel exercice" (85_NouvelExercice.gs) : cette copie n'est
 * PAS le classeur actif, elle doit toujours être référencée par
 * l'objet Spreadsheet retourné par `.copy()`.
 */
function getSpreadsheet_() {
  if (!_spreadsheetActifCache_) {
    _spreadsheetActifCache_ = SpreadsheetApp.getActiveSpreadsheet();
  }
  return _spreadsheetActifCache_;
}

/** Retourne la feuille, en la créant si elle n'existe pas encore. */
function getOrCreateSheet_(name) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Retourne une feuille qui DOIT déjà exister (ex. Chantiers).
 * Lève une erreur explicite sinon plutôt que d'en créer une vide.
 */
function getRequiredSheet_(name) {
  var sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) {
    throw new Error('La feuille "' + name + '" est introuvable. ' +
      'Elle doit exister avant l\'installation (voir 00_Constantes.gs).');
  }
  return sheet;
}

/** Remet une feuille à plat (contenu, mise en forme, validations, protections, graphiques). */
function resetSheet_(sheet) {
  sheet.clear();
  sheet.clearNotes();
  removeAllProtections_(sheet);
  sheet.getCharts().forEach(function (chart) { sheet.removeChart(chart); });
  sheet.setHiddenGridlines(true);
  sheet.setTabColor(null);
}

/** Supprime toutes les protections de plage que le script est autorisé à retirer. */
function removeAllProtections_(sheet) {
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  protections.forEach(function (p) {
    if (p.canEdit()) p.remove();
  });
}

/** Protège une plage calculée (avertissement à l'édition, pas de verrouillage dur). */
function protectAsCalculated_(range, description) {
  var protection = range.protect();
  protection.setDescription(description || PROTECTION_DESCRIPTION);
  protection.setWarningOnly(true);
  return protection;
}

/** Crée (ou remplace) une plage nommée. */
function setNamedRange_(name, range) {
  var ss = getSpreadsheet_();
  var existing = ss.getRangeByName(name);
  if (existing) ss.removeNamedRange(name);
  ss.setNamedRange(name, range);
}

/** Applique le style "titre de feuille" (grand, gras, anthracite) — identique sur les 7 feuilles (V4). */
function styleTitle_(range) {
  range.setFontFamily(FONT)
    .setFontSize(DESIGN.TITLE_FONT_SIZE)
    .setFontWeight('bold')
    .setFontColor(COLORS.INK)
    .setVerticalAlignment('middle');
}

/**
 * Style d'un sous-titre de section (ex. "Paramètres généraux"),
 * partagé pour éviter toute variation involontaire de taille/couleur
 * entre les sections d'une même feuille ou d'une feuille à l'autre (V4).
 */
function styleSubtitle_(range) {
  range.setFontFamily(FONT)
    .setFontSize(DESIGN.SUBTITLE_FONT_SIZE)
    .setFontWeight('bold')
    .setFontColor(COLORS.INK_MUTED)
    .setVerticalAlignment('middle');
}

/** Style d'un libellé de carte KPI (petit, discret, majuscules). */
function styleCardLabel_(range) {
  range.setFontFamily(FONT)
    .setFontSize(DESIGN.KPI_LABEL_FONT_SIZE)
    .setFontWeight('bold')
    .setFontColor(COLORS.INK_MUTED)
    .setVerticalAlignment('middle');
}

/** Style de la valeur d'une carte KPI (grand, anthracite ou accent). */
function styleCardValue_(range, accent) {
  range.setFontFamily(FONT)
    .setFontSize(DESIGN.KPI_VALUE_FONT_SIZE)
    .setFontWeight('bold')
    .setFontColor(accent ? COLORS.ACCENT_TEXT : COLORS.INK)
    .setVerticalAlignment('middle');
}

/**
 * Construit une carte KPI simple : libellé sur la ligne `row`,
 * valeur (formule) sur la ligne `row + 1`, fond gris très clair,
 * bordure fine, valeur protégée car calculée. Toutes les cartes du
 * classeur passent par cette unique fonction — c'est ce qui garantit
 * qu'elles ont exactement le même style (V3, point UX).
 *
 * @param {Sheet} sheet
 * @param {number} row Ligne du libellé (la valeur est sur row + 1).
 * @param {number} col Colonne de départ (1-based).
 * @param {number} width Largeur en colonnes de la carte.
 * @param {string} label Libellé affiché (ex. "CA RÉALISÉ").
 * @param {string} formula Formule complète (avec "="), déjà protégée par avecIferror_ si pertinent.
 * @param {string=} numberFormat Format numérique à appliquer à la valeur.
 * @param {boolean=} accent Si vrai, la valeur est affichée dans la couleur d'accent.
 * @return {Range} la cellule de valeur, pour réutilisation éventuelle.
 */
function buildKpiCard_(sheet, row, col, width, label, formula, numberFormat, accent) {
  var labelRange = sheet.getRange(row, col, 1, width);
  var valueRange = sheet.getRange(row + 1, col, 1, width);
  var cardRange = sheet.getRange(row, col, 2, width);

  labelRange.merge().setValue(label);
  styleCardLabel_(labelRange);

  valueRange.merge().setFormula(formula);
  styleCardValue_(valueRange, accent);
  if (numberFormat) valueRange.setNumberFormat(numberFormat);

  cardRange.setBackground(COLORS.CARD_BG);
  applyThinBorder_(cardRange);
  labelRange.setBackground(COLORS.CARD_BG);
  valueRange.setBackground(COLORS.CARD_BG);
  labelRange.setHorizontalAlignment('left');
  valueRange.setHorizontalAlignment('left');

  protectAsCalculated_(valueRange);

  return valueRange;
}

/** Bordure fine et unie tout autour d'une plage (charte : bordures fines, aucune ombre). */
function applyThinBorder_(range) {
  range.setBorder(true, true, true, true, false, false, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Marque une plage comme cellule de saisie (fond légèrement teinté).
 * V4 : bordure neutre (BORDER_COLOR) plutôt qu'accent — un aplat
 * doré sur 1000 lignes de saisie lisait comme "bruyant" plutôt que
 * discret ; le fond teinté suffit à signaler une zone éditable,
 * l'accent reste réservé aux éléments réellement mis en avant
 * (bouton Accueil, valeurs KPI phares).
 */
function styleInputCell_(range) {
  range.setBackground(COLORS.INPUT_BG);
  range.setBorder(true, true, true, true, false, false, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  range.setFontFamily(FONT).setFontSize(DESIGN.INPUT_FONT_SIZE).setFontColor(COLORS.INK);
}

/** Style d'un en-tête de tableau de données (Charges, Prévisionnel...) — identique partout (V4). */
function styleTableHeader_(range) {
  range.setFontFamily(FONT)
    .setFontSize(DESIGN.TABLE_HEADER_FONT_SIZE)
    .setFontWeight('bold')
    .setFontColor(COLORS.WHITE)
    .setBackground(COLORS.INK)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left');
  protectAsCalculated_(range, 'En-tête de tableau — ne pas modifier');
}

/** Applique une liste déroulante (validation stricte : saisie hors liste refusée) à partir d'une plage nommée. */
function setDropdownFromNamedRange_(range, namedRangeName, allowInvalid) {
  var source = getSpreadsheet_().getRangeByName(namedRangeName);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(source, true)
    .setAllowInvalid(!!allowInvalid)
    .build();
  range.setDataValidation(rule);
}

/**
 * Retourne l'index de colonne (1-based) d'un en-tête dans un tableau
 * d'en-têtes déjà lu (voir ensureChantiersLinks_, qui lit la ligne
 * d'en-tête Chantiers UNE fois et réutilise ce tableau pour ses 4
 * recherches plutôt que de relire la feuille à chaque champ — V3,
 * audit performance).
 *
 * @param {Array<string>} headers Ligne d'en-têtes déjà lue (getValues()[0]).
 * @param {string} headerText En-tête recherché.
 * @return {number} Index 1-based, ou -1 si introuvable.
 */
function findColumnInHeaders_(headers, headerText) {
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === headerText) return i + 1;
  }
  return -1;
}

/** Formats numériques centralisés — jamais de format écrit en dur dans un module de feuille. */
var FORMAT_EUR = '#,##0 €;-#,##0 €';
var FORMAT_EUR_2DEC = '#,##0.00 €;-#,##0.00 €';
var FORMAT_PERCENT = '0.0%';
var FORMAT_PERCENT_TVA = '0.0%';
var FORMAT_DATE = 'dd/mm/yyyy';

/** Affiche un message de confirmation discret (bas d'écran). */
function toast_(message, title) {
  getSpreadsheet_().toast(message, title || 'Pilotage', 4);
}

/**
 * Formule (LET + SUMPRODUCT, protégée par IFERROR) du total d'une
 * valeur Chantiers pour un mois donné de l'exercice en cours. Utilisée
 * par Dashboard, Prévisionnel et Analyse pour éviter toute duplication
 * de logique — la durcir ici (V3) suffit à protéger les trois.
 *
 * @param {string} namedValue Plage nommée de la valeur à sommer (ex. CHANTIERS_CA_HT).
 * @param {number} monthIndex 1 (janvier) à 12 (décembre).
 * @param {string=} extraCondition Facteur SUMPRODUCT additionnel, ex. '(s="Facturé")'.
 * @return {string} Formule complète (avec "=").
 */
function monthlyAmountFormula_(namedValue, monthIndex, extraCondition) {
  var cond = extraCondition ? '*' + extraCondition : '';
  var corps = 'LET(d,' + NAMED_RANGES.CHANTIERS_DATE +
    ',v,' + namedValue +
    ',ex,' + NAMED_RANGES.EXERCICE +
    ',SUMPRODUCT((YEAR(d)=ex)*(MONTH(d)=' + monthIndex + ')*v' + cond + '))';
  return avecIferror_(corps, 0);
}

/**
 * Même principe que monthlyAmountFormula_ mais sur l'exercice entier
 * (sans filtre de mois).
 * @return {string} Formule complète (avec "=").
 */
function annualAmountFormula_(namedValue, extraCondition) {
  var cond = extraCondition ? '*' + extraCondition : '';
  var corps = 'LET(d,' + NAMED_RANGES.CHANTIERS_DATE +
    ',v,' + namedValue +
    ',ex,' + NAMED_RANGES.EXERCICE +
    ',SUMPRODUCT((YEAR(d)=ex)*v' + cond + '))';
  return avecIferror_(corps, 0);
}

/**
 * Point de départ commun à tous les graphiques du classeur (V4) :
 * même police, mêmes couleurs d'axes/légende/grille, même respiration
 * (chartArea) — "un seul style de graphique pour tout le projet".
 * Chaque appelant enchaîne ensuite `.addRange()`, `.setPosition()`,
 * `.setOption('title', …)`, `.setOption('colors', …)` et la taille
 * (`computeChartSize_`), en ne redéfinissant que ce qui lui est propre
 * (ex. `pieHole` pour un anneau, position de légende pour un graphique
 * à plusieurs séries).
 *
 * @param {Sheet} sheet
 * @param {Charts.ChartType} type
 * @return {EmbeddedChartBuilder}
 */
function creerGraphiqueBase_(sheet, type) {
  var texteAxe = { color: COLORS.INK_MUTED, fontSize: DESIGN.NOTE_FONT_SIZE };
  return sheet.newChart()
    .setChartType(type)
    .setOption('fontName', FONT)
    .setOption('backgroundColor', COLORS.WHITE)
    .setOption('titleTextStyle', { color: COLORS.INK, fontSize: DESIGN.SUBTITLE_FONT_SIZE, bold: true })
    .setOption('hAxis', { textStyle: texteAxe, gridlines: { color: COLORS.BORDER }, baselineColor: COLORS.BORDER })
    .setOption('vAxis', { textStyle: texteAxe, gridlines: { color: COLORS.BORDER }, baselineColor: COLORS.BORDER })
    .setOption('legend', { textStyle: texteAxe, position: 'none' })
    .setOption('chartArea', { left: 12, top: 34, right: 12, bottom: 26 });
}

/**
 * Calcule la taille (en pixels) d'un graphique à partir de la
 * géométrie réelle de son ancrage (somme des largeurs de colonnes et
 * hauteurs de lignes couvertes), plutôt qu'une valeur codée en dur.
 * Un graphique Sheets reste un objet de taille fixe une fois posé —
 * il n'existe pas de redimensionnement fluide façon page web — mais
 * cette taille s'adapte automatiquement à la mise en page réelle de
 * la feuille à chaque (ré)installation, au lieu de rester figée sur
 * un chiffre arbitraire indépendant des colonnes qu'elle survole.
 *
 * @param {Sheet} sheet
 * @param {number} colStart 1-based
 * @param {number} colSpan nombre de colonnes couvertes
 * @param {number} rowStart 1-based
 * @param {number} rowSpan nombre de lignes couvertes
 * @return {{width:number, height:number}}
 */
function computeChartSize_(sheet, colStart, colSpan, rowStart, rowSpan) {
  var width = 0;
  for (var c = colStart; c < colStart + colSpan; c++) width += sheet.getColumnWidth(c);
  var height = 0;
  for (var r = rowStart; r < rowStart + rowSpan; r++) height += sheet.getRowHeight(r);
  return { width: width, height: height };
}
