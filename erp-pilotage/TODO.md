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
- [ ] **Installer une fois sur un classeur de test réel** (jamais
  exécuté dans un vrai Google Sheets depuis cet environnement de
  développement — voir KNOWN_LIMITATIONS.md). Vérifier à l'œil que la
  mise en forme correspond aux maquettes fournies en revue
  d'architecture.
- [ ] **Réinstaller une seconde fois sur ce même classeur de test**
  après avoir saisi des données (Charges, Paramètres) pour confirmer
  de visu qu'aucune n'est perdue (idempotence vérifiée par
  raisonnement sur le code, pas par exécution réelle).

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

## Quand le temps le permet

- [ ] Relire les notes (tooltips) posées sur les cellules clés et
  ajuster le vocabulaire si besoin (Paramètres, Charges,
  Prévisionnel).
- [ ] Vérifier le rendu des couleurs de mise en forme conditionnelle à
  l'écran (les valeurs hexadécimales ont été choisies sans aperçu
  visuel réel — voir KNOWN_LIMITATIONS.md).
