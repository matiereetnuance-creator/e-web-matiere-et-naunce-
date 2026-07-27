/**
 * Module "03 - Chantiers"
 *
 * ⚠️ Cette feuille EXISTE DÉJÀ chez le client et sert de base de
 * données pour tout le reste du classeur. Ce module ne la crée ni ne
 * la modifie jamais (aucune valeur, colonne, ni mise en forme
 * touchée) : il se contente de LIRE ses en-têtes — dont les intitulés
 * attendus sont saisis par le client dans Paramètres!B12:B15 (voir
 * CHANTIERS_FIELDS, 00_Constantes.gs) — pour créer des plages nommées
 * que Dashboard, Prévisionnel et Analyse utilisent ensuite.
 *
 * Exception unique : si le classeur est totalement neuf et que
 * l'onglet Chantiers n'existe pas encore (ex. environnement de test),
 * un gabarit minimal est créé pour permettre l'installation — ce cas
 * ne doit jamais se produire chez le client.
 *
 * CHANTIERS_STATUT est relié mais volontairement non utilisé comme
 * filtre dans les formules de CA/marge : les valeurs réelles de ce
 * statut (ex. "Facturé", "Terminé"...) ne sont pas connues à l'avance,
 * et un filtre mal deviné fausserait silencieusement tous les
 * indicateurs. monthlyAmountFormula_() / annualAmountFormula_()
 * acceptent un paramètre extraCondition prêt à l'emploi pour brancher
 * ce filtre dès que le bon statut sera confirmé avec le client.
 *
 * V3 — robustesse : si une colonne attendue est introuvable, sa plage
 * nommée pointe désormais vers une cellule de repli garantie vide
 * (Paramètres!M1) plutôt que de rester non définie. Sans ce filet,
 * chaque formule du classeur référençant cette plage afficherait
 * #NOM? au lieu d'un 0 — voir getChantiersFallbackRange_().
 */

/**
 * En-tête attendu pour un champ Chantiers : lu depuis la cellule
 * Paramètres correspondante si elle existe déjà (cas normal), sinon
 * repli sur la valeur par défaut (premier lancement, avant que
 * buildParametres_() n'ait créé la plage nommée).
 */
function getChantiersFieldHeader_(field) {
  var valeur = getNamedValueSafe_(field.headerNamedRange, '');
  var texte = String(valeur).trim();
  return texte || field.defaultHeader;
}

/**
 * Cellule de repli garantie vide (Paramètres!M1), créée à la volée si
 * Paramètres n'a pas encore été installé (cas normalement jamais
 * atteint : l'installation construit toujours Paramètres en premier).
 */
function getChantiersFallbackRange_() {
  var range = getNamedRangeSafe_(NAMED_RANGES.CHANTIERS_FALLBACK);
  if (range) return range;
  var sheet = getOrCreateSheet_(SHEETS.PARAMETRES);
  var cell = sheet.getRange(PARAM_FALLBACK_CELL);
  cell.clearContent();
  setNamedRange_(NAMED_RANGES.CHANTIERS_FALLBACK, cell);
  return cell;
}

/**
 * Relie les plages nommées Chantiers à la feuille existante. Lit la
 * ligne d'en-tête UNE seule fois (au lieu d'une fois par champ — V3,
 * audit performance) et réutilise ce tableau pour les 4 recherches.
 * Retourne la liste des en-têtes introuvables (vide si tout est ok).
 */
function ensureChantiersLinks_() {
  var sheet = getSpreadsheet_().getSheetByName(SHEETS.CHANTIERS);
  if (!sheet) {
    sheet = creerGabaritChantiersMinimal_();
  }

  var dataRows = CHANTIERS_PLAGE_LIGNES; // plage large fixe : robuste, pas de fonction volatile
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(CHANTIERS_HEADER_ROW, 1, 1, lastCol).getValues()[0] : [];
  var missing = [];

  CHANTIERS_FIELDS.forEach(function (field) {
    var header = getChantiersFieldHeader_(field);
    var col = findColumnInHeaders_(headers, header);
    if (col === -1) {
      missing.push(header + ' (' + field.label + ')');
      setNamedRange_(field.dataNamedRange, getChantiersFallbackRange_());
      return;
    }
    var range = sheet.getRange(CHANTIERS_HEADER_ROW + 1, col, dataRows, 1);
    setNamedRange_(field.dataNamedRange, range);
  });

  return missing;
}

/**
 * Gabarit minimal, créé UNIQUEMENT si l'onglet Chantiers est absent
 * (classeur neuf). À remplacer par le vrai tableau du client avant
 * mise en production — voir l'avertissement en tête de fichier.
 */
function creerGabaritChantiersMinimal_() {
  var sheet = getSpreadsheet_().insertSheet(SHEETS.CHANTIERS);
  var parField = function (key) {
    var field = CHANTIERS_FIELDS.filter(function (f) { return f.key === key; })[0];
    return getChantiersFieldHeader_(field);
  };
  var headers = ['Nom du chantier', 'Client', parField('STATUT'), parField('DATE'), parField('CA_HT'), parField('MARGE_HT')];
  sheet.getRange(CHANTIERS_HEADER_ROW, 1, 1, headers.length).setValues([headers]);
  styleTableHeader_(sheet.getRange(CHANTIERS_HEADER_ROW, 1, 1, headers.length));
  sheet.setFrozenRows(CHANTIERS_HEADER_ROW);
  return sheet;
}

/**
 * Harmonisation visuelle de la feuille Chantiers EXISTANTE (V5, règle
 * n°4 du cahier des charges client) : couleurs d'en-tête, gel de la
 * ligne d'en-tête, largeurs de colonnes, vue filtrée. Ne touche JAMAIS
 * son contenu, ses en-têtes ni ses colonnes (règle n°1) — et, à la
 * différence de toute autre feuille du classeur, ne touche JAMAIS non
 * plus à son état de protection : `removeAllProtections_()` n'est
 * jamais appelé ici, une protection posée par le client lui-même sur
 * sa propre feuille doit survivre à toute réinstallation.
 *
 * Première fois que ce projet applique une quelconque mise en forme à
 * Chantiers — jusqu'à la V5, cette feuille n'était jamais touchée,
 * même visuellement, par excès de prudence (voir CLAUDE.md). Le client
 * l'a explicitement autorisé (cahier des charges V5, règle n°4).
 */
function harmoniserChantiers_() {
  var sheet = getSpreadsheet_().getSheetByName(SHEETS.CHANTIERS);
  if (!sheet) return; // classeur neuf, gabarit pas encore créé — rien à harmoniser

  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return; // feuille vide

  sheet.setHiddenGridlines(true);
  styleTableHeaderVisuel_(sheet.getRange(CHANTIERS_HEADER_ROW, 1, 1, lastCol));
  sheet.setRowHeight(CHANTIERS_HEADER_ROW, DESIGN.TABLE_HEADER_HEIGHT);
  sheet.autoResizeColumns(1, lastCol);

  var derniereLigne = harmoniserLignesChantiers_(sheet);
  harmoniserTableauSaisie_(sheet, CHANTIERS_HEADER_ROW, derniereLigne, lastCol, 'Chantiers — vue filtrée');
}

/**
 * Uniformise la hauteur des lignes de données sur une plage large mais
 * toujours sûre : jamais au-delà des lignes réellement disponibles sur
 * la feuille (`getMaxRows()`), pour ne jamais provoquer d'erreur
 * technique sur un classeur dont la taille de grille est inconnue à
 * l'avance. Retourne la dernière ligne couverte (réutilisée pour la
 * vue filtrée).
 */
function harmoniserLignesChantiers_(sheet) {
  var lignesDisponibles = Math.max(0, sheet.getMaxRows() - CHANTIERS_HEADER_ROW);
  var lignes = Math.min(CHANTIERS_PLAGE_LIGNES, lignesDisponibles);
  if (lignes > 0) {
    sheet.setRowHeights(CHANTIERS_HEADER_ROW + 1, lignes, DESIGN.TABLE_ROW_HEIGHT);
  }
  return CHANTIERS_HEADER_ROW + lignes;
}

/**
 * Vérifie que la feuille Chantiers expose bien les en-têtes attendus
 * (tels que saisis dans Paramètres!B12:B15) et affiche le résultat à
 * l'écran. Accessible depuis le menu Pilotage.
 */
function verifierStructureChantiers() {
  var missing = ensureChantiersLinks_();
  var ui = SpreadsheetApp.getUi();
  var attendus = CHANTIERS_FIELDS.map(function (f) { return getChantiersFieldHeader_(f) + ' (' + f.label + ')'; });
  if (missing.length === 0) {
    ui.alert('Structure Chantiers ✓',
      'Toutes les colonnes attendues ont été trouvées et reliées avec succès :\n\n' +
      attendus.join('\n'),
      ui.ButtonSet.OK);
  } else {
    ui.alert('Structure Chantiers — action requise',
      'Colonnes introuvables dans "' + SHEETS.CHANTIERS + '" (ligne ' + CHANTIERS_HEADER_ROW + ') :\n\n' +
      missing.join('\n') +
      '\n\nEn attendant la correction, les indicateurs concernés affichent 0 ' +
      '(aucune erreur ne s\'affiche dans les cellules). Corrigez les en-têtes dans "' +
      SHEETS.PARAMETRES + '" (cellules B12 à B15, section "Connexion à l\'onglet ' +
      'Chantiers") pour qu\'ils correspondent aux véritables intitulés de colonnes, ' +
      'puis relancez cette vérification.',
      ui.ButtonSet.OK);
  }
}
