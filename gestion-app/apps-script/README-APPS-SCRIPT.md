# API Apps Script — persistance Google Sheets (Sprint 6)

Ce dossier contient le code d'un **Web App Google Apps Script** qui sert
uniquement de couche de persistance (lire/créer/modifier/supprimer des
lignes) pour l'application `gestion-app`. **Aucun calcul métier n'y est
fait** — marges, TVA, KPI et Dashboard restent entièrement calculés côté
Next.js (`services/chantiers.ts`, `services/charges.ts`,
`services/dashboard.ts`, inchangés).

Ce projet est indépendant du dossier `erp-pilotage/` à la racine du
dépôt (un produit Google Sheets historique différent, sans rapport
avec `gestion-app`) : ne pas les confondre ni les fusionner.

## 1. Créer le classeur Google Sheets

1. Créer un nouveau classeur Google Sheets (ex. "Matière & Nuance — Données").
2. Créer 3 onglets, avec exactement ces noms et ces en-têtes en ligne 1
   (ordre des colonnes indifférent, les noms doivent correspondre) :

   **Onglet "Chantiers"**
   | id | client | nomChantier | prixVenduHT | fournituresHT | sousTraitantHT | apporteurHT | jours |
   |---|---|---|---|---|---|---|---|

   **Onglet "Charges"**
   | id | date | categorie | motif | montantTTC | tauxTVA | periodicite | actif |
   |---|---|---|---|---|---|---|---|

   **Onglet "Settings"** (une seule ligne de données, en ligne 2)
   | objectifAnnuelCA | tauxMargeCible | chargesFixesMensuelles | partFournituresReference | arrondirMontants | comparaisonN1 |
   |---|---|---|---|---|---|

3. **Formats de colonnes importants** (pour que les nombres restent des
   nombres, pas des chaînes déjà formatées) :
   - Colonnes montants (`prixVenduHT`, `montantTTC`, `objectifAnnuelCA`,
     `chargesFixesMensuelles`, etc.) : format **Nombre** simple, pas
     "Devise" — le symbole € est ajouté par Next.js (`formatEuro`),
     jamais par la feuille.
   - Colonnes pourcentage (`tauxMargeCible`, `partFournituresReference`) :
     nombres **0 à 100** (ex. `31`, pas `0,31` et pas de format "%" —
     l'API renverrait alors `0.31`, ce qui casserait l'affichage).
   - `tauxTVA` : reste un ratio (`0`, `0.055`, `0.1`, `0.2`), comme
     aujourd'hui dans le code — ne pas appliquer de format "%" dessus.
   - Colonnes booléennes (`actif`, `arrondirMontants`, `comparaisonN1`) :
     insérer des **cases à cocher** (menu Insertion ▸ Case à cocher) —
     Apps Script lit alors un vrai booléen JS.
   - Colonne `date` (Charges) : format **Date**.

4. (Optionnel mais recommandé) Pré-remplir avec les données de
   démarrage actuelles (mêmes valeurs que les seeds Sprint 2/3/5 du
   code, voir `src/services/*-repository.ts` avant ce sprint dans
   l'historique Git) pour retrouver un état de départ identique.

## 2. Créer le projet Apps Script

1. Dans le classeur, menu **Extensions ▸ Apps Script**.
2. Supprimer le fichier `Code.gs` par défaut, puis créer les fichiers
   de ce dossier (`Code.gs`, `Auth.gs`, `Chantiers.gs`, `Charges.gs`,
   `Settings.gs`, `Utils.gs`) et copier leur contenu tel quel.
3. Dans les paramètres du projet (icône ⚙️), copier le contenu de
   `appsscript.json` dans l'éditeur de manifeste (activer "Afficher le
   fichier manifeste appsscript.json" dans les paramètres du projet si
   besoin).

## 3. Configurer le token (obligatoire avant tout déploiement)

Un Web App Apps Script ne peut pas lire d'en-tête HTTP personnalisé
(`Authorization`, etc.) — le token voyage donc en paramètre de requête
ou dans le corps JSON, et c'est la **seule protection** de l'API
(déployée en accès "Anyone").

1. Générer un token long et aléatoire, par exemple :
   ```
   openssl rand -hex 32
   ```
2. Dans l'éditeur Apps Script : **Paramètres du projet ▸ Propriétés du
   script ▸ Ajouter une propriété de script**.
   - Propriété : `API_TOKEN`
   - Valeur : le token généré ci-dessus
3. Ne jamais coder ce token en dur dans un fichier `.gs`.

## 4. Déployer le Web App

1. Dans l'éditeur Apps Script : **Déployer ▸ Nouveau déploiement**.
2. Type : **Application Web**.
3. Configuration :
   - Exécuter en tant que : **Moi** (le propriétaire du script).
   - Qui a accès : **Tout le monde** (nécessaire pour un appel
     serveur-à-serveur sans authentification Google — c'est le token
     `API_TOKEN` qui protège l'accès, pas cette option).
4. Cliquer sur **Déployer**, autoriser les permissions demandées
   (accès à ce classeur uniquement).
5. Copier l'**URL du Web App** (se termine par `/exec`) — c'est la
   valeur de `APPS_SCRIPT_URL`.

### Mettre à jour le déploiement après une modification du code

Modifier les fichiers `.gs` ne suffit pas : il faut publier une
nouvelle version pour que l'URL `/exec` existante la prenne en compte :
**Déployer ▸ Gérer les déploiements ▸ ✏️ (modifier) ▸ Version : Nouvelle
version ▸ Déployer**. L'URL reste la même.

## 5. Configurer Next.js

Dans `gestion-app/.env.local` (jamais commité — voir `.gitignore`) :

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXXXXX/exec
APPS_SCRIPT_API_TOKEN=<le même token que API_TOKEN côté Apps Script>
```

## 6. Vérifier manuellement le déploiement

Le endpoint `health` ne nécessite pas de token (vérification de vie
simple) :

```bash
curl "https://script.google.com/macros/s/XXXXXXXX/exec?resource=health"
# { "ok": true, "version": "1.0.0", "timestamp": "2026-..." }
```

Lister les chantiers (avec le token) :

```bash
curl "https://script.google.com/macros/s/XXXXXXXX/exec?resource=chantiers&token=VOTRE_TOKEN"
```

Créer un chantier :

```bash
curl -X POST "https://script.google.com/macros/s/XXXXXXXX/exec?resource=chantiers" \
  -H "Content-Type: application/json" \
  -d '{"token":"VOTRE_TOKEN","action":"create","data":{"client":"Test","nomChantier":"Test","prixVenduHT":1000,"fournituresHT":100,"sousTraitantHT":100,"apporteurHT":0,"jours":5}}'
```

## 7. Identifiants

Les id sont générés par Apps Script sous forme lisible et séquentielle
(`chantier-0001`, `charge-0001`, …) à partir du plus grand suffixe déjà
présent dans la colonne `id` de la feuille concernée — jamais d'UUID.

## 8. Limites connues

- Google Sheets n'est pas une base transactionnelle : deux écritures
  strictement simultanées sur la même feuille sont sérialisées via
  `LockService` (attente jusqu'à 10 s), mais restent plus lentes qu'un
  vrai SGBD sous forte concurrence.
- Un Web App Apps Script répond toujours en HTTP 200 ; les erreurs
  s'inspectent via le champ `ok`/`error` du JSON, jamais via le code
  HTTP.
- Quotas d'exécution Apps Script (variables selon le type de compte
  Google) : au-delà d'un certain volume d'appels quotidiens, le Web App
  peut être temporairement bloqué par Google.
- Le token circule en clair dans l'URL/le corps de la requête (aucune
  alternative possible côté Apps Script) — le protéger comme un mot de
  passe, le faire tourner en cas de doute sur une fuite.
