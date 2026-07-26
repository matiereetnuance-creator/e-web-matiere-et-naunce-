/**
 * Module "04 - Charges"
 *
 * Base des charges fixes. Le tableau (colonnes A:H) est une zone de
 * saisie : une réinstallation ne doit JAMAIS effacer les lignes déjà
 * remplies par le client. Seules la mise en forme, les validations et
 * les deux cartes KPI (haut de page) sont reconstruites à chaque
 * installation.
 */

/** Construit entièrement la feuille Charges (idempotent — voir en-tête de fichier). */
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
  buildChargesMiseEnFormeConditionnelle_(sheet);
}

function buildChargesTitre_(sheet) {
  sheet.getRange('A1:H1').breakApart().clearContent();
  var titreRange = sheet.getRange('A1:C1');
  titreRange.merge().setValue('CHARGES FIXES');
  styleTitle_(titreRange);
  sheet.setRowHeight(1, DESIGN.HEADER_HEIGHT);
}

/** En-tête du tableau, avec notes explicatives sur les colonnes les moins évidentes. */
function buildChargesEnTete_(sheet) {
  var header = sheet.getRange(CHARGES_HEADER_ROW, 1, 1, CHARGES_COLUMNS.length);
  header.setValues([CHARGES_COLUMNS]);
  styleTableHeader_(header);
  sheet.setRowHeight(CHARGES_HEADER_ROW, DESIGN.TABLE_HEADER_HEIGHT);

  sheet.getRange(CHARGES_HEADER_ROW, 5).setNote(
    'Montant HT (hors taxes) uniquement. Le TTC n\'est pas stocké : ' +
    'aucun indicateur actuel n\'en a besoin (voir README).');
  sheet.getRange(CHARGES_HEADER_ROW, 4).setNote(
    'Détermine comment le montant est ramené à un équivalent mensuel ' +
    'dans les 2 cartes ci-dessus.');
  sheet.getRange(CHARGES_HEADER_ROW, 8).setNote(
    'Passez à "Non" pour exclure une charge des totaux sans supprimer ' +
    'la ligne (ex. contrat résilié) — la ligne s\'affiche alors en gris.');
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
 * Formule (protégée par IFERROR) d'équivalent mensuel d'une charge,
 * quelle que soit sa périodicité (ponctuelle exclue du récurrent).
 * Réutilisée pour les deux cartes KPI et pour la répartition par
 * catégorie (Dashboard, puis Analyse qui la réutilise) : la durcir
 * ici (V3) suffit à protéger les deux.
 * @return {string} Corps de formule SANS le "=" initial (voir avecIferror_).
 */
function chargesEquivalentMensuelFormula_() {
  var actif = NAMED_RANGES.CHARGES_ACTIF;
  var periodicite = NAMED_RANGES.CHARGES_PERIODICITE;
  var montant = NAMED_RANGES.CHARGES_MONTANT_HT;
  var corps = [
    'IF(', actif, '<>"Oui", 0,',
    ' IFS(',
    periodicite, '="Mensuelle", ', montant, ',',
    periodicite, '="Trimestrielle", ', montant, '/3,',
    periodicite, '="Annuelle", ', montant, '/12,',
    'TRUE, 0',
    '))'
  ].join('');
  return 'IFERROR(' + corps + ',0)';
}

/**
 * Les 2 cartes KPI n'occupent volontairement pas le même nombre de
 * colonnes de données (2 puis 4) : les colonnes du tableau ci-dessous
 * ont des largeurs très différentes (Libellé a besoin de place,
 * TVA/Actif non), donc aligner les cartes sur le même NOMBRE de
 * colonnes donnerait deux largeurs très inégales (540px vs 300px).
 * Ces largeurs de colonnes donnent au contraire deux cartes de
 * largeur quasi identique (390px vs 380px) — c'est la largeur en
 * pixels qui doit être uniforme (V4), pas le nombre de colonnes.
 */
function buildChargesCartes_(sheet) {
  var mensuelFormula = avecIferror_('LET(mensuel,' + chargesEquivalentMensuelFormula_() + ',SUM(mensuel))', 0);
  var valeurMensuelle = buildKpiCard_(sheet, 3, 1, 2, 'CHARGES MENSUELLES', mensuelFormula, FORMAT_EUR, true);
  setNamedRange_(NAMED_RANGES.CHARGES_MENSUELLES, valeurMensuelle);

  var annuelFormula = avecIferror_(valeurMensuelle.getA1Notation() + '*12', 0);
  var valeurAnnuelle = buildKpiCard_(sheet, 3, 5, 4, 'CHARGES ANNUELLES', annuelFormula, FORMAT_EUR, false);
  setNamedRange_(NAMED_RANGES.CHARGES_ANNUELLES, valeurAnnuelle);

  sheet.setRowHeight(3, DESIGN.CARD_LABEL_HEIGHT);
  sheet.setRowHeight(4, DESIGN.CARD_HEIGHT);
}

/** Listes déroulantes + contrôles de saisie stricts (V3, point validation des données). */
function buildChargesValidations_(sheet, namedRanges) {
  setDropdownFromNamedRange_(namedRanges.categorie, NAMED_RANGES.LISTE_CATEGORIES);
  setDropdownFromNamedRange_(namedRanges.periodicite, NAMED_RANGES.LISTE_PERIODICITE);
  setDropdownFromNamedRange_(namedRanges.tva, NAMED_RANGES.LISTE_TVA);
  setDropdownFromNamedRange_(namedRanges.actif, NAMED_RANGES.LISTE_OUI_NON);

  namedRanges.montant.setNumberFormat(FORMAT_EUR_2DEC);
  namedRanges.montant.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireNumberGreaterThanOrEqualTo(0)
      .setAllowInvalid(false)
      .setHelpText('Le montant HT doit être un nombre positif ou nul.')
      .build());

  namedRanges.tva.setNumberFormat(FORMAT_PERCENT_TVA);

  var dateDebut = sheet.getRange(CHARGES_FIRST_DATA_ROW, 7, CHARGES_LAST_DATA_ROW - CHARGES_FIRST_DATA_ROW + 1, 1);
  dateDebut.setNumberFormat(FORMAT_DATE);
  dateDebut.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .setHelpText('Saisissez une date valide (jj/mm/aaaa).')
      .build());

  styleInputCell_(sheet.getRange(CHARGES_FIRST_DATA_ROW, 1, CHARGES_LAST_DATA_ROW - CHARGES_FIRST_DATA_ROW + 1, CHARGES_COLUMNS.length));
  sheet.setRowHeights(CHARGES_FIRST_DATA_ROW, CHARGES_LAST_DATA_ROW - CHARGES_FIRST_DATA_ROW + 1, DESIGN.TABLE_ROW_HEIGHT);
}

/**
 * Mise en forme conditionnelle sobre (V3) : une charge passée à
 * "Actif = Non" s'efface visuellement (gris très clair) sans jamais
 * utiliser de rouge — elle reste présente et modifiable, seulement
 * exclue des totaux (voir chargesEquivalentMensuelFormula_).
 */
function buildChargesMiseEnFormeConditionnelle_(sheet) {
  var plage = sheet.getRange(CHARGES_FIRST_DATA_ROW, 1, CHARGES_LAST_DATA_ROW - CHARGES_FIRST_DATA_ROW + 1, CHARGES_COLUMNS.length);
  var regle = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$H' + CHARGES_FIRST_DATA_ROW + '="Non"')
    .setBackground(COLORS.INACTIF_BG)
    .setRanges([plage])
    .build();
  sheet.setConditionalFormatRules([regle]);
}
