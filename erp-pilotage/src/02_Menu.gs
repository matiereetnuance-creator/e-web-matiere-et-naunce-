/**
 * Menu personnalisé "Pilotage".
 */

/** Point d'entrée standard Apps Script : construit le menu à l'ouverture du classeur. */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Pilotage')
    .addItem('🏠 Accueil', 'allerAccueil')
    .addItem('📊 Dashboard', 'allerDashboard')
    .addSeparator()
    .addItem('📄 Exporter un rapport PDF…', 'exporterRapportPdf')
    .addSeparator()
    .addItem('🔄 Actualiser les listes déroulantes', 'actualiserListes')
    .addItem('✅ Vérifier la structure Chantiers', 'verifierStructureChantiers')
    .addItem('🔒 Réappliquer les protections', 'reappliquerProtectionsEtConfirmer')
    .addItem('🩺 Diagnostic', 'diagnosticERP')
    .addItem('🗒️ Afficher le journal', 'afficherJournal')
    .addSeparator()
    .addItem('🆕 Nouvel exercice…', 'assistantNouvelExercice')
    .addSeparator()
    .addSubMenu(ui.createMenu('🛠️ Installation (en 3 étapes)')
      .addItem('1️⃣ Étape 1/3 — Paramètres + Charges', 'confirmerEtInstallerEtape1')
      .addItem('2️⃣ Étape 2/3 — Dashboard + Prévisionnel + Analyse', 'confirmerEtInstallerEtape2')
      .addItem('3️⃣ Étape 3/3 — Finalisation', 'confirmerEtInstallerEtape3'))
    .addSeparator()
    .addItem('ℹ️ À propos…', 'afficherAPropos')
    .addToUi();
}

/** Menu ▸ Accueil : navigue vers la feuille sans jamais planter si elle a été supprimée. */
function allerAccueil() {
  var sheet = getSheetSafe_(SHEETS.ACCUEIL);
  if (!sheet) {
    afficherErreur_('Feuille introuvable',
      'La feuille "' + SHEETS.ACCUEIL + '" est introuvable. Relancez ' +
      'Pilotage ▸ Installation ▸ Étape 3/3 (ou reprenez depuis l\'Étape 1/3 si le classeur est vide).');
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
      'Pilotage ▸ Installation ▸ Étape 2/3 (ou reprenez depuis l\'Étape 1/3 si le classeur est vide).');
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
  enregistrerEvenement_(JOURNAL_TYPES.PROTECTIONS, 'Réappliquées manuellement depuis le menu');
  toast_('Protections réappliquées sur toutes les cellules à formule.', 'Pilotage');
}

/** Menu ▸ Installation ▸ Étape 1/3 : Paramètres + Charges + connexion à Chantiers. */
function confirmerEtInstallerEtape1() {
  var ui = SpreadsheetApp.getUi();
  var reponse = ui.alert(
    'Installation — Étape 1/3 : Paramètres + Charges',
    'Construit/reconstruit Paramètres et Charges, et relie Chantiers par ' +
    'en-tête. Les données déjà saisies (réglages, lignes de Charges) ne ' +
    'sont jamais effacées.\n\nContinuer ?',
    ui.ButtonSet.YES_NO);
  if (reponse !== ui.Button.YES) return;

  try {
    var enTetesManquants = installerEtape1_();
    enregistrerEvenement_(JOURNAL_TYPES.INSTALLATION, 'Étape 1/3 terminée' +
      (enTetesManquants.length ? ' — en-têtes Chantiers manquants : ' + enTetesManquants.join(', ') : ''));
    ui.alert('Étape 1/3 terminée',
      'Paramètres et Charges sont prêts.' + messageEnTetesManquants_(enTetesManquants) +
      '\n\nLancez maintenant Pilotage ▸ Installation ▸ Étape 2/3.',
      ui.ButtonSet.OK);
  } catch (err) {
    signalerErreurInstallation_('Étape 1/3', err);
  }
}

/** Menu ▸ Installation ▸ Étape 2/3 : Dashboard + Prévisionnel + Analyse. */
function confirmerEtInstallerEtape2() {
  var ui = SpreadsheetApp.getUi();
  if (!etapePreteEtape2_()) {
    afficherErreur_('Étape 1/3 requise',
      'Lancez d\'abord Pilotage ▸ Installation ▸ Étape 1/3 (Paramètres + Charges).');
    return;
  }

  var reponse = ui.alert(
    'Installation — Étape 2/3 : Dashboard + Prévisionnel + Analyse',
    'Construit/reconstruit ces 3 feuilles (100% générées, aucune saisie à ' +
    'préserver).\n\nContinuer ?',
    ui.ButtonSet.YES_NO);
  if (reponse !== ui.Button.YES) return;

  try {
    installerEtape2_();
    enregistrerEvenement_(JOURNAL_TYPES.INSTALLATION, 'Étape 2/3 terminée');
    ui.alert('Étape 2/3 terminée',
      'Dashboard, Prévisionnel et Analyse sont prêts.\n\n' +
      'Lancez maintenant Pilotage ▸ Installation ▸ Étape 3/3.',
      ui.ButtonSet.OK);
  } catch (err) {
    signalerErreurInstallation_('Étape 2/3', err);
  }
}

/** Menu ▸ Installation ▸ Étape 3/3 : Accueil + protections + rangement des onglets. */
function confirmerEtInstallerEtape3() {
  var ui = SpreadsheetApp.getUi();
  if (!etapePreteEtape3_()) {
    afficherErreur_('Étape 2/3 requise',
      'Lancez d\'abord Pilotage ▸ Installation ▸ Étape 2/3 (Dashboard + Prévisionnel + Analyse).');
    return;
  }

  var reponse = ui.alert(
    'Installation — Étape 3/3 : Finalisation',
    'Construit Accueil, réapplique les protections et range les onglets ' +
    'dans l\'ordre attendu.\n\nContinuer ?',
    ui.ButtonSet.YES_NO);
  if (reponse !== ui.Button.YES) return;

  try {
    var enTetesManquants = installerEtape3_();
    enregistrerEvenement_(JOURNAL_TYPES.INSTALLATION, 'Installation complète (étape 3/3)' +
      (enTetesManquants.length ? ' — en-têtes Chantiers manquants : ' + enTetesManquants.join(', ') : ''));
    ui.alert('Installation terminée', 'Les 7 feuilles sont prêtes.' + messageEnTetesManquants_(enTetesManquants), ui.ButtonSet.OK);
  } catch (err) {
    signalerErreurInstallation_('Étape 3/3', err);
  }
}
