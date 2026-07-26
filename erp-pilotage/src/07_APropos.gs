/**
 * Menu ▸ À propos (V4).
 *
 * Affiche l'identité du projet (nom, version, build, auteur) et les
 * deux derniers événements clés du journal technique (dernier
 * diagnostic, dernière installation). Lit uniquement VERSION.gs et le
 * journal (06_Journal.gs) — aucune valeur recopiée en dur ici.
 */

/** Menu ▸ À propos… : boîte de dialogue d'identité du projet. */
function afficherAPropos() {
  var derniereInstallation = dernierEvenement_(JOURNAL_TYPES.INSTALLATION);
  var dernierDiagnostic = dernierEvenement_(JOURNAL_TYPES.DIAGNOSTIC);

  var lignes = [
    'ERP Matière & Nuance — Pilotage',
    '',
    'Version : ' + VERSION.NUMBER + ' (' + VERSION.BUILD_NAME + ')',
    'Date de build : ' + VERSION.BUILD_DATE,
    'Auteur : ' + VERSION.AUTHOR,
    '',
    'Dernier diagnostic : ' + formaterEvenementRecent_(dernierDiagnostic),
    'Dernière installation : ' + formaterEvenementRecent_(derniereInstallation)
  ];

  SpreadsheetApp.getUi().alert('ℹ️ À propos', lignes.join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}

/** "Jamais" si l'événement est absent, sinon date lisible + détails éventuels. */
function formaterEvenementRecent_(evenement) {
  if (!evenement) return 'Jamais';
  return formaterDateEvenement_(evenement.date) + (evenement.details ? ' (' + evenement.details + ')' : '');
}
