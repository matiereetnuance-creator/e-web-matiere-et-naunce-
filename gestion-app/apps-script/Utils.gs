/**
 * Utilitaires génériques — aucun calcul métier. Uniquement du transport
 * JSON et des helpers de lecture/écriture de lignes Google Sheets.
 */

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Feuille introuvable : ' + name);
  return sheet;
}

/**
 * Convertit une valeur de cellule en booléen. Une case à cocher Sheets
 * (ou TRUE/FALSE saisi tel quel) est déjà lue comme un booléen JS par
 * getValue() ; ce helper couvre aussi le cas où la cellule contient du
 * texte ("true"/"vrai"/1), par prudence si la feuille est éditée à la
 * main sans case à cocher.
 */
function toBoolean_(value) {
  if (typeof value === 'boolean') return value;
  var normalized = String(value || '').trim().toUpperCase();
  return normalized === 'TRUE' || normalized === 'VRAI' || normalized === '1';
}

/**
 * Génère un identifiant lisible et séquentiel (ex. "chantier-0001"),
 * à partir du plus grand suffixe numérique déjà présent dans la
 * colonne "id" de la feuille. Jamais d'UUID (demande explicite du
 * client : identifiants lisibles).
 */
function nextId_(sheet, idColIndex, prefix) {
  var lastRow = sheet.getLastRow();
  var max = 0;
  if (lastRow > 1) {
    var ids = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues();
    var pattern = new RegExp('^' + prefix + '-(\\d+)$');
    ids.forEach(function (r) {
      var match = String(r[0] || '').match(pattern);
      if (match) {
        var n = parseInt(match[1], 10);
        if (n > max) max = n;
      }
    });
  }
  var padded = ('0000' + (max + 1)).slice(-4);
  return prefix + '-' + padded;
}

/** Renvoie le numéro de ligne (1-based) de l'id donné, ou -1 si absent. */
function findRowIndexById_(sheet, idColIndex, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var ids = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // +2 : ligne 1 = en-têtes
  }
  return -1;
}
