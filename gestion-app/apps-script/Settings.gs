/**
 * Accès à la feuille "Settings" — fiche unique (ligne 2), lecture/
 * écriture uniquement. Aucun calcul ici.
 */

var SETTINGS_SHEET = 'Settings';
var SETTINGS_HEADERS = ['objectifAnnuelCA', 'tauxMargeCible', 'chargesFixesMensuelles', 'partFournituresReference', 'arrondirMontants', 'comparaisonN1'];
var SETTINGS_ROW = 2;

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

function getSettings_() {
  var sheet = sheet_(SETTINGS_SHEET);
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
