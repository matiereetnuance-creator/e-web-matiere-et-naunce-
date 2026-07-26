/**
 * Installation en 3 étapes (V4.1).
 *
 * Sur un compte Google gratuit, Apps Script limite une exécution à
 * 6 minutes. Construire les 7 feuilles en un seul appel (l'ancien
 * `installerERP()`, jusqu'à la V4.0) pouvait dépasser cette limite
 * lors d'une toute première installation sur un classeur vierge.
 * L'installation est donc découpée en 3 étapes indépendantes, chacune
 * lancée par un clic de menu séparé — donc une exécution Apps Script
 * séparée, avec son propre budget de 6 minutes :
 *
 *   Étape 1/3 : Paramètres + Charges + connexion à Chantiers
 *   Étape 2/3 : Dashboard + Prévisionnel + Analyse
 *   Étape 3/3 : Accueil + protections + rangement des onglets
 *
 * Chaque étape vérifie que la précédente a bien été exécutée (elle ne
 * construit rien tant que ce n'est pas le cas — voir
 * `etapePreteEtape2_()` / `etapePreteEtape3_()`) et reste, comme
 * avant, entièrement idempotente : relancer une étape seule à
 * n'importe quel moment ne touche jamais aux données déjà saisies
 * (Chantiers, lignes de Charges, réglages de Paramètres) et ne casse
 * pas les étapes déjà construites (voir ARCHITECTURE.md §4).
 */

/** Étape 1/3 : Paramètres, Charges, connexion à Chantiers. Retourne les en-têtes Chantiers manquants. */
function installerEtape1_() {
  buildParametres_();
  buildCharges_();
  return ensureChantiersLinks_();
}

/** Étape 2/3 : Dashboard, Prévisionnel, Analyse — suppose l'étape 1 déjà faite. */
function installerEtape2_() {
  buildDashboard_();
  buildPrevisionnel_();
  buildAnalyse_();
}

/** Étape 3/3 : Accueil, protections, rangement des onglets. Retourne les en-têtes Chantiers encore manquants. */
function installerEtape3_() {
  buildAccueil_();
  reappliquerProtectionsFormules_();
  ordonnerFeuilles_();

  var accueil = getSheetSafe_(SHEETS.ACCUEIL);
  if (accueil) accueil.activate();

  return ensureChantiersLinks_(); // relit l'état courant pour le message final
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

/** Vrai si l'étape 1 semble avoir été exécutée (Paramètres + Charges construits). */
function etapePreteEtape2_() {
  return !!getNamedRangeSafe_(NAMED_RANGES.OBJECTIF_CA) && !!getNamedRangeSafe_(NAMED_RANGES.CHARGES_MENSUELLES);
}

/** Vrai si l'étape 2 semble avoir été exécutée (Dashboard construit). */
function etapePreteEtape3_() {
  return !!getNamedRangeSafe_(NAMED_RANGES.DASHBOARD_CA_REALISE);
}

/**
 * Message d'action pour des en-têtes Chantiers introuvables, ou
 * chaîne vide si tout va bien. Partagé par les 3 boîtes de dialogue
 * de fin d'étape pour éviter de répéter le même texte.
 */
function messageEnTetesManquants_(enTetesManquants) {
  if (!enTetesManquants.length) return '';
  return '\n\n⚠️ En-têtes Chantiers introuvables : ' + enTetesManquants.join(', ') +
    '\nEn attendant la correction (Paramètres!B12:B15, section "Connexion à ' +
    'l\'onglet Chantiers"), les indicateurs concernés affichent 0 — aucune erreur ne s\'affiche.';
}

/** Consigne l'échec au journal et affiche un message clair plutôt qu'une exception brute. */
function signalerErreurInstallation_(etape, err) {
  var messageErreur = String(err && err.message ? err.message : err);
  enregistrerEvenement_(JOURNAL_TYPES.ERREUR, 'Installation ' + etape + ' interrompue : ' + messageErreur);
  afficherErreur_('Erreur d\'installation — ' + etape,
    'Cette étape s\'est arrêtée avant d\'être terminée :\n\n' + messageErreur +
    '\n\nAucune donnée saisie (Chantiers, Charges, Paramètres) n\'a été affectée. ' +
    'Corrigez la cause puis relancez cette étape, ou consultez Pilotage ▸ Diagnostic.');
}
