# Instructions pour Claude Code — Matière & Nuance

## Règle critique : ZIP de déploiement — jamais de contenu

Ce site est un CMS sans base de données : le contenu (réalisations, avis,
textes, réglages) vit uniquement dans des fichiers JSON sur l'hébergement
du client, édités depuis `/admin`. Ces fichiers sont versionnés dans ce
dépôt (contenu de démarrage historique) mais **ne représentent jamais
l'état réel du site en production**, qui évolue en direct via l'admin.

**Tout ZIP de déploiement/mise à jour livré au client doit exclure
entièrement `public/api/data/content/*.json`** (`realisations.json`,
`avis.json`, `textes.json`, `seo.json`, `settings.json`) — quelle que soit
la façon dont le ZIP est construit (`git ls-files`, copie manuelle, etc.).
Un ZIP contenant ces fichiers écrase le contenu réel du client s'il est
extrait par-dessus son hébergement (incident réel survenu : perte d'une
réalisation client, voir historique de la branche
`claude/matiereetnuance-site-dev-qkzx7w`).

Avant de livrer un ZIP :
1. Exclure `public/api/data/content/*.json` de l'archive.
2. Vérifier l'exclusion (`find` dans le dossier de build ne doit rien
   trouver sous `api/data/content/`).
3. Idéalement, simuler un déploiement réaliste : copier un site "existant"
   avec du contenu factice, extraire le ZIP par-dessus, vérifier que le
   contenu survit.

Voir `docs/DEPLOIEMENT.md`, section « ⚠️ Mettre à jour un site déjà en
ligne (sans perdre vos données) » pour la procédure complète destinée au
client.

## Si une évolution future nécessite de modifier la structure des fichiers de contenu

Le client doit en être informé **explicitement avant toute livraison** —
ne jamais livrer silencieusement un changement de schéma des fichiers
JSON de contenu (nouveaux champs obligatoires, renommage de clés,
changement de structure) sans le signaler clairement, puisque cela peut
rendre son contenu existant incompatible ou nécessiter une migration.

## Autres contraintes établies avec ce client

- Design, couleurs, typographies et composants existants : figés, à ne
  jamais modifier sauf si strictement nécessaire à une fonctionnalité
  demandée.
- Avant toute modification : analyser l'architecture existante, réutiliser
  les fonctions/composants déjà présents, éviter toute duplication de
  code.
- Après chaque modification : lint complet, tests de non-régression
  (HTTP + Playwright selon le cas), nettoyage systématique des données de
  test avant commit, capture d'écran de non-régression visuelle pour tout
  changement pouvant affecter le rendu.
