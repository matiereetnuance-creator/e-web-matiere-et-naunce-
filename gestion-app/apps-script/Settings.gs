/**
 * Accès à la feuille "Settings" — fiche unique (ligne 2), lecture/
 * écriture uniquement. Aucun calcul ici.
 */

var SETTINGS_SHEET = 'Settings';
var SETTINGS_HEADERS = ['objectifAnnuelCA', 'tauxMargeCible', 'chargesFixesMensuelles', 'partFournituresReference', 'arrondirMontants', 'comparaisonN1'];
var SETTINGS_ROW = 2;

/**
 * Valeurs par défaut — utilisées uniquement pour initialiser la ligne
 * 2 si la feuille "Settings" ne contient encore que les en-têtes
 * (classeur livré vide, aucune saisie manuelle attendue). Mêmes
 * valeurs que l'ancien DEFAULT_SETTINGS de settings-repository.ts
 * (Sprint 5) — déplacées ici car Apps Script est désormais la source
 * de vérité du stockage.
 */
var SETTINGS_DEFAULTS = {
  objectifAnnuelCA: 1250000,
  tauxMargeCible: 31,
  chargesFixesMensuelles: 12540,
  partFournituresReference: 28,
  arrondirMontants: true,
  comparaisonN1: true,
};

function settingsRowToObject_(row) {
  return {
    objectifAnnuelCA: Number(row[0]) || 0,
    tauxMargeCible: Number(row[1]) || 0,
    chargesFixesMensuelles: Number(row[2]) || 0,
    partFournituresReference: Number(row[3]) || 0,
    arrondirMontants: toBoolean_(row[4]),
    comparaisonN1: toBoolean_(row[5]),
  };
}

function settingsObjectToRow_(obj) {
  return [obj.objectifAnnuelCA, obj.tauxMargeCible, obj.chargesFixesMensuelles, obj.partFournituresReference, obj.arrondirMontants, obj.comparaisonN1];
}

/**
 * Si la feuille est encore vide (en-têtes seuls, aucune ligne 2), on
 * écrit les valeurs par défaut avant de les renvoyer — c'est la seule
 * "création automatique de données" faite par Apps Script, et ce ne
 * sont que des valeurs de démarrage déjà validées (Sprint 5), pas un
 * calcul.
 */
function getSettings_() {
  var sheet = sheet_(SETTINGS_SHEET);
  if (sheet.getLastRow() < SETTINGS_ROW) {
    return updateSettings_(SETTINGS_DEFAULTS);
  }
  var row = sheet.getRange(SETTINGS_ROW, 1, 1, SETTINGS_HEADERS.length).getValues()[0];
  return settingsRowToObject_(row);
}

function updateSettings_(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(SETTINGS_SHEET);
    sheet.getRange(SETTINGS_ROW, 1, 1, SETTINGS_HEADERS.length).setValues([settingsObjectToRow_(data)]);
    return getSettings_();
  } finally {
    lock.releaseLock();
  }
}

function handleSettingsWrite_(action, body) {
  if (action === 'update') return { ok: true, data: updateSettings_(body.data) };
  return { ok: false, error: 'unknown_action' };
}
