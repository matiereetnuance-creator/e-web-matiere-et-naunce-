/**
 * Assistant "Nouvel exercice" (menu Pilotage).
 *
 * Modèle retenu (confirmé avec le client) : un fichier Google Sheets
 * par exercice. Ce bouton ne modifie JAMAIS le fichier actuel : il en
 * crée une copie complète via Spreadsheet.copy(), qui duplique déjà
 * tout — feuilles, formules, plages nommées, graphiques, protections
 * — puis n'ajuste dans la copie que ce qui doit changer d'une année
 * sur l'autre :
 *
 *   - Paramètres : Exercice + dates de début/fin avancés d'un an,
 *     Objectif CA HT remis à zéro (à ressaisir pour la nouvelle
 *     année). Objectif Marge, Salaire mensuel souhaité et le mapping
 *     Chantiers (B12:B15) sont CONSERVÉS tels quels.
 *   - Chantiers : les lignes de données sont vidées (nouvelle liste
 *     de chantiers pour le nouvel exercice) — en-tête et mise en
 *     forme ne sont pas touchés.
 *   - Charges : conservées telles quelles (charges fixes récurrentes,
 *     pas de raison de les vider en début d'année).
 *
 * Rien d'autre n'a besoin d'être reconstruit : Dashboard, Prévisionnel
 * et Analyse ne contiennent que des formules pointant vers des plages
 * nommées propres à chaque fichier — copiées avec lui, elles se
 * recalculent automatiquement sur le nouvel exercice et un Chantiers vide.
 */

/** Menu ▸ Nouvel exercice : crée une copie du classeur pour l'année suivante (voir en-tête de fichier). */
function assistantNouvelExercice() {
  var ui = SpreadsheetApp.getUi();
  var actuel = getSpreadsheet_();

  var paramSheet = getSheetSafe_(SHEETS.PARAMETRES);
  if (!paramSheet) {
    afficherErreur_('Paramètres introuvables',
      'Installez d\'abord l\'ERP (Pilotage ▸ Installation ▸ les 3 étapes) ' +
      'avant de créer un nouvel exercice.');
    return;
  }

  var exerciceActuel = Number(paramSheet.getRange(PARAM_CELLS.EXERCICE).getValue());
  if (!exerciceActuel || isNaN(exerciceActuel)) {
    afficherErreur_('Exercice introuvable',
      'La cellule Exercice (' + SHEETS.PARAMETRES + '!' + PARAM_CELLS.EXERCICE +
      ') est vide ou invalide — impossible de déterminer le prochain exercice.');
    return;
  }

  var nouvelExercice = exerciceActuel + 1;
  var nouveauNom = calculerNomCopieExercice_(actuel.getName(), exerciceActuel, nouvelExercice);

  var confirmation = ui.alert(
    'Créer l\'exercice ' + nouvelExercice,
    'Ceci crée un NOUVEAU fichier Google Sheets, copie complète de celui-ci :\n\n' +
    '« ' + nouveauNom + ' »\n\n' +
    'CE FICHIER-CI NE SERA PAS MODIFIÉ. Dans la copie :\n' +
    '• Exercice et dates seront avancés à ' + nouvelExercice + '\n' +
    '• Objectif CA HT sera remis à zéro (à ressaisir)\n' +
    '• Objectif Marge, Salaire mensuel souhaité et mapping Chantiers seront conservés\n' +
    '• Chantiers sera vidé de ses données (nouvelle liste pour ' + nouvelExercice + ')\n' +
    '• Charges sera conservé tel quel\n\n' +
    'Continuer ?',
    ui.ButtonSet.YES_NO);
  if (confirmation !== ui.Button.YES) return;

  var copie = actuel.copy(nouveauNom);

  prepareParametresNouvelExercice_(copie, nouvelExercice);
  viderChantiersDonnees_(copie);

  enregistrerEvenement_(JOURNAL_TYPES.NOUVEL_EXERCICE, 'Créé « ' + nouveauNom + ' » pour l\'exercice ' + nouvelExercice);

  ui.alert('Exercice ' + nouvelExercice + ' créé',
    '« ' + nouveauNom + ' » a été créé avec succès :\n\n' + copie.getUrl(),
    ui.ButtonSet.OK);
}

/** Bascule l'année dans le nom du fichier si elle y figure, sinon l'ajoute en suffixe. */
function calculerNomCopieExercice_(nomActuel, ancienExercice, nouvelExercice) {
  var motif = String(ancienExercice);
  if (nomActuel.indexOf(motif) !== -1) {
    return nomActuel.split(motif).join(String(nouvelExercice));
  }
  return nomActuel + ' — ' + nouvelExercice;
}

function prepareParametresNouvelExercice_(ss, nouvelExercice) {
  var sheet = ss.getSheetByName(SHEETS.PARAMETRES);
  sheet.getRange(PARAM_CELLS.EXERCICE).setValue(nouvelExercice);
  sheet.getRange(PARAM_CELLS.DATE_DEBUT).setValue(new Date(nouvelExercice, 0, 1));
  sheet.getRange(PARAM_CELLS.DATE_FIN).setValue(new Date(nouvelExercice, 11, 31));
  sheet.getRange(PARAM_CELLS.OBJECTIF_CA).clearContent();
  // Objectif Marge (B8), Salaire mensuel souhaité (B9) et mapping
  // Chantiers (B12:B15) : conservés tels quels, aucune action.
}

function viderChantiersDonnees_(ss) {
  var sheet = ss.getSheetByName(SHEETS.CHANTIERS);
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > CHANTIERS_HEADER_ROW && lastCol > 0) {
    sheet.getRange(CHANTIERS_HEADER_ROW + 1, 1, lastRow - CHANTIERS_HEADER_ROW, lastCol).clearContent();
  }
}
