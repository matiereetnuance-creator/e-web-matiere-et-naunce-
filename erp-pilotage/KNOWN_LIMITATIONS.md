# Limites connues et risques acceptés

## Limites de la plateforme Google Sheets / Apps Script

- **Graphiques non fluides** : un graphique Sheets est un objet de
  taille fixe une fois posé. `computeChartSize_()` l'adapte à la
  géométrie de la feuille à chaque (ré)installation, mais il ne se
  redimensionne jamais tout seul entre deux installations (pas de
  redimensionnement "responsive" façon page web).
- **Protection "avertissement" non verrouillée** : `setWarningOnly(true)`
  (voir ARCHITECTURE.md §5) affiche un avertissement mais n'empêche pas
  techniquement une édition volontaire. Un verrouillage dur existe
  dans l'API Sheets mais nécessiterait de gérer une liste d'éditeurs
  autorisés — écarté comme inutilement complexe pour un classeur à
  utilisateur unique.
- **`IFERROR` masque l'erreur, pas sa cause** : une cellule protégée
  par `avecIferror_()` affichera 0 (ou un tiret) au lieu d'une erreur
  Sheets si sa dépendance est cassée. C'est un choix délibéré (voir
  ARCHITECTURE.md §9) : la cause réelle doit être diagnostiquée via
  Pilotage ▸ Diagnostic, pas en lisant un symbole d'erreur au milieu
  du classeur. Un utilisateur qui ignore Diagnostic pourrait ne pas
  remarquer immédiatement qu'un indicateur est resté à 0 à cause d'une
  feuille supprimée plutôt que d'une activité réellement nulle.
- **`SUMPRODUCT` sur de grandes plages** : les formules mensuelles
  parcourent jusqu'à 5000 lignes de Chantiers (et 1000 de Charges) à
  chaque recalcul. Volontairement non réécrit en V3 (réécrire changerait
  la logique de calcul, hors périmètre) — reste largement dans les
  limites raisonnables de Google Sheets pour ces volumes, mais un
  Chantiers qui grossirait à plusieurs dizaines de milliers de lignes
  mériterait une revue.
- **`TODAY()` (Dashboard, prévision de fin d'année)** est une fonction
  volatile (recalcule à chaque édition du classeur). Un seul usage
  dans tout le classeur — nécessaire à la logique de la fonctionnalité
  elle-même, aucune alternative sans la modifier.
- **Pas d'API Google Sheets réelle depuis cet environnement de
  développement.** Aucune ligne de ce projet — V1 à V4 — n'a été
  exécutée dans un vrai classeur Google Sheets. Toutes les
  vérifications ont été faites par lecture de code, vérification de
  syntaxe JavaScript et raisonnement sur le comportement documenté de
  l'API Apps Script. Voir TODO.md pour les tests réels recommandés
  avant mise en production.
- **Export PDF multi-feuilles non documenté officiellement** (V4,
  `95_Export.gs`) : combiner Dashboard/Prévisionnel/Analyse en un seul
  PDF via plusieurs `gid` séparés par une virgule dans l'URL d'export
  est une technique largement utilisée par la communauté Apps Script
  mais que Google ne documente pas officiellement — son comportement
  pourrait changer sans préavis. Repli prévu si l'export échoue :
  message d'erreur clair renvoyant vers Fichier ▸ Imprimer manuel.
- **Export PDF nécessite le service Drive**, jamais utilisé avant la
  V4 : la première exécution demandera à l'utilisateur d'autoriser un
  périmètre OAuth plus large (accès Drive pour déposer le fichier).

## Risques acceptés (décisions explicites, pas des oublis)

- **`40_Dashboard.gs` n'avait reçu aucune modification en V3**, à la
  demande explicite du client ; la V4 y a touché pour la première
  fois, mais strictement pour appeler `creerGraphiqueBase_()` sur ses
  2 graphiques (style visuel uniquement) — aucune formule, aucun KPI,
  aucune mise en page de carte modifiée. Un risque V3 subsiste tel
  quel : deux formules propres au Dashboard (`=CHARGES_MENSUELLES`, le
  `SUMPRODUCT` externe de la répartition par catégorie) ne sont pas
  explicitement enveloppées dans `IFERROR`. Risque très faible en
  pratique (nécessiterait la suppression de la feuille Charges
  elle-même, ce qui casserait de toute façon ses propres indicateurs
  et serait détecté par Diagnostic).
- **Rendu visuel du système de design (V4) non vérifié à l'écran** :
  `DESIGN` centralise des valeurs choisies par raisonnement (échelle
  typographique, espacements, largeurs de cartes) mais jamais vues
  rendues dans un vrai Google Sheets. Les tailles de police des axes
  de graphiques (`creerGraphiqueBase_()`) et les couleurs de grille
  sont dans la même situation. À ajuster après la première
  installation réelle si un détail paraît trop serré ou trop aéré.
- **`CHANTIERS_STATUT` relié mais non utilisé comme filtre** (voir
  ROADMAP.md) : deviner la mauvaise valeur aurait faussé
  silencieusement tous les indicateurs de CA/marge — jugé plus sûr de
  ne pas filtrer tant que le client n'a pas confirmé les valeurs
  réelles de ce statut.
- **Couleurs de mise en forme conditionnelle choisies sans aperçu
  visuel réel** (`COLORS.INACTIF_BG`, `OBJECTIF_ATTEINT_BG`,
  `OBJECTIF_DEPASSE_BG`, `OBLIGATOIRE_VIDE_BG`) : dérivées par
  calcul/analogie de la palette existante (accent doré, gris
  anthracite) en respectant "jamais de rouge/vert saturé", mais
  jamais vues rendues à l'écran faute d'accès à Google Sheets. À
  ajuster visuellement si besoin après la première installation
  réelle.
- **Seuil "objectif dépassé"** (Prévisionnel, écart > 10 % de
  l'objectif mensuel) est une valeur par défaut raisonnable choisie
  sans confirmation client explicite — facilement ajustable dans
  `buildPrevisionnelMiseEnFormeConditionnelle_()` (`50_Previsionnel.gs`)
  si un autre seuil est préféré.
- **`assistantNouvelExercice()` suppose que le fichier source est déjà
  correctement installé** (il vérifie seulement que Paramètres existe,
  pas l'intégralité de la structure). Créer un nouvel exercice à partir
  d'un fichier source cassé produirait une copie tout aussi cassée —
  cas limite jugé peu réaliste (on ne duplique en pratique qu'un
  classeur qui fonctionne déjà), et de toute façon détectable via
  Diagnostic sur la copie.
