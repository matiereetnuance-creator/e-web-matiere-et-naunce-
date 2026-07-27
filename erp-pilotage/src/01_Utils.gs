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
 * Style H2 — en-tête de section à l'intérieur d'une page (ex.
 * "Paramètres généraux", "Performance de l'exercice"), partagé pour
 * éviter toute variation involontaire de taille/couleur entre les
 * sections d'une même feuille ou d'une feuille à l'autre (V4, taille
 * dédiée depuis le Design System V6 — `SECTION_HEADER_FONT_SIZE`,
 * distincte du sous-titre de page `stylePageSubtitle_()`).
 */
function styleSectionHeader_(range) {
  range.setFontFamily(FONT)
    .setFontSize(DESIGN.SECTION_HEADER_FONT_SIZE)
    .setFontWeight('bold')
    .setFontColor(COLORS.INK_MUTED)
    .setVerticalAlignment('middle');
}

/**
 * Style "Sous-titre" — légende discrète sous le titre principal (H1)
 * d'une feuille (ex. "Chiffre d'affaires, marge et charges de
 * l'exercice en cours"), jamais grasse, à la différence de
 * `styleSectionHeader_()` (H2, en-tête de section) : deux rôles
 * différents dans le Design System (V6), deux styles différents.
 */
function stylePageSubtitle_(range) {
  range.setFontFamily(FONT)
    .setFontSize(DESIGN.SUBTITLE_FONT_SIZE)
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
 * valeur (formule) sur la ligne `row + 1`, fond gris très clair, SANS
 * bordure (V5.1 — style "tuile plate" façon Stripe/Notion : c'est le
 * contraste de fond qui délimite la carte, pas un contour), valeur
 * protégée car calculée. Toutes les cartes du classeur passent par
 * cette unique fonction — c'est ce qui garantit qu'elles ont
 * exactement le même style (V3, point UX).
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
  labelRange.setBackground(COLORS.CARD_BG);
  valueRange.setBackground(COLORS.CARD_BG);
  labelRange.setHorizontalAlignment('left');
  valueRange.setHorizontalAlignment('left');

  protectAsCalculated_(valueRange);

  return valueRange;
}

/**
 * Marque une plage comme cellule de saisie (fond légèrement teinté).
 *
 * V5.1 : diviseur horizontal uniquement (bas de la plage + entre
 * chaque ligne si la plage en couvre plusieurs), plus aucune bordure
 * verticale — la grille complète à 4 côtés (V4) lisait comme "effet
 * tableur Excel" sur les 1000 lignes de Charges ; un simple diviseur
 * de ligne façon tableau d'application moderne (Notion, Linear) reste
 * lisible sans surcharger visuellement. Sur une cellule unique
 * (Paramètres), ce même réglage ne trace qu'un discret soulignement,
 * façon champ de formulaire web.
 */
function styleInputCell_(range) {
  range.setBackground(COLORS.INPUT_BG);
  range.setBorder(false, false, true, false, false, true, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
  range.setFontFamily(FONT).setFontSize(DESIGN.INPUT_FONT_SIZE).setFontColor(COLORS.INK);
}

/**
 * Style visuel d'un en-tête de tableau (fond anthracite, texte blanc
 * gras), SANS protection (V5) — utilisé pour Chantiers, dont ce projet
 * ne doit jamais altérer l'état de protection (feuille du client, non
 * gérée par ce script). Voir `styleTableHeader_()` pour la version
 * protégée utilisée sur les tableaux générés par le script.
 */
function styleTableHeaderVisuel_(range) {
  range.setFontFamily(FONT)
    .setFontSize(DESIGN.TABLE_HEADER_FONT_SIZE)
    .setFontWeight('bold')
    .setFontColor(COLORS.WHITE)
    .setBackground(COLORS.INK)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left');
}

/** Style d'un en-tête de tableau de données (Charges, Prévisionnel...) — identique partout (V4), avec protection avertissement. */
function styleTableHeader_(range) {
  styleTableHeaderVisuel_(range);
  protectAsCalculated_(range, 'En-tête de tableau — ne pas modifier');
}

/**
 * Harmonisation visuelle d'un tableau de saisie existant — Charges et
 * Chantiers, les deux SEULS tableaux de saisie du classeur (V5, règle
 * n°4 du cahier des charges) : gel de la ligne d'en-tête + vue
 * filtrée. Ne touche JAMAIS au contenu, aux en-têtes ni aux colonnes —
 * uniquement de la présentation.
 *
 * @param {Sheet} sheet
 * @param {number} headerRow Ligne d'en-tête (1-based).
 * @param {number} lastDataRow Dernière ligne de données à couvrir (filtre).
 * @param {number} lastCol Dernière colonne du tableau.
 * @param {string} nomVue Nom de la vue filtrée créée/remplacée.
 */
function harmoniserTableauSaisie_(sheet, headerRow, lastDataRow, lastCol, nomVue) {
  sheet.setFrozenRows(headerRow);
  creerVueFiltree_(sheet, headerRow, lastDataRow, lastCol, nomVue);
}

/**
 * Crée (ou remplace) une vue filtrée nommée sur la plage donnée, via le
 * service avancé "Sheets API" (seul moyen d'obtenir une vraie vue
 * filtrée personnelle depuis Apps Script — le service de base
 * SpreadsheetApp n'expose que le filtre classique, partagé). Si ce
 * service n'est pas activé pour ce projet (ou toute autre erreur),
 * repli automatique et silencieux sur un filtre classique
 * (`creerFiltreClassique_`) : l'installation ne doit jamais échouer
 * pour cette seule raison — voir KNOWN_LIMITATIONS.md (fonctionnalité
 * non vérifiée par exécution réelle, cet environnement de
 * développement n'ayant aucun accès à un compte Google).
 */
function creerVueFiltree_(sheet, headerRow, lastDataRow, lastCol, nomVue) {
  try {
    var ss = getSpreadsheet_();
    var sheetId = sheet.getSheetId();
    var meta = Sheets.Spreadsheets.get(ss.getId(), { fields: 'sheets(properties.sheetId,filterViews(filterViewId,title))' });
    var feuilleDistante = (meta.sheets || []).filter(function (s) { return s.properties.sheetId === sheetId; })[0];
    var requetes = [];

    if (feuilleDistante && feuilleDistante.filterViews) {
      feuilleDistante.filterViews
        .filter(function (vue) { return vue.title === nomVue; })
        .forEach(function (vue) { requetes.push({ deleteFilterView: { filterId: vue.filterViewId } }); });
    }

    requetes.push({
      addFilterView: {
        filter: {
          title: nomVue,
          range: {
            sheetId: sheetId,
            startRowIndex: headerRow - 1,
            endRowIndex: lastDataRow,
            startColumnIndex: 0,
            endColumnIndex: lastCol
          }
        }
      }
    });

    Sheets.Spreadsheets.batchUpdate({ requests: requetes }, ss.getId());
  } catch (e) {
    creerFiltreClassique_(sheet, headerRow, lastDataRow, lastCol);
  }
}

/**
 * Repli : filtre classique (partagé) sur la plage donnée, utilisé si
 * le service avancé "Sheets API" n'est pas activé pour ce projet.
 * Idempotent : supprime tout filtre classique déjà posé avant d'en
 * reposer un, pour ne jamais accumuler d'erreur "filtre déjà existant".
 */
function creerFiltreClassique_(sheet, headerRow, lastDataRow, lastCol) {
  var filtreExistant = sheet.getFilter();
  if (filtreExistant) filtreExistant.remove();
  sheet.getRange(headerRow, 1, lastDataRow - headerRow + 1, lastCol).createFilter();
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

var _formulaSepCache_ = null;

/**
 * Séparateur d'arguments de formule pour la locale RÉELLE du classeur
 * (V4.1.4), mis en cache pour la durée d'une exécution (même principe
 * que `getSpreadsheet_()`).
 *
 * Fait confirmé par un test réel sur un classeur en locale française
 * (pas une supposition) : `Range.setFormula()`/`setFormulas()`
 * n'effectue AUCUNE traduction de séparateur — la formule doit déjà
 * contenir le séparateur attendu par la locale du classeur, sous peine
 * de "Erreur d'analyse de formule" (`#ERROR!`), y compris pour une
 * formule aussi simple que `IFERROR(1/0,0)` (échoue) /
 * `IFERROR(1/0;0)` (fonctionne). Ni `LET()` ni aucune fonction en
 * particulier n'est en cause : TOUTE virgule utilisée comme séparateur
 * d'argument est concernée, quelle que soit la fonction (voir
 * CHANGELOG.md V4.1.4 — corrige une attribution erronée à `LET()` en
 * V4.1.3).
 *
 * Détection indépendante de la locale, sans liste de langues à
 * maintenir à la main : `Intl.NumberFormat` (disponible dans le
 * runtime V8 d'Apps Script) indique si la locale du classeur formate
 * les décimales avec une virgule (Sheets attend alors ";" comme
 * séparateur d'arguments) ou un point (Sheets attend alors ",").
 */
function formulaSep_() {
  if (_formulaSepCache_ === null) {
    var locale = getSpreadsheet_().getSpreadsheetLocale() || 'en_US';
    var virguleDecimale = false;
    try {
      virguleDecimale = new Intl.NumberFormat(locale.replace(/_/g, '-')).format(1.5).indexOf(',') !== -1;
    } catch (e) {
      virguleDecimale = false; // Locale non reconnue par Intl : repli prudent sur ",".
    }
    _formulaSepCache_ = virguleDecimale ? ';' : ',';
  }
  return _formulaSepCache_;
}

/**
 * Construit "NOM(arg1<sep>arg2<sep>...)" avec le séparateur de formule
 * de la locale réelle du classeur (V4.1.4) — point de passage unique
 * pour ne plus jamais écrire une virgule en dur entre deux arguments
 * de formule dans ce projet.
 * @param {string} nomFonction Ex. "IFERROR", "SUMPRODUCT", "IFS".
 * @param {Array<string>} args Fragments de formule déjà construits.
 * @return {string} "NOM(...)", sans le "=" initial.
 */
function appel_(nomFonction, args) {
  return nomFonction + '(' + args.join(formulaSep_()) + ')';
}

/**
 * Formule (SUMPRODUCT, protégée par IFERROR) du total d'une valeur
 * Chantiers pour un mois donné de l'exercice en cours. Utilisée par
 * Dashboard, Prévisionnel et Analyse pour éviter toute duplication de
 * logique — la durcir ici (V3) suffit à protéger les trois.
 *
 * N'utilise pas `LET()` (depuis la V4.1.3) : les plages nommées (déjà
 * la seule abstraction nécessaire) sont réinjectées directement, sans
 * alias — résultat rigoureusement identique, `LET` n'apportait qu'un
 * gain de lisibilité. `SUMPRODUCT` ne reçoit ici qu'un seul argument
 * (un produit de facteurs via `*`), donc aucun séparateur de formule
 * n'est nécessaire à ce niveau ; seul l'`IFERROR` englobant
 * (`avecIferror_()`, `03_Erreurs.gs`) en a besoin, et le fournit via
 * `appel_()` (V4.1.4).
 *
 * @param {string} namedValue Plage nommée de la valeur à sommer (ex. CHANTIERS_CA_HT).
 * @param {number} monthIndex 1 (janvier) à 12 (décembre).
 * @param {string=} extraCondition Facteur SUMPRODUCT additionnel, ex. '(s="Facturé")'.
 * @return {string} Formule complète (avec "=").
 */
function monthlyAmountFormula_(namedValue, monthIndex, extraCondition) {
  var cond = extraCondition ? '*' + extraCondition : '';
  var corps = 'SUMPRODUCT((YEAR(' + NAMED_RANGES.CHANTIERS_DATE + ')=' + NAMED_RANGES.EXERCICE +
    ')*(MONTH(' + NAMED_RANGES.CHANTIERS_DATE + ')=' + monthIndex + ')*' + namedValue + cond + ')';
  return avecIferror_(corps, 0);
}

/**
 * Même principe que monthlyAmountFormula_ mais sur l'exercice entier
 * (sans filtre de mois). Voir monthlyAmountFormula_ pour la raison de
 * l'absence de LET() depuis la V4.1.3.
 * @return {string} Formule complète (avec "=").
 */
function annualAmountFormula_(namedValue, extraCondition) {
  var cond = extraCondition ? '*' + extraCondition : '';
  var corps = 'SUMPRODUCT((YEAR(' + NAMED_RANGES.CHANTIERS_DATE + ')=' + NAMED_RANGES.EXERCICE + ')*' +
    namedValue + cond + ')';
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
    // V5.1 : titre allégé (légende discrète, non gras) plutôt qu'un
    // titre gras façon "widget générique" — désencombre le canevas du
    // graphique, cohérent avec l'esprit "épuré" demandé par le client.
    .setOption('titleTextStyle', { color: COLORS.INK_MUTED, fontSize: DESIGN.NOTE_FONT_SIZE, bold: false })
    // V5.2 : quadrillage vertical (hAxis, catégories) masqué — seul le
    // quadrillage horizontal (vAxis, valeurs) reste, utile pour lire
    // les montants ; "peu de quadrillage", demande explicite du client.
    .setOption('hAxis', { textStyle: texteAxe, gridlines: { color: 'transparent' }, baselineColor: COLORS.BORDER })
    .setOption('vAxis', { textStyle: texteAxe, gridlines: { color: COLORS.BORDER }, baselineColor: COLORS.BORDER })
    .setOption('legend', { textStyle: texteAxe, position: 'none' })
    // chartArea n'accepte que left/top/width/height (backgroundColor à
    // part) — ni "right" ni "bottom" ne sont des clés valides de l'API
    // Google Charts ; width/height en pourcentage définissent la marge
    // droite/basse en creux, proportionnellement à la taille réelle du
    // graphique (V4.1.2, chaque graphique ayant une taille différente
    // via computeChartSize_).
    .setOption('chartArea', { left: 12, top: 34, width: '85%', height: '68%' });
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
