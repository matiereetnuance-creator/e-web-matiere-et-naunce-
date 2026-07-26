/**
 * Protection des données (V3).
 *
 * Chaque module protège déjà explicitement ses propres cellules
 * calculées au moment de leur construction (buildKpiCard_,
 * styleTableHeader_, protectAsCalculated_ appelés directement). Ce
 * fichier ajoute un filet de sécurité générique et indépendant :
 * `reappliquerProtectionsFormules_()` balaie chaque feuille gérée par
 * ce projet et protège toute cellule contenant une formule qui n'est
 * ni déjà protégée, ni dans une plage éditable (EDITABLE_RANGES,
 * 00_Constantes.gs) — utile si un développeur futur oublie de
 * protéger une cellule dans un nouveau module. La feuille Chantiers
 * est systématiquement exclue : ce projet ne la protège, ni ne la
 * modifie, jamais.
 *
 * ⚠️ Cette fonction n'efface JAMAIS les protections existantes avant
 * de balayer : certaines (ex. les cartes KPI fusionnées sur plusieurs
 * colonnes, protégées par buildKpiCard_ directement sur l'objet Range
 * fusionné) couvrent des cellules dont `getFormulas()` renvoie une
 * valeur vide pour tout sauf la cellule en haut à gauche de la fusion
 * — un simple balayage de formules ne saurait pas les reconstruire à
 * l'identique. Ne pas y toucher est donc ce qui rend cette fonction
 * sûre à appeler autant de fois que voulu (idempotence, point 8).
 *
 * Appelée automatiquement en fin d'installerERP() (99_Installation.gs)
 * et disponible en menu (02_Menu.gs) pour un ré-armement manuel.
 */

/** Réapplique les protections sur toutes les cellules à formule de toutes les feuilles gérées. */
function reappliquerProtectionsFormules_() {
  SHEET_ORDER.forEach(function (nom) {
    if (nom === SHEETS.CHANTIERS) return;
    var sheet = getSheetSafe_(nom);
    if (!sheet) return;
    protegerCellulesAFormule_(sheet, EDITABLE_RANGES[nom] || []);
  });
}

/**
 * Protège, par segments de colonnes contiguës, les cellules à formule
 * d'une feuille qui ne sont ni déjà protégées, ni listées dans
 * `plagesEditablesA1`. Regroupe les cellules adjacentes en une seule
 * Protection par segment plutôt que d'en créer une par cellule, et lit
 * les formules ainsi que les protections existantes en un seul appel
 * chacune (V3, audit performance).
 *
 * @param {Sheet} sheet
 * @param {Array<string>} plagesEditablesA1 Notations A1 (ex. ['B4:B9']).
 */
function protegerCellulesAFormule_(sheet, plagesEditablesA1) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow === 0 || lastCol === 0) return;

  var plagesEditables = plagesEditablesA1.map(function (a1) { return sheet.getRange(a1); });
  var plagesDejaProtegees = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE)
    .map(function (p) { return p.getRange(); });
  var formules = sheet.getRange(1, 1, lastRow, lastCol).getFormulas();

  for (var r = 0; r < formules.length; r++) {
    var row = r + 1;
    var c = 0;
    while (c < formules[r].length) {
      if (!celluleANProteger_(formules[r][c], row, c + 1, plagesEditables, plagesDejaProtegees)) {
        c++;
        continue;
      }
      var debut = c;
      while (c < formules[r].length &&
        celluleANProteger_(formules[r][c], row, c + 1, plagesEditables, plagesDejaProtegees)) {
        c++;
      }
      protectAsCalculated_(sheet.getRange(row, debut + 1, 1, c - debut));
    }
  }
}

/** Vrai si la cellule contient une formule, n'est pas éditable et n'est pas déjà protégée. */
function celluleANProteger_(formule, row, col, plagesEditables, plagesDejaProtegees) {
  if (!formule) return false;
  if (celluleDansPlages_(row, col, plagesEditables)) return false;
  if (celluleDansPlages_(row, col, plagesDejaProtegees)) return false;
  return true;
}

/** Vrai si la cellule (row, col — 1-based) appartient à l'une des plages données. */
function celluleDansPlages_(row, col, plages) {
  return plages.some(function (p) {
    return row >= p.getRow() && row < p.getRow() + p.getNumRows() &&
      col >= p.getColumn() && col < p.getColumn() + p.getNumColumns();
  });
}
