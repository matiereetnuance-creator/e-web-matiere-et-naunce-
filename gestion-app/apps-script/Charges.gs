/**
 * Accès à la feuille "Charges" — lecture/écriture de lignes
 * uniquement. Aucun calcul (Montant HT, TVA...) : ces colonnes
 * dérivées restent la responsabilité exclusive de services/charges.ts
 * côté Next.js.
 */

var CHARGES_SHEET = 'Charges';
var CHARGES_HEADERS = ['id', 'date', 'categorie', 'motif', 'montantTTC', 'tauxTVA', 'periodicite', 'actif'];
var CHARGES_ID_COL = 0;

function chargeRowToObject_(row) {
  return {
    id: String(row[0]),
    date: formatDateCell_(row[1]),
    categorie: String(row[2]),
    motif: String(row[3]),
    montantTTC: Number(row[4]) || 0,
    tauxTVA: Number(row[5]) || 0,
    periodicite: String(row[6]),
    actif: toBoolean_(row[7]),
  };
}

function chargeObjectToRow_(obj) {
  return [obj.id, obj.date, obj.categorie, obj.motif, obj.montantTTC, obj.tauxTVA, obj.periodicite, obj.actif];
}

/**
 * Une cellule de date saisie dans Sheets est lue par getValue() comme
 * un objet Date JS (pas une chaîne) : on la reconvertit ici au format
 * "AAAA-MM-JJ" attendu par ChargeInput.date, sans jamais interpréter
 * ou recalculer la date elle-même.
 */
function formatDateCell_(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value || '');
}

function listCharges_() {
  var sheet = sheet_(CHARGES_SHEET);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, CHARGES_HEADERS.length).getValues();
  return values.map(chargeRowToObject_);
}

function getCharge_(id) {
  var sheet = sheet_(CHARGES_SHEET);
  var rowIndex = findRowIndexById_(sheet, CHARGES_ID_COL, id);
  if (rowIndex === -1) return null;
  var row = sheet.getRange(rowIndex, 1, 1, CHARGES_HEADERS.length).getValues()[0];
  return chargeRowToObject_(row);
}

function createCharge_(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(CHARGES_SHEET);
    var id = nextId_(sheet, CHARGES_ID_COL, 'charge');
    var record = Object.assign({}, data, { id: id });
    sheet.appendRow(chargeObjectToRow_(record));
    return record;
  } finally {
    lock.releaseLock();
  }
}

function updateCharge_(id, data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(CHARGES_SHEET);
    var rowIndex = findRowIndexById_(sheet, CHARGES_ID_COL, id);
    if (rowIndex === -1) return null;
    var record = Object.assign({}, data, { id: id });
    sheet.getRange(rowIndex, 1, 1, CHARGES_HEADERS.length).setValues([chargeObjectToRow_(record)]);
    return record;
  } finally {
    lock.releaseLock();
  }
}

function deleteCharge_(id) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = sheet_(CHARGES_SHEET);
    var rowIndex = findRowIndexById_(sheet, CHARGES_ID_COL, id);
    if (rowIndex === -1) return false;
    sheet.deleteRow(rowIndex);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function handleChargesWrite_(action, body) {
  if (action === 'create') return { ok: true, data: createCharge_(body.data) };
  if (action === 'update') {
    var updated = updateCharge_(body.id, body.data);
    if (!updated) return { ok: false, error: 'not_found' };
    return { ok: true, data: updated };
  }
  if (action === 'delete') {
    var deleted = deleteCharge_(body.id);
    if (!deleted) return { ok: false, error: 'not_found' };
    return { ok: true, data: null };
  }
  return { ok: false, error: 'unknown_action' };
}
