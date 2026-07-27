# Recette fonctionnelle — Phase 1

⚠️ **Ce protocole doit être exécuté par une personne disposant d'un
compte Google** : cet environnement de développement n'a aucun accès
à Google Sheets, Apps Script ou Drive (ni compte, ni connecteur, ni
API) — voir `KNOWN_LIMITATIONS.md`. Personne n'a jamais exécuté ce
projet dans un vrai classeur avant cette recette.

Classeur de test : **📊 Matière & Nuance – Pilotage TEST 2026**
(vierge, aucune donnée métier à saisir pendant cette phase).

## 1. Créer le classeur et déployer le code

1. Créer un Google Sheets **vierge**, le renommer exactement
   `📊 Matière & Nuance – Pilotage TEST 2026`.
2. Ouvrir *Extensions ▸ Apps Script*.
3. Supprimer le fichier `Code.gs` par défaut.
4. Pour chacun des 19 fichiers de `erp-pilotage/src/` (voir liste dans
   `README.md`), créer un fichier du même nom et coller le contenu.
5. Ouvrir `appsscript.json` du projet (icône ⚙️ *Paramètres du projet
   ▸ Afficher le fichier manifeste "appsscript.json"*) et remplacer
   son contenu par celui de `erp-pilotage/appsscript.json`.
6. Enregistrer (Ctrl+S / Cmd+S) tous les fichiers.
7. Recharger l'onglet du classeur Google Sheets (F5).

## 2. Installer l'ERP (en 3 étapes)

⚠️ Depuis la V4.1, l'installation est volontairement découpée en 3
clics séparés — Google Apps Script limite une exécution à 6 minutes
sur un compte gratuit, et tout construire en un seul appel pouvait
dépasser cette limite lors d'une toute première installation. Chaque
étape est une exécution indépendante, avec son propre budget de temps.

1. Le menu **Pilotage** doit apparaître dans la barre de menus en
   quelques secondes. S'il n'apparaît pas après 15-20s, recharger à
   nouveau la page.
2. Cliquer **Pilotage ▸ 🛠️ Installation (en 3 étapes) ▸ 1️⃣ Étape 1/3
   — Paramètres + Charges**.
3. **Première exécution uniquement** : Google va demander
   l'autorisation d'exécuter le script ("Autorisation requise") — nom
   de compte inconnu / "Google n'a pas vérifié cette application" est
   normal pour un script personnel : cliquer *Paramètres avancés ▸
   Accéder à [nom du projet] (dangereux)*. C'est votre propre script,
   pas une application tierce.
4. Confirmer dans la boîte de dialogue ("Continuer ?"). Une boîte de
   dialogue "Étape 1/3 terminée" doit s'afficher (éventuellement avec
   un avertissement sur le mapping Chantiers — normal sur un classeur
   vierge, voir §3 ci-dessous).
5. Cliquer **Pilotage ▸ 🛠️ Installation ▸ 2️⃣ Étape 2/3 — Dashboard +
   Prévisionnel + Analyse**, confirmer. Boîte "Étape 2/3 terminée".
6. Cliquer **Pilotage ▸ 🛠️ Installation ▸ 3️⃣ Étape 3/3 —
   Finalisation**, confirmer. Boîte "Installation terminée" — les 7
   feuilles sont prêtes.

Si une étape est lancée avant la précédente (ex. Étape 2 avant Étape
1), une boîte de dialogue claire l'indique et rien n'est reconstruit
— relancer simplement l'étape manquante d'abord.

## 3. Grille de vérification

Cocher chaque ligne. Toute case ✗ = noter le message d'erreur exact
(copier-coller) et l'action en cours au moment de l'erreur.

| # | Critère | Comment vérifier | ✓/✗ |
|---|---|---|---|
| 1 | 7 onglets créés | En bas de l'écran : `01 - Accueil`, `02 - Dashboard`, `03 - Chantiers`, `04 - Charges`, `05 - Paramètres`, `06 - Prévisionnel`, `07 - Analyse`, dans cet ordre | |
| 2 | Tous les menus présents | Menu **Pilotage** contient : Accueil, Dashboard, Exporter un rapport PDF…, Actualiser les listes déroulantes, Vérifier la structure Chantiers, Réappliquer les protections, Diagnostic, Afficher le journal, Nouvel exercice…, Installation (sous-menu à 3 étapes), À propos… | |
| 3 | Diagnostic opérationnel | **Pilotage ▸ 🩺 Diagnostic** → une boîte de dialogue s'affiche avec un score (ex. "X/Y contrôles réussis") et 7 sections (Feuilles, Plages nommées, Protections, Colonnes Chantiers, Paramètres obligatoires, Graphiques, Listes). Sur un classeur vierge juste installé, "Colonnes Chantiers" et "Paramètres obligatoires" peuvent afficher ✗ — c'est attendu (voir §4). Aucune erreur technique ne doit apparaître à la place du rapport. | |
| 4 | Journal fonctionne | **Pilotage ▸ 🗒️ Afficher le journal** → au moins 4 lignes visibles (les 3 étapes d'installation du §2 + le diagnostic du point précédent), avec date/heure lisible | |
| 5 | Menu À propos fonctionne | **Pilotage ▸ ℹ️ À propos…** → boîte affichant "Version : 4.1.4 (Premium)", une date de build, un auteur, "Dernier diagnostic : [date récente]", "Dernière installation : [date récente]" | |
| 6 | Export PDF fonctionne | **Pilotage ▸ 📄 Exporter un rapport PDF…** → 1ʳᵉ fois : autorisation Drive à accepter (normal, 1ʳᵉ capacité du projet à utiliser Drive) ; ensuite une boîte de dialogue donne un lien Drive vers le PDF généré. Ouvrir le lien : le PDF doit contenir Dashboard, Prévisionnel, Analyse, sans donnée technique | |
| 7 | Menu Nouvel exercice présent | **Pilotage ▸ 🆕 Nouvel exercice…** visible dans le menu (ne pas cliquer pendant cette phase : voir §5) | |
| 8 | Aucune erreur Apps Script | Aucune boîte "Exception" ou "Erreur de script", ni de message "Exceeded maximum execution time", à aucun moment du déploiement, des 3 étapes d'installation ou des points 1 à 7 ci-dessus ; dans l'éditeur Apps Script, *Exécutions* (icône horloge à gauche) ne montre aucune exécution en échec (❌) | |

## 4. Résultat attendu, pas une anomalie

Sur un classeur **vierge** (sans vraie feuille Chantiers), il est
normal que :
- l'installation signale des en-têtes Chantiers manquants (aucune
  feuille `03 - Chantiers` préexistante ne correspond à un vrai
  client) ;
- Diagnostic affiche des ✗ sur "Colonnes Chantiers" et "Paramètres
  obligatoires" (Exercice/Objectif CA HT pas encore saisis) ;
- les indicateurs du Dashboard affichent 0 partout.

Ce ne sont **pas** des bugs — c'est le comportement documenté
(`KNOWN_LIMITATIONS.md`, `ARCHITECTURE.md` §9). Le seul point à
signaler serait une **erreur technique brute** (message "Exception",
`#REF!`/`#N/A`/`#VALUE!`/`#NOM?` visible dans une cellule, menu
absent, ou plantage).

## 5. Ce qu'il ne faut PAS faire pendant cette phase

- Ne pas cliquer sur **Nouvel exercice…** (créerait un fichier
  supplémentaire inutile pour cette recette).
- Ne pas saisir de données métier (Charges, Chantiers, Paramètres) —
  demandé explicitement pour cette Phase 1.

## 6. Retour des résultats

Remplir la colonne ✓/✗ du tableau §3, joindre les messages d'erreur
exacts le cas échéant, et transmettre ce fichier complété (ou son
contenu) pour que les correctifs nécessaires puissent être développés
et vérifiés par relecture de code — cet environnement ne pouvant pas
reproduire l'exécution lui-même.
