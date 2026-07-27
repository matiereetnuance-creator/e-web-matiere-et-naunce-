/**
 * Mode Diagnostic (V3, point tests).
 *
 * Menu Pilotage ▸ Diagnostic : vérifie automatiquement l'intégrité du
 * classeur (feuilles, plages nommées, protections, mapping Chantiers,
 * paramètres obligatoires, graphiques, listes déroulantes) et affiche
 * un rapport clair dans une boîte de dialogue.
 *
 * Purement en lecture, à une exception près : la vérification
 * Chantiers réutilise ensureChantiersLinks_() (30_Chantiers.gs), qui
 * met à jour les plages nommées CHANTIERS_* si nécessaire — un
 * comportement déjà établi ailleurs dans le projet, jamais une
 * modification de la feuille Chantiers elle-même.
 */

var DIAGNOSTIC_GRAPHIQUES_ATTENDUS = {};
DIAGNOSTIC_GRAPHIQUES_ATTENDUS[SHEETS.DASHBOARD] = 2;
DIAGNOSTIC_GRAPHIQUES_ATTENDUS[SHEETS.PREVISIONNEL] = 1;
DIAGNOSTIC_GRAPHIQUES_ATTENDUS[SHEETS.ANALYSE] = 3;

/** Menu ▸ Diagnostic : lance tous les contrôles et affiche le rapport dans une boîte de dialogue. */
function diagnosticERP() {
  var sections = [
    diagnostiquerFeuilles_(),
    diagnostiquerPlagesNommees_(),
    diagnostiquerProtections_(),
    diagnostiquerChantiers_(),
    diagnostiquerParametresObligatoires_(),
    diagnostiquerGraphiques_(),
    diagnostiquerListes_(),
    diagnostiquerHarmonisationVisuelle_()
  ];

  var total = 0;
  var reussis = 0;
  sections.forEach(function (s) { total += s.total; reussis += s.ok; });

  var entete = (reussis === total ? '✅' : '⚠️') + ' ' + reussis + '/' + total + ' contrôles réussis\n' +
    '════════════════════════\n\n';
  var corps = sections.map(function (s) { return s.texte; }).join('\n\n');

  enregistrerEvenement_(JOURNAL_TYPES.DIAGNOSTIC, reussis + '/' + total + ' contrôles réussis');

  var ui = SpreadsheetApp.getUi();
  ui.alert('🩺 Diagnostic Pilotage', entete + corps, ui.ButtonSet.OK);
}

/**
 * Construit une section de rapport à partir d'une liste de contrôles
 * {label, ok}. Fonction partagée par tous les diagnostiquer*_()
 * ci-dessous pour éviter de dupliquer la mise en forme (V3, point 7).
 *
 * @param {string} titre
 * @param {Array<{label:string, ok:boolean}>} verifications
 * @return {{texte:string, total:number, ok:number}}
 */
function creerRapportSection_(titre, verifications) {
  var lignes = verifications.map(function (v) { return (v.ok ? '✓ ' : '✗ ') + v.label; });
  var reussis = verifications.filter(function (v) { return v.ok; }).length;
  return {
    texte: titre + '\n' + lignes.join('\n'),
    total: verifications.length,
    ok: reussis
  };
}

/** ✓ Les 7 feuilles du classeur existent-elles ? */
function diagnostiquerFeuilles_() {
  var verifications = SHEET_ORDER.map(function (nom) {
    return { label: nom, ok: !!getSheetSafe_(nom) };
  });
  return creerRapportSection_('📁 Feuilles', verifications);
}

/** ✓ Toutes les plages nommées attendues existent-elles ? */
function diagnostiquerPlagesNommees_() {
  var noms = Object.keys(NAMED_RANGES).map(function (k) { return NAMED_RANGES[k]; });
  var verifications = noms.map(function (nom) {
    return { label: nom, ok: !!getNamedRangeSafe_(nom) };
  });
  return creerRapportSection_('🏷️ Plages nommées', verifications);
}

/** ✓ Chaque feuille générée a-t-elle au moins une protection active ? */
function diagnostiquerProtections_() {
  var feuillesAVerifier = [SHEETS.ACCUEIL, SHEETS.DASHBOARD, SHEETS.CHARGES, SHEETS.PARAMETRES, SHEETS.PREVISIONNEL, SHEETS.ANALYSE];
  var verifications = feuillesAVerifier.map(function (nom) {
    var sheet = getSheetSafe_(nom);
    var nbProtections = sheet ? sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE).length : 0;
    return { label: nom + ' (' + nbProtections + ' protection(s))', ok: nbProtections > 0 };
  });
  return creerRapportSection_('🔒 Protections', verifications);
}

/** ✓ Les colonnes Chantiers attendues (Paramètres!B12:B15) sont-elles trouvées ? */
function diagnostiquerChantiers_() {
  var manquants = ensureChantiersLinks_();
  var verifications = CHANTIERS_FIELDS.map(function (f) {
    var header = getChantiersFieldHeader_(f);
    var estManquant = manquants.some(function (m) { return m.indexOf(header) === 0; });
    return { label: f.label + ' → "' + header + '"', ok: !estManquant };
  });
  return creerRapportSection_('🏗️ Colonnes Chantiers', verifications);
}

/** ✓ Les réglages indispensables au calcul des indicateurs sont-ils renseignés ? */
function diagnostiquerParametresObligatoires_() {
  var verifications = [
    { label: 'Exercice', ok: !!getNamedValueSafe_(NAMED_RANGES.EXERCICE, '') },
    { label: 'Date début', ok: !!getNamedValueSafe_(NAMED_RANGES.DATE_DEBUT, '') },
    { label: 'Date fin', ok: !!getNamedValueSafe_(NAMED_RANGES.DATE_FIN, '') },
    { label: 'Objectif CA HT', ok: !!getNamedValueSafe_(NAMED_RANGES.OBJECTIF_CA, '') }
  ];
  return creerRapportSection_('⚙️ Paramètres obligatoires', verifications);
}

/** ✓ Chaque feuille a-t-elle le nombre de graphiques attendu ? */
function diagnostiquerGraphiques_() {
  var verifications = Object.keys(DIAGNOSTIC_GRAPHIQUES_ATTENDUS).map(function (nom) {
    var sheet = getSheetSafe_(nom);
    var attendu = DIAGNOSTIC_GRAPHIQUES_ATTENDUS[nom];
    var trouve = sheet ? sheet.getCharts().length : 0;
    return { label: nom + ' : ' + trouve + '/' + attendu + ' graphique(s)', ok: trouve === attendu };
  });
  return creerRapportSection_('📈 Graphiques', verifications);
}

/**
 * ✓ Charges et Chantiers ont-ils bien leur ligne d'en-tête gelée et un
 * filtre actif (vue filtrée ou, à défaut, filtre classique — V5, règle
 * n°4) ? Purement en lecture, y compris pour Chantiers.
 */
function diagnostiquerHarmonisationVisuelle_() {
  var feuilles = [
    { nom: SHEETS.CHARGES, headerRow: CHARGES_HEADER_ROW },
    { nom: SHEETS.CHANTIERS, headerRow: CHANTIERS_HEADER_ROW }
  ];
  var verifications = [];
  feuilles.forEach(function (f) {
    var sheet = getSheetSafe_(f.nom);
    verifications.push({ label: f.nom + ' — en-tête gelé', ok: !!sheet && sheet.getFrozenRows() >= f.headerRow });
    verifications.push({ label: f.nom + ' — filtre actif', ok: !!sheet && (!!sheet.getFilter() || possedeVueFiltree_(sheet)) });
  });
  return creerRapportSection_('🎛️ Harmonisation visuelle', verifications);
}

/** Vrai si la feuille possède au moins une vue filtrée (service avancé Sheets API — voir creerVueFiltree_, 01_Utils.gs). */
function possedeVueFiltree_(sheet) {
  try {
    var meta = Sheets.Spreadsheets.get(getSpreadsheet_().getId(), { fields: 'sheets(properties.sheetId,filterViews.filterViewId)' });
    var feuilleDistante = (meta.sheets || []).filter(function (s) { return s.properties.sheetId === sheet.getSheetId(); })[0];
    return !!feuilleDistante && !!feuilleDistante.filterViews && feuilleDistante.filterViews.length > 0;
  } catch (e) {
    return false;
  }
}

/** ✓ Les listes techniques (Paramètres, colonnes masquées) contiennent-elles des valeurs ? */
function diagnostiquerListes_() {
  var cles = ['LISTE_CATEGORIES', 'LISTE_TVA', 'LISTE_PERIODICITE', 'LISTE_OUI_NON'];
  var verifications = cles.map(function (cle) {
    var range = getNamedRangeSafe_(NAMED_RANGES[cle]);
    var valeurs = range ? range.getValues().filter(function (row) { return row[0] !== '' && row[0] !== null; }) : [];
    return { label: cle + ' (' + valeurs.length + ' valeur(s))', ok: valeurs.length > 0 };
  });
  return creerRapportSection_('📋 Listes déroulantes', verifications);
}
