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
  développement.** Aucune ligne de ce projet n'a jamais été exécutée
  dans un vrai classeur Google Sheets depuis cet environnement.
  Toutes les vérifications sont faites par lecture de code,
  vérification de syntaxe JavaScript et raisonnement sur le
  comportement documenté de l'API Apps Script. Voir TODO.md pour les
  tests réels recommandés avant mise en production. **Confirmé par un
  cas réel (V4.1.1)** : `buildKpiCard_()` appelait `Range.setPadding()`,
  une méthode qui n'existe pas dans `SpreadsheetApp` — une erreur de
  raisonnement sur l'API que `node --check` (vérification de syntaxe
  uniquement) ne pouvait pas détecter, et qui n'est apparue qu'à la
  première exécution réelle de l'Étape 1/3. Corrigé (voir CHANGELOG.md) ;
  sert de rappel que la vérification de syntaxe ne garantit pas la
  validité des appels d'API contre le vrai runtime Apps Script.
  `Range.setPadding()` restera indisponible dans l'API de base tant
  que Google ne l'y ajoute pas ; seule l'API Sheets avancée l'expose
  (`CellFormat.padding`), non activée dans ce projet.
- **Deuxième cas confirmé (V4.1.2)** : `creerGraphiqueBase_()`
  définissait `chartArea: { right, bottom }` — deux clés qui n'existent
  pas dans l'API Google Charts (seuls `backgroundColor`, `left`, `top`,
  `width`, `height` sont valides), révélé par l'échec réel de l'Étape
  2/3 ("L'option graphique n'est plus compatible : chartArea.bottom").
  Corrigé en `width`/`height` en pourcentage (voir CHANGELOG.md,
  ARCHITECTURE.md §15).
- **Troisième cas confirmé, et attribution corrigée (V4.1.3 → V4.1.4)** :
  la V4.1.3 attribuait les `#ERROR!`/`#VALUE!` observés sur un classeur
  en locale française à `LET()` spécifiquement. Un test de contrôle du
  client a prouvé que ce n'était pas la vraie cause : une formule déjà
  "corrigée" en V4.1.3 (`=IFERROR(SUMPRODUCT(...),0)`, sans aucun
  `LET()`) échouait encore avec "Erreur d'analyse de formule" ; et
  `=IFERROR(1/0,0)` échoue tandis que `=IFERROR(1/0;0)` fonctionne. La
  vraie cause, confirmée par ce test : **`Range.setFormula()`/
  `setFormulas()` n'effectue AUCUNE traduction automatique du
  séparateur d'arguments** — la formule doit déjà contenir le
  séparateur réellement attendu par la locale du classeur, quelle que
  soit la fonction utilisée (`IFERROR`, `IF`, `IFS`, `HYPERLINK`...),
  pas seulement `LET()`. Voir ARCHITECTURE.md §19 pour le détail du
  mécanisme corrigé (`formulaSep_()` / `appel_()`, détection de locale
  via `Intl.NumberFormat`, audit exhaustif de toutes les formules du
  projet) et CHANGELOG.md V4.1.4.

  Quatre erreurs de la même famille (construction d'API/formule non
  détectable par une vérification de syntaxe JavaScript, uniquement
  révélée par l'exécution réelle sur un vrai classeur — dont une
  attribution de cause initialement incorrecte, elle-même corrigée
  seulement par un second test réel plus précis) en quatre
  installations consécutives — renforce plus que jamais l'idée qu'une
  revue par un compte Google test avant chaque livraison reste la
  seule vérification fiable des appels d'API Apps Script/Google
  Sheets et de la syntaxe de formule réellement interprétée par le
  moteur de calcul (par opposition à sa seule syntaxe JavaScript de
  construction, ou à un raisonnement non vérifié sur le comportement
  supposé de l'API).
- **Limite d'exécution de 6 minutes — confirmée en conditions réelles
  (V4.1).** Le premier retour d'exécution réelle du projet (V4
  installée par le client sur un vrai classeur) a montré que
  `installerERP()`, en une seule exécution, dépassait cette limite sur
  un classeur vierge ("Exceeded maximum execution time"). Corrigé en
  découpant l'installation en 3 étapes indépendantes, chacune avec son
  propre budget de 6 minutes (voir ARCHITECTURE.md §4, CHANGELOG.md).
  Le risque théorique subsiste, atténué mais pas éliminé : si la
  feuille Chantiers existante du client devenait un jour extrêmement
  volumineuse (au-delà de quelques milliers de lignes), même une des 3
  étapes pourrait en théorie approcher la limite — improbable au
  volume actuel, mais à garder en tête si Chantiers grossit fortement
  (voir aussi la limite `SUMPRODUCT` ci-dessous, cause probable
  commune).
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
- **Vue filtrée (V5, `creerVueFiltree_()`, `01_Utils.gs`) non vérifiée
  par exécution réelle.** Première fois que ce projet utilise le
  service avancé "Sheets API" (`appsscript.json` →
  `enabledAdvancedServices`) plutôt que le seul service `SpreadsheetApp`
  de base — surface d'API la plus récente et la moins éprouvée du
  projet à ce jour, exactement le type de construction qui s'est déjà
  révélée fragile 3 fois de suite (V4.1.1, V4.1.2, V4.1.3/V4.1.4) sans
  exécution réelle pour la valider. Un repli automatique sur un filtre
  classique (`creerFiltreClassique_()`) protège l'installation dans
  tous les cas (jamais d'échec bloquant pour cette seule raison), mais
  seule une exécution réelle confirmera si la vraie vue filtrée
  fonctionne comme prévu. Voir TODO.md pour le test recommandé.

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
- **`harmoniserChantiers_()` (V5) touche à Chantiers pour la première
  fois de tout ce projet** — strictement en mise en forme (couleurs,
  gel, largeurs, vue filtrée), jamais en contenu/en-têtes/colonnes/
  protections, et explicitement autorisé par le client (cahier des
  charges V5, règle n°4). Ce changement de posture (après plusieurs
  versions à ne JAMAIS toucher cette feuille par précaution maximale,
  suite à l'incident réel documenté dans CLAUDE.md concernant le site
  public — pas Chantiers lui-même, mais qui illustre le niveau de
  prudence attendu par ce client sur ses données réelles) mérite une
  vérification à l'œil particulièrement attentive lors de la première
  exécution réelle sur le vrai classeur (voir TODO.md) : confirmer que
  ni le texte des en-têtes, ni les valeurs, ni l'ordre des colonnes
  n'ont bougé, uniquement l'apparence.
- **`assistantNouvelExercice()` suppose que le fichier source est déjà
  correctement installé** (il vérifie seulement que Paramètres existe,
  pas l'intégralité de la structure). Créer un nouvel exercice à partir
  d'un fichier source cassé produirait une copie tout aussi cassée —
  cas limite jugé peu réaliste (on ne duplique en pratique qu'un
  classeur qui fonctionne déjà), et de toute façon détectable via
  Diagnostic sur la copie.
