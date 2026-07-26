# Roadmap — évolutions possibles

Ce fichier liste des pistes d'évolution **non développées** (le
périmètre fonctionnel est figé depuis la V3). Chaque entrée nécessite
une décision explicite du client avant tout développement — voir
CLAUDE.md du dépôt sur l'information préalable en cas de changement de
schéma de données.

## Probables, si le besoin se confirme

- **Filtrer le CA/marge réalisés par statut Chantiers** (ex. ne compter
  que les chantiers "Facturé"). Le mécanisme est déjà prêt côté code
  (`extraCondition` de `monthlyAmountFormula_()`/`annualAmountFormula_()`,
  `CHANTIERS_STATUT` déjà relié) — il manque uniquement la
  confirmation des valeurs réelles de ce statut chez le client.
- **Historique multi-exercices consultable** depuis le fichier de
  l'année en cours (actuellement, "Nouvel exercice" crée un fichier
  séparé par année — voir README §Nouvel exercice). Nécessiterait de
  revoir le modèle "un fichier par an" avec le client avant toute
  implémentation.
- **Pondération saisonnière de l'objectif mensuel** (Prévisionnel
  répartit actuellement l'objectif annuel à parts égales sur 12 mois ;
  le bâtiment a souvent une activité plus faible en hiver). Nécessite
  une décision client sur la méthode de pondération.

## Envisageables, non prioritaires

- Export PDF automatique du Dashboard (rapport mensuel imprimable).
- Notification automatique (e-mail) si l'avancement décroche
  fortement de l'objectif à mi-exercice.
- Montant TTC affiché à la demande sur une charge donnée (actuellement
  non stocké — voir note sur Charges!Montant HT).

## Explicitement écartées pour l'instant

- Toute automatisation liée à la facturation ou à la comptabilité
  (hors périmètre ERP de pilotage).
- Gestion multi-utilisateurs avec droits différenciés (le classeur est
  conçu pour un dirigeant unique — voir choix "protection en mode
  avertissement" dans ARCHITECTURE.md §5).
