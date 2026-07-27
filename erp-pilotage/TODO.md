# TODO — avant mise en production

Actions concrètes restant à faire, par ordre d'impact. Contrairement à
ROADMAP.md (évolutions futures optionnelles), tout ce qui suit est
nécessaire pour une mise en production sereine.

## Bloquant

- [ ] **V5 — Tester l'harmonisation visuelle de Chantiers sur une
  COPIE du vrai classeur avant toute exécution en production.**
  `harmoniserChantiers_()` (`30_Chantiers.gs`) touche à la mise en
  forme de Chantiers pour la première fois de tout ce projet. Même si
  le contenu/en-têtes/colonnes ne sont jamais modifiés (vérifié par
  lecture de code), c'est un changement de posture important sur la
  feuille la plus sensible du classeur — dupliquer le classeur réel
  (Fichier ▸ Créer une copie), lancer l'Étape 1/3 sur la copie, et
  confirmer à l'œil qu'aucun texte d'en-tête, aucune valeur ni aucun
  ordre de colonne n'a bougé avant de lancer l'installation sur le
  fichier réel.
- [ ] **V5 — Vérifier si la vue filtrée (Chantiers/Charges) a
  réellement été créée**, ou si le repli sur filtre classique s'est
  déclenché (Diagnostic ▸ section "🎛️ Harmonisation visuelle", ou
  Données ▸ Vues filtrées dans le menu Google Sheets). Si le repli
  s'est déclenché, activer le service avancé "Google Sheets API"
  (Apps Script ▸ Services ▸ +) puis relancer l'Étape 1/3 pour obtenir
  une vraie vue filtrée personnelle (voir KNOWN_LIMITATIONS.md).
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
  vérifier que les 8 sections sont toutes ✓ (V5 ajoute "🎛️
  Harmonisation visuelle").
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
- [ ] **V5.1 — Vérifier à l'œil le rendu "sans bordure"** des cartes
  KPI (Dashboard, Charges) et du bouton Accueil : confirmer que l'aplat
  de couleur seul suffit à les distinguer visuellement du fond de page
  (sans contour, la limite de la carte doit rester nette). Vérifier
  aussi les cellules de saisie de Charges (diviseur de ligne au lieu
  d'une grille) : toujours lisible sur 1000 lignes ? Si un détail
  manque de définition, ajuster `DESIGN`/`COLORS` plutôt que de
  réintroduire une bordure complète.
- [ ] **V5.2 — Vérifier que la valeur KPI en 32pt tient dans la largeur
  des cartes** (2 colonnes × 137px = 274px) pour les plus grands
  montants attendus (ex. objectif annuel à 6 chiffres) : le texte
  déborde-t-il proprement dans la colonne d'espacement voisine (pas de
  contenu dessus, donc sans casse) ou faut-il réduire légèrement
  `KPI_VALUE_FONT_SIZE` ? Vérifier aussi que les 6 sous-titres "eyebrow"
  (Accueil, Dashboard, Charges, Prévisionnel, Analyse, Paramètres)
  s'affichent avec assez d'air par rapport au titre et au contenu qui
  suit, et que le quadrillage vertical des graphiques a bien disparu
  sans rendre les graphiques moins lisibles.
- [ ] **V6 — Vérifier les 2 en-têtes H2 du Dashboard** ("PERFORMANCE DE
  L'EXERCICE" ligne 4, "ÉVOLUTION" ligne 9) : bien distincts visuellement
  du sous-titre de page (ligne 2) par leur taille (16pt vs 12pt), et du
  titre principal (22pt) — la hiérarchie H1 > H2 > Sous-titre doit se
  lire d'un coup d'œil. Vérifier aussi que la valeur KPI à 36pt (montée
  depuis 32pt en V5.2) tient toujours proprement dans la largeur des
  cartes.

## Quand le temps le permet

- [ ] Relire les notes (tooltips) posées sur les cellules clés et
  ajuster le vocabulaire si besoin (Paramètres, Charges,
  Prévisionnel).
- [ ] Vérifier le rendu des couleurs de mise en forme conditionnelle à
  l'écran (les valeurs hexadécimales ont été choisies sans aperçu
  visuel réel — voir KNOWN_LIMITATIONS.md).
- [ ] Vérifier à l'œil le rendu du système de design V5 (grand écran,
  1918px sur Dashboard/Analyse/Prévisionnel — tailles de police,
  largeur des 2 cartes Charges, hauteurs de ligne des tableaux) et
  ajuster `DESIGN` (`00_Constantes.gs`) si un détail paraît trop serré
  ou trop aéré, en particulier sur un écran plus petit qu'un moniteur
  de bureau classique (portable, tablette).
- [ ] Envisager l'orientation paysage pour l'export PDF, d'autant plus
  probable à être nécessaire depuis la V5 (grille de 14 colonnes ×
  137px ≈ 1918px, plus large qu'en V4) si le Dashboard paraît compressé
  en A4 portrait (`construireUrlExportPdf_()`, `95_Export.gs`).
