/**
 * Installation / réinitialisation de l'ERP.
 *
 * Reconstruit la structure, la mise en forme, les formules et les
 * validations de tous les onglets calculés dans le bon ordre (voir
 * ARCHITECTURE.md §4 pour le détail des dépendances). N'efface JAMAIS
 * les données déjà saisies par le client (Chantiers, Charges, réglages
 * de Paramètres) — seules la mise en forme et les formules sont
 * reconstruites. Processus entièrement idempotent : relancer cette
 * fonction 10 fois de suite produit exactement le même résultat que
 * la relancer une fois (voir KNOWN_LIMITATIONS.md pour les garanties
 * et limites de cette idempotence).
 */

/** Construit/reconstruit tout le classeur. Ne lève jamais d'exception non gérée vers l'utilisateur. */
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

    reappliquerProtectionsFormules_();
    ordonnerFeuilles_();

    var accueil = getSheetSafe_(SHEETS.ACCUEIL);
    if (accueil) accueil.activate();

    if (enTetesManquants.length > 0) {
      ui.alert('Installation terminée — action requise',
        'Le classeur a été installé, mais la feuille "' + SHEETS.CHANTIERS +
        '" n\'expose pas les en-têtes suivants :\n\n' + enTetesManquants.join('\n') +
        '\n\nEn attendant la correction, les indicateurs concernés affichent 0 ' +
        '(aucune erreur ne s\'affiche). Ouvrez le menu Pilotage ▸ "Vérifier la ' +
        'structure Chantiers" après correction.', ui.ButtonSet.OK);
    } else {
      toast_('Installation terminée avec succès.', 'Pilotage');
    }
  } catch (err) {
    // Erreur inattendue : on informe clairement plutôt que de laisser
    // remonter une exception technique brute à l'écran.
    afficherErreur_('Erreur d\'installation',
      'L\'installation s\'est arrêtée avant d\'être terminée :\n\n' +
      String(err && err.message ? err.message : err) +
      '\n\nAucune donnée saisie (Chantiers, Charges, Paramètres) n\'a été ' +
      'affectée. Relancez Pilotage ▸ Installer après avoir corrigé la cause, ' +
      'ou consultez Pilotage ▸ Diagnostic.');
  }
}

/** Place les feuilles dans l'ordre attendu (SHEET_ORDER, 00_Constantes.gs). */
function ordonnerFeuilles_() {
  var ss = getSpreadsheet_();
  SHEET_ORDER.forEach(function (name, index) {
    var sheet = ss.getSheetByName(name);
    if (sheet) {
      ss.setActiveSheet(sheet);
      ss.moveActiveSheet(index + 1);
    }
  });
}
