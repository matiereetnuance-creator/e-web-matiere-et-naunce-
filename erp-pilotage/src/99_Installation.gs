/**
 * Installation / réinitialisation de l'ERP.
 *
 * Reconstruit la structure, la mise en forme, les formules et les
 * validations de tous les onglets calculés dans le bon ordre. N'efface
 * JAMAIS les données déjà saisies par le client (Chantiers, Charges,
 * réglages de Paramètres) — seules la mise en forme et les formules
 * sont reconstruites.
 */

function installerERP() {
  var ui = SpreadsheetApp.getUi();
  try {
    buildParametres_();
    buildCharges_();

    var enTetesManquants = ensureChantiersLinks_();

    buildDashboard_();
    buildPrevisionnel_();
    buildAnalyse_();
    buildAccueil_();

    ordonnerFeuilles_();
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.ACCUEIL).activate();

    if (enTetesManquants.length > 0) {
      ui.alert('Installation terminée — action requise',
        'Le classeur a été installé, mais la feuille "' + SHEETS.CHANTIERS +
        '" n\'expose pas les en-têtes suivants :\n\n' + enTetesManquants.join('\n') +
        '\n\nOuvrez le menu Pilotage ▸ "Vérifier la structure Chantiers" ' +
        'après correction.', ui.ButtonSet.OK);
    } else {
      toast_('Installation terminée avec succès.', 'Pilotage');
    }
  } catch (err) {
    ui.alert('Erreur d\'installation', String(err && err.message ? err.message : err), ui.ButtonSet.OK);
    throw err;
  }
}

function ordonnerFeuilles_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_ORDER.forEach(function (name, index) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(index + 1);
    }
  });
}
