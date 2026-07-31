/**
 * Accès à la feuille "Chantiers" — lecture/écriture de lignes
 * uniquement. Aucun calcul (coût total, marge, %fournitures...) : ces
 * colonnes dérivées restent la responsabilité exclusive de
 * services/chantiers.ts côté Next.js.
 */

var CHANTIERS_SHEET = 'Chantiers';
var CHANTIERS_HEADERS = ['id', 'client', 'nomChantier', 'prixVenduHT', 'fournituresHT', 'sousTraitantHT', 'apporteurHT', 'jours'];
var CHANTIERS_ID_COL = 0;

function chantierRowToObject_(row) {
  return {
    id: String(row[0]),
    client: String(row[1]),
    nomChantier: String(row[2]),
    prixVenduHT: Number(row[3]) || 0,
    fournituresHT: Number(row[4]) || 0,
    sousTraitantHT: Number(row[5]) || 0,
    apporteurHT: Number(row[6]) || 0,
    jours: Number(row[7]) || 0,
  };
}

function chantierObjectToRow_(obj) {
  return [obj.id, obj.client, obj.nomChantier, obj.prixVenduHT, obj.fournituresHT, obj.sousTraitantHT, obj.apporteurHT, obj.jours];
}

function listChantiers_() {
  var sheet = sheet_(CHANTIERS_SHEET);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, CHANTIERS_HEADERS.length).getValues();
  return values.map(chantierRowToObject_);
}

function getChantier_(id) {
  var sheet = sheet_(CHANTIERS_SHEET);
  var rowIndex = findRowIndexById_(sheet, CHANTIERS_ID_COL, id);
  if (rowIndex === -1) return null;
  var row = sheet.getRange(rowIndex, 1, 1, CHANTIERS_HEADERS.length).getValues()[0];
  return chantierRowToObject_(row);
}

function createChantier_(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(CHANTIERS_SHEET);
    var id = nextId_(sheet, CHANTIERS_ID_COL, 'chantier');
    var record = Object.assign({}, data, { id: id });
    sheet.appendRow(chantierObjectToRow_(record));
    return record;
  } finally {
    lock.releaseLock();
  }
}

function updateChantier_(id, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(CHANTIERS_SHEET);
    var rowIndex = findRowIndexById_(sheet, CHANTIERS_ID_COL, id);
    if (rowIndex === -1) return null;
    var record = Object.assign({}, data, { id: id });
    sheet.getRange(rowIndex, 1, 1, CHANTIERS_HEADERS.length).setValues([chantierObjectToRow_(record)]);
    return record;
  } finally {
    lock.releaseLock();
  }
}

function deleteChantier_(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(CHANTIERS_SHEET);
    var rowIndex = findRowIndexById_(sheet, CHANTIERS_ID_COL, id);
    if (rowIndex === -1) return false;
    sheet.deleteRow(rowIndex);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function handleChantiersWrite_(action, body) {
  if (action === 'create') return { ok: true, data: createChantier_(body.data) };
  if (action === 'update') {
    var updated = updateChantier_(body.id, body.data);
    if (!updated) return { ok: false, error: 'not_found' };
    return { ok: true, data: updated };
  }
  if (action === 'delete') {
    var deleted = deleteChantier_(body.id);
    if (!deleted) return { ok: false, error: 'not_found' };
    return { ok: true, data: null };
  }
  return { ok: false, error: 'unknown_action' };
}
