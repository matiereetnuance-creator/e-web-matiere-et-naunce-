/**
 * Export PDF (V4).
 *
 * Menu Pilotage ▸ Exporter un rapport PDF… : génère un PDF A4 des 3
 * feuilles de restitution — Dashboard, Prévisionnel, Analyse —
 * jamais Chantiers, Charges ou Paramètres (aucune donnée technique
 * dans le rapport). Le PDF est déposé dans le même dossier Drive que
 * le classeur ; une boîte de dialogue donne son lien.
 *
 * Repose sur le point d'export natif de Google Sheets
 * (`/export?format=pdf`, appelé via UrlFetchApp authentifié par le
 * jeton OAuth du script) plutôt que sur une bibliothèque tierce —
 * aucune dépendance externe à ajouter au projet.
 *
 * ⚠️ Combine les 3 feuilles en un seul PDF via plusieurs identifiants
 * `gid` séparés par une virgule, un comportement de l'export Google
 * Sheets largement utilisé mais non documenté officiellement par
 * Google. Comme le reste du projet, ceci n'a jamais été exécuté dans
 * un vrai classeur depuis cet environnement de développement — voir
 * KNOWN_LIMITATIONS.md. En cas d'échec, la boîte de dialogue d'erreur
 * indique la solution de repli manuelle (Fichier ▸ Imprimer).
 *
 * Première utilisation : Google demandera à l'utilisateur d'autoriser
 * l'accès à Drive (pour déposer le fichier) — comportement normal
 * d'Apps Script lors du premier appel à une nouvelle capacité.
 */

/** Menu ▸ Exporter un rapport PDF… */
function exporterRapportPdf() {
  var ui = SpreadsheetApp.getUi();
  try {
    var ss = getSpreadsheet_();
    var feuilles = [SHEETS.DASHBOARD, SHEETS.PREVISIONNEL, SHEETS.ANALYSE]
      .map(function (nom) { return getRequiredSheet_(nom); });

    var url = construireUrlExportPdf_(ss, feuilles);
    var reponse = UrlFetchApp.fetch(url, {
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });

    if (reponse.getResponseCode() !== 200) {
      throw new Error('Le service d\'export Google Sheets a répondu avec le code ' +
        reponse.getResponseCode() + '.');
    }

    var nomFichier = 'Rapport Pilotage - ' + ss.getName() + ' - ' +
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '.pdf';
    var pdf = reponse.getBlob().setName(nomFichier);
    var fichier = obtenirDossierClasseur_(ss).createFile(pdf);

    enregistrerEvenement_(JOURNAL_TYPES.EXPORT_PDF, nomFichier);
    ui.alert('📄 Rapport PDF généré',
      '« ' + nomFichier + ' » a été enregistré dans le même dossier Drive que ce classeur.\n\n' +
      fichier.getUrl(),
      ui.ButtonSet.OK);
  } catch (err) {
    var message = String(err && err.message ? err.message : err);
    enregistrerEvenement_(JOURNAL_TYPES.ERREUR, 'Export PDF : ' + message);
    afficherErreur_('Export PDF impossible',
      'Le rapport n\'a pas pu être généré :\n\n' + message +
      '\n\nVous pouvez exporter manuellement via Fichier ▸ Imprimer ▸ ' +
      'Sélectionner les feuilles Dashboard, Prévisionnel et Analyse.');
  }
}

/**
 * URL d'export PDF A4 portrait, mise en page propre : sans grille, ni
 * titre de classeur, ni nom d'onglet, ni numéro de page — seul le
 * contenu des feuilles (déjà conçu pour être lisible) apparaît.
 */
function construireUrlExportPdf_(ss, feuilles) {
  var gids = feuilles.map(function (f) { return f.getSheetId(); }).join(',');
  var base = ss.getUrl().replace(/\/edit.*$/, '');
  return base + '/export' +
    '?format=pdf' +
    '&size=A4' +
    '&portrait=true' +
    '&fitw=true' +
    '&top_margin=0.4&bottom_margin=0.4&left_margin=0.4&right_margin=0.4' +
    '&gridlines=false' +
    '&printtitle=false' +
    '&sheetnames=false' +
    '&pagenumbers=false' +
    '&gid=' + gids;
}

/** Dossier Drive contenant le classeur (pour y déposer le PDF exporté au même endroit). */
function obtenirDossierClasseur_(ss) {
  var parents = DriveApp.getFileById(ss.getId()).getParents();
  return parents.hasNext() ? parents.next() : DriveApp.getRootFolder();
}
