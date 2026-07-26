/**
 * Menu personnalisé "Pilotage".
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Pilotage')
    .addItem('🏠 Accueil', 'allerAccueil')
    .addItem('📊 Dashboard', 'allerDashboard')
    .addSeparator()
    .addItem('🔄 Actualiser les listes déroulantes', 'actualiserListes')
    .addItem('✅ Vérifier la structure Chantiers', 'verifierStructureChantiers')
    .addSeparator()
    .addItem('🛠️ Installer / Réinitialiser la structure ERP', 'confirmerEtInstaller')
    .addToUi();
}

function allerAccueil() {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ACCUEIL).activate();
}

function allerDashboard() {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.DASHBOARD).activate();
}

/** Ne fait que ré-appliquer les validations (listes déroulantes) sur Charges. */
function actualiserListes() {
  buildParametres_();
  var sheet = getOrCreateSheet_(SHEETS.CHARGES);
  var namedRanges = buildChargesPlagesNommees_(sheet);
  buildChargesValidations_(sheet, namedRanges);
  toast_('Listes déroulantes actualisées.', 'Pilotage');
}

function confirmerEtInstaller() {
  var ui = SpreadsheetApp.getUi();
  var reponse = ui.alert(
    'Installer / Réinitialiser la structure ERP',
    'Cette action reconstruit la mise en forme et les formules de ' +
    'Paramètres, Charges, Dashboard, Prévisionnel, Analyse et Accueil. ' +
    'Les données déjà saisies (Chantiers, lignes de Charges, réglages) ' +
    'ne sont jamais effacées.\n\nContinuer ?',
    ui.ButtonSet.YES_NO);
  if (reponse === ui.Button.YES) {
    installerERP();
  }
}
