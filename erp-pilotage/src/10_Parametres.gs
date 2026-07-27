/**
 * Module "05 - Paramètres"
 *
 * Contient les réglages généraux de l'exercice ainsi que les listes
 * techniques (catégories, TVA, périodicité, oui/non) qui alimentent
 * TOUTES les listes déroulantes du classeur. Rien n'est jamais écrit
 * en dur dans les formules des autres onglets : elles pointent vers
 * les plages nommées créées ici.
 *
 * IMPORTANT : les cellules de saisie (colonne B, lignes 4 à 9 puis
 * 12 à 15) sont des données client. Une réinstallation ne les efface
 * JAMAIS — seules les zones entièrement générées par le script
 * (titre, libellés, bloc de listes techniques, cellule de repli
 * Chantiers) sont effacées puis reconstruites.
 */

/** Construit entièrement la feuille Paramètres (idempotent — voir en-tête de fichier). */
function buildParametres_() {
  var sheet = getOrCreateSheet_(SHEETS.PARAMETRES);

  removeAllProtections_(sheet);
  sheet.setHiddenGridlines(true);

  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidths(3, 4, 24); // un seul appel plutôt que 4 (V4.1, perf)

  // Zones entièrement régénérées par le script (jamais de saisie
  // client) : titre, sous-titres, libellés colonne A, listes
  // techniques, cellule de repli Chantiers (colonne M — V3). La
  // colonne B (lignes 4 à 9 et 12 à 15, cellules de saisie) n'est
  // jamais touchée ici.
  sheet.getRange('A1:B1').breakApart().clearContent().clearFormat();
  sheet.getRange('A2:B2').breakApart().clearContent().clearFormat();
  sheet.getRange('A3').clearContent().clearFormat();
  sheet.getRange('A4:A9').clearContent().clearFormat();
  sheet.getRange('A11').clearContent().clearFormat();
  sheet.getRange('A12:A15').clearContent().clearFormat();
  sheet.getRange('H1:M200').clearContent().clearFormat();

  buildParametresTitre_(sheet);
  buildParametresSousTitre_(sheet);
  buildParametresGeneraux_(sheet);
  buildParametresChantiersMapping_(sheet);
  buildParametresListes_(sheet);
  buildParametresRepliChantiers_(sheet);
  buildParametresMiseEnFormeConditionnelle_(sheet);

  sheet.setFrozenRows(1);
}

/**
 * Écrit un libellé (colonne A) + une cellule de saisie protégée-
 * jamais-écrasée (colonne B), avec validation de saisie optionnelle
 * et note explicative optionnelle.
 *
 * @param {Sheet} sheet
 * @param {number} row
 * @param {string} label
 * @param {string} cell Notation A1 (ex. "B4").
 * @param {string} namedRange Nom de la plage nommée à créer sur cette cellule.
 * @param {string} format Format numérique à appliquer.
 * @param {*} defaultValue Valeur de démarrage si la cellule est vide (null = aucune).
 * @param {DataValidation=} validation Règle de validation stricte à appliquer.
 * @param {string=} note Texte de la note (tooltip) posée sur la cellule.
 */
function buildParametresChampSaisie_(sheet, row, label, cell, namedRange, format, defaultValue, validation, note) {
  var labelRange = sheet.getRange(row, 1);
  labelRange.setValue(label).setFontFamily(FONT).setFontSize(DESIGN.INPUT_FONT_SIZE).setFontColor(COLORS.INK).setVerticalAlignment('middle');

  var input = sheet.getRange(cell);
  var etaitVide = input.isBlank();
  styleInputCell_(input);
  input.setNumberFormat(format).setVerticalAlignment('middle');
  input.setDataValidation(validation || null);
  if (note) input.setNote(note);
  // Valeur de démarrage uniquement si la cellule est réellement vide,
  // pour ne jamais écraser une saisie déjà faite par le client.
  if (etaitVide && defaultValue !== null && defaultValue !== undefined) {
    input.setValue(defaultValue);
  }

  setNamedRange_(namedRange, input);
  sheet.setRowHeight(row, DESIGN.INPUT_ROW_HEIGHT);
}

function buildParametresTitre_(sheet) {
  var titre = sheet.getRange('A1:B1');
  titre.merge().setValue('PARAMÈTRES');
  styleTitle_(titre);
  sheet.setRowHeight(1, DESIGN.HEADER_HEIGHT);
}

/**
 * Légende discrète sous le titre (V5.2) — cohérence avec les autres
 * feuilles. Pas de décalage de ligne ici (contrairement à
 * Charges/Prévisionnel/Analyse) : B4:B9/B12:B15 sont des cellules de
 * saisie réelles du client, jamais déplacées.
 */
function buildParametresSousTitre_(sheet) {
  var sousTitre = sheet.getRange('A2:B2');
  sousTitre.merge().setValue('Réglages de l\'exercice et connexion à vos tableaux');
  stylePageSubtitle_(sousTitre);
  sheet.setRowHeight(2, DESIGN.SUBHEADER_HEIGHT);
}

/** Réglages généraux de l'exercice — chaque champ a sa propre validation stricte (V3). */
function buildParametresGeneraux_(sheet) {
  var sousTitre = sheet.getRange('A3');
  sousTitre.setValue('Paramètres généraux');
  styleSectionHeader_(sousTitre);
  sheet.setRowHeight(3, DESIGN.SECTION_HEADER_HEIGHT);

  var anneeCourante = new Date().getFullYear();
  var rows = [
    { row: 4, label: 'Exercice', cell: PARAM_CELLS.EXERCICE, name: NAMED_RANGES.EXERCICE, format: '0', defaultValue: anneeCourante,
      validation: SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(1900).setAllowInvalid(false).setHelpText('Saisissez une année (nombre entier).').build(),
      note: 'Exercice de référence : détermine l\'année utilisée pour filtrer Chantiers dans tout le classeur.' },
    { row: 5, label: 'Date début', cell: PARAM_CELLS.DATE_DEBUT, name: NAMED_RANGES.DATE_DEBUT, format: FORMAT_DATE, defaultValue: new Date(anneeCourante, 0, 1),
      validation: SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).setHelpText('Saisissez une date valide (jj/mm/aaaa).').build() },
    { row: 6, label: 'Date fin', cell: PARAM_CELLS.DATE_FIN, name: NAMED_RANGES.DATE_FIN, format: FORMAT_DATE, defaultValue: new Date(anneeCourante, 11, 31),
      validation: SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(false).setHelpText('Saisissez une date valide (jj/mm/aaaa).').build() },
    { row: 7, label: 'Objectif CA HT', cell: PARAM_CELLS.OBJECTIF_CA, name: NAMED_RANGES.OBJECTIF_CA, format: FORMAT_EUR, defaultValue: null,
      validation: SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0).setAllowInvalid(false).setHelpText('Saisissez un montant positif ou nul.').build(),
      note: 'Utilisé par le Dashboard (avancement, prévision) et le Prévisionnel (objectif mensuel = ce montant / 12).' },
    { row: 8, label: 'Objectif Marge (%)', cell: PARAM_CELLS.OBJECTIF_MARGE, name: NAMED_RANGES.OBJECTIF_MARGE, format: FORMAT_PERCENT, defaultValue: null,
      validation: SpreadsheetApp.newDataValidation().requireNumberBetween(0, 1).setAllowInvalid(false).setHelpText('Saisissez un pourcentage entre 0 % et 100 %.').build() },
    { row: 9, label: 'Salaire mensuel souhaité', cell: PARAM_CELLS.SALAIRE_MENSUEL, name: NAMED_RANGES.SALAIRE_MENSUEL, format: FORMAT_EUR, defaultValue: null,
      validation: SpreadsheetApp.newDataValidation().requireNumberGreaterThanOrEqualTo(0).setAllowInvalid(false).setHelpText('Saisissez un montant positif ou nul.').build() }
  ];

  rows.forEach(function (r) {
    buildParametresChampSaisie_(sheet, r.row, r.label, r.cell, r.name, r.format, r.defaultValue, r.validation, r.note);
  });
}

/**
 * Section "Connexion à l'onglet Chantiers" : les en-têtes de colonnes
 * attendus dans la feuille Chantiers existante, saisis ici par le
 * client plutôt que codés en dur (voir CHANTIERS_FIELDS,
 * 00_Constantes.gs, et ensureChantiersLinks_(), 30_Chantiers.gs).
 */
function buildParametresChantiersMapping_(sheet) {
  var sousTitre = sheet.getRange('A11');
  sousTitre.setValue('Connexion à l\'onglet Chantiers');
  styleSectionHeader_(sousTitre);
  sheet.setRowHeight(11, DESIGN.SECTION_HEADER_HEIGHT);

  CHANTIERS_FIELDS.forEach(function (f) {
    var note = 'Doit correspondre EXACTEMENT à l\'intitulé de la colonne ' +
      'correspondante dans "03 - Chantiers" (ligne 1). Utilisez Pilotage ▸ ' +
      'Vérifier la structure Chantiers après toute modification.';
    buildParametresChampSaisie_(sheet, f.row, f.label, 'B' + f.row, f.headerNamedRange, '@', f.defaultHeader, null, note);
  });
}

function buildParametresListes_(sheet) {
  var titre = sheet.getRange('H1');
  titre.setValue('Listes techniques (ne pas supprimer)');
  styleSectionHeader_(titre);

  var keys = Object.keys(PARAM_LISTES);
  keys.forEach(function (key) {
    var liste = PARAM_LISTES[key];
    var headerCell = sheet.getRange(liste.col + PARAM_LISTES_HEADER_ROW);
    headerCell.setValue(liste.header).setFontFamily(FONT).setFontSize(DESIGN.TABLE_HEADER_FONT_SIZE).setFontWeight('bold').setFontColor(COLORS.INK_MUTED);

    var firstRow = PARAM_LISTES_FIRST_ROW;
    var lastRow = firstRow + liste.values.length - 1;
    var valuesRange = sheet.getRange(liste.col + firstRow + ':' + liste.col + lastRow);
    valuesRange.setValues(liste.values.map(function (v) { return [v]; }));
    if (key === 'TVA') valuesRange.setNumberFormat(FORMAT_PERCENT_TVA);

    var namedRangeKey = 'LISTE_' + key;
    setNamedRange_(NAMED_RANGES[namedRangeKey], valuesRange);
  });

  // Colonnes techniques masquées (H:M, y compris L en espaceur et M
  // en cellule de repli — voir buildParametresRepliChantiers_) : les
  // plages nommées restent valides une fois les colonnes masquées.
  sheet.hideColumns(8, 6); // H:M
}

/**
 * Cellule technique garantie vide (M1), utilisée comme repli par
 * ensureChantiersLinks_() quand une colonne Chantiers est introuvable
 * — voir NAMED_RANGES.CHANTIERS_FALLBACK (V3, gestion des erreurs).
 */
function buildParametresRepliChantiers_(sheet) {
  var cell = sheet.getRange(PARAM_FALLBACK_CELL);
  cell.clearContent();
  cell.setNote('Cellule technique : toujours vide. Sert de repli sûr si une ' +
    'colonne Chantiers est introuvable, pour éviter une erreur #NOM? dans ' +
    'le classeur (voir CHANTIERS_FIELDS, 00_Constantes.gs).');
  setNamedRange_(NAMED_RANGES.CHANTIERS_FALLBACK, cell);
}

/**
 * Mise en forme conditionnelle sobre (V3) : un réglage obligatoire
 * encore vide (Exercice, dates, Objectif CA HT) reçoit un très léger
 * fond d'attention — jamais de rouge, juste un signal discret.
 */
function buildParametresMiseEnFormeConditionnelle_(sheet) {
  var plage = sheet.getRange('B4:B7');
  var regle = SpreadsheetApp.newConditionalFormatRule()
    .whenCellEmpty()
    .setBackground(COLORS.OBLIGATOIRE_VIDE_BG)
    .setRanges([plage])
    .build();
  sheet.setConditionalFormatRules([regle]);
}
