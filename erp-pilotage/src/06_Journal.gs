/**
 * Journal technique interne (V4).
 *
 * Enregistre les événements importants (installation, diagnostic,
 * nouvel exercice, réappliquer protections, erreur…) dans les
 * Document Properties du classeur — jamais dans une feuille visible,
 * jamais exporté. Les Document Properties sont un stockage clé/valeur
 * propre au fichier, invisible à l'utilisateur final, exactement ce
 * qu'il faut pour une trace technique qui ne doit pas polluer le
 * classeur (contrainte explicite de la V4).
 *
 * Limité aux JOURNAL_MAX_EVENTS plus récents (une Document Property
 * est plafonnée à 9 Ko) ; Pilotage ▸ Afficher le journal
 * (`afficherJournal()`) n'en montre que les 20 plus récents, comme
 * demandé.
 */

var JOURNAL_PROPERTY_KEY = 'PILOTAGE_JOURNAL_V1';
var JOURNAL_MAX_EVENTS = 100;
var JOURNAL_AFFICHAGE_COUNT = 20;

var JOURNAL_TYPES = {
  INSTALLATION: 'Installation',
  DIAGNOSTIC: 'Diagnostic',
  NOUVEL_EXERCICE: 'Nouvel exercice',
  PROTECTIONS: 'Protections réappliquées',
  EXPORT_PDF: 'Export PDF',
  ERREUR: 'Erreur'
};

/**
 * Ajoute un événement au journal. N'échoue jamais bruyamment : une
 * erreur d'écriture des Document Properties ne doit pas empêcher
 * l'opération métier en cours (installation, diagnostic...).
 *
 * @param {string} type Voir JOURNAL_TYPES.
 * @param {string=} details Complément court, lisible par un humain.
 */
function enregistrerEvenement_(type, details) {
  try {
    var journal = lireJournal_();
    journal.push({ date: new Date().toISOString(), type: type, details: details || '' });
    if (journal.length > JOURNAL_MAX_EVENTS) {
      journal = journal.slice(journal.length - JOURNAL_MAX_EVENTS);
    }
    PropertiesService.getDocumentProperties().setProperty(JOURNAL_PROPERTY_KEY, JSON.stringify(journal));
  } catch (e) {
    // Le journal est un outil de diagnostic, pas une donnée critique :
    // on ignore silencieusement plutôt que de faire échouer l'appelant.
  }
}

/** Lit le journal complet (du plus ancien au plus récent). Ne lève jamais d'exception. */
function lireJournal_() {
  try {
    var brut = PropertiesService.getDocumentProperties().getProperty(JOURNAL_PROPERTY_KEY);
    return brut ? JSON.parse(brut) : [];
  } catch (e) {
    return [];
  }
}

/** Dernier événement d'un type donné (voir JOURNAL_TYPES), ou `null` si aucun. */
function dernierEvenement_(type) {
  var journal = lireJournal_();
  for (var i = journal.length - 1; i >= 0; i--) {
    if (journal[i].type === type) return journal[i];
  }
  return null;
}

/** Date ISO d'un événement → date/heure locale lisible. Partagée avec 07_APropos.gs. */
function formaterDateEvenement_(dateIso) {
  return Utilities.formatDate(new Date(dateIso), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
}

/** Formate un événement pour affichage humain (date locale + type + détails). */
function formaterEvenementJournal_(evenement) {
  return formaterDateEvenement_(evenement.date) + '  —  ' + evenement.type +
    (evenement.details ? ' : ' + evenement.details : '');
}

/** Menu ▸ Afficher le journal : les JOURNAL_AFFICHAGE_COUNT événements les plus récents. */
function afficherJournal() {
  var ui = SpreadsheetApp.getUi();
  var recents = lireJournal_().slice(-JOURNAL_AFFICHAGE_COUNT).reverse();

  if (recents.length === 0) {
    ui.alert('🗒️ Journal technique', 'Aucun événement enregistré pour le moment.', ui.ButtonSet.OK);
    return;
  }

  var texte = recents.map(formaterEvenementJournal_).join('\n');
  ui.alert('🗒️ Journal technique — ' + recents.length + ' derniers événements', texte, ui.ButtonSet.OK);
}
