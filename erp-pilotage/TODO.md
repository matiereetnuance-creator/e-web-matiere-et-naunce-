# TODO — avant mise en production

Actions concrètes restant à faire, par ordre d'impact. Contrairement à
ROADMAP.md (évolutions futures optionnelles), tout ce qui suit est
nécessaire pour une mise en production sereine.

## Bloquant

- [ ] **Vérifier le mapping Chantiers réel.** Ouvrir Paramètres!B12:B15
  sur le classeur du client et corriger les 4 en-têtes pour qu'ils
  correspondent exactement à ceux de l'onglet Chantiers existant.
  Confirmer avec Pilotage ▸ Vérifier la structure Chantiers (ou
  Diagnostic).
- [x] **Installer une fois sur un classeur de test réel** — fait : a
  révélé un dépassement de la limite d'exécution Apps Script (6 min)
  sur `installerERP()` en une seule exécution, corrigé en V4.1 par un
  découpage en 3 étapes (voir CHANGELOG.md). Reste à confirmer une
  nouvelle installation complète avec le code V4.1 :
  **Pilotage ▸ 🛠️ Installation (en 3 étapes)**, en cliquant les 3
  étapes l'une après l'autre (1️⃣ Paramètres + Charges, 2️⃣ Dashboard +
  Prévisionnel + Analyse, 3️⃣ Finalisation). Vérifier à l'œil que la
  mise en forme correspond aux maquettes fournies en revue
  d'architecture, et qu'aucune des 3 étapes ne dépasse la limite de
  temps.
- [ ] **Réinstaller une seconde fois sur ce même classeur de test**
  (les 3 étapes, dans l'ordre) après avoir saisi des données (Charges,
  Paramètres) pour confirmer de visu qu'aucune n'est perdue
  (idempotence vérifiée par raisonnement sur le code, pas encore par
  une réinstallation réelle avec le flux en 3 étapes).

## Important

- [ ] Lancer Pilotage ▸ Diagnostic après la première installation et
  vérifier que les 7 sections sont toutes ✓.
- [ ] Décider si `CHANTIERS_STATUT` doit filtrer le CA/marge réalisés
  (voir ROADMAP.md) — sinon laisser tel quel (tout chantier avec un
  CA HT et une date dans l'exercice compte comme réalisé).
- [ ] Tester "Nouvel exercice" une fois sur le classeur de test pour
  vérifier que le fichier créé est correctement nommé et fonctionnel.
- [ ] Confirmer que le partage/droits d'accès du fichier copié par
  "Nouvel exercice" correspond à ce qui est attendu (hérité du fichier
  source par défaut).
- [ ] **Tester Pilotage ▸ Exporter un rapport PDF** (V4) : vérifier que
  le PDF combine bien les 3 feuilles (technique non documentée par
  Google, jamais exécutée — voir KNOWN_LIMITATIONS.md). Accepter la
  demande d'autorisation Drive au premier lancement. Si l'export
  échoue, utiliser le repli manuel indiqué dans le message d'erreur
  (Fichier ▸ Imprimer).
- [ ] Vérifier le rendu du menu **À propos** et du **journal
  technique** (Pilotage ▸ Afficher le journal) après quelques
  installations/diagnostics.

## Quand le temps le permet

- [ ] Relire les notes (tooltips) posées sur les cellules clés et
  ajuster le vocabulaire si besoin (Paramètres, Charges,
  Prévisionnel).
- [ ] Vérifier le rendu des couleurs de mise en forme conditionnelle à
  l'écran (les valeurs hexadécimales ont été choisies sans aperçu
  visuel réel — voir KNOWN_LIMITATIONS.md).
- [ ] Vérifier à l'œil le rendu du système de design V4 (tailles de
  police des graphiques, largeur des 2 cartes Charges, hauteurs de
  ligne des tableaux) et ajuster `DESIGN` (`00_Constantes.gs`) si un
  détail paraît trop serré ou trop aéré.
- [ ] Envisager l'orientation paysage pour l'export PDF si le
  Dashboard (large grille de 14 colonnes) paraît trop compressé en A4
  portrait (`construireUrlExportPdf_()`, `95_Export.gs`).
