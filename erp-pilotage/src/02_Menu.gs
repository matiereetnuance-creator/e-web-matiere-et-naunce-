/**
 * Menu personnalisé "Pilotage".
 */

/** Point d'entrée standard Apps Script : construit le menu à l'ouverture du classeur. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Pilotage')
    .addItem('🏠 Accueil', 'allerAccueil')
    .addItem('📊 Dashboard', 'allerDashboard')
    .addSeparator()
    .addItem('🔄 Actualiser les listes déroulantes', 'actualiserListes')
    .addItem('✅ Vérifier la structure Chantiers', 'verifierStructureChantiers')
    .addItem('🔒 Réappliquer les protections', 'reappliquerProtectionsEtConfirmer')
    .addItem('🩺 Diagnostic', 'diagnosticERP')
    .addSeparator()
    .addItem('🆕 Nouvel exercice…', 'assistantNouvelExercice')
    .addSeparator()
    .addItem('🛠️ Installer / Réinitialiser la structure ERP', 'confirmerEtInstaller')
    .addToUi();
}

/** Menu ▸ Accueil : navigue vers la feuille sans jamais planter si elle a été supprimée. */
function allerAccueil() {
  var sheet = getSheetSafe_(SHEETS.ACCUEIL);
  if (!sheet) {
    afficherErreur_('Feuille introuvable',
      'La feuille "' + SHEETS.ACCUEIL + '" est introuvable. Relancez ' +
      'Pilotage ▸ Installer / Réinitialiser la structure ERP.');
    return;
  }
  sheet.activate();
}

/** Menu ▸ Dashboard : navigue vers la feuille sans jamais planter si elle a été supprimée. */
function allerDashboard() {
  var sheet = getSheetSafe_(SHEETS.DASHBOARD);
  if (!sheet) {
    afficherErreur_('Feuille introuvable',
      'La feuille "' + SHEETS.DASHBOARD + '" est introuvable. Relancez ' +
      'Pilotage ▸ Installer / Réinitialiser la structure ERP.');
    return;
  }
  sheet.activate();
}

/** Menu ▸ Actualiser les listes déroulantes : ne fait que ré-appliquer les validations sur Charges. */
function actualiserListes() {
  buildParametres_();
  var sheet = getOrCreateSheet_(SHEETS.CHARGES);
  var namedRanges = buildChargesPlagesNommees_(sheet);
  buildChargesValidations_(sheet, namedRanges);
  toast_('Listes déroulantes actualisées.', 'Pilotage');
}

/** Menu ▸ Réappliquer les protections : ré-arme le filet de sécurité sans reconstruire les feuilles. */
function reappliquerProtectionsEtConfirmer() {
  reappliquerProtectionsFormules_();
  toast_('Protections réappliquées sur toutes les cellules à formule.', 'Pilotage');
}

/** Menu ▸ Installer / Réinitialiser : demande confirmation avant de lancer installerERP(). */
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
