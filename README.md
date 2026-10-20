# Matière & Nuance — site web

Site vitrine développé fidèlement d'après le design validé dans Claude
Design (projet « Matière & Nuance direction artistique »). Pages PHP
dynamiques (contenu géré depuis une administration privée) + design,
mise en page et animations strictement identiques au projet validé,
pensé pour un hébergement mutualisé classique (o2switch).

- Le site à déployer se trouve entièrement dans `public/`.
- Guide de mise en ligne complet (o2switch, DNS, e-mail, avis Google,
  administration, SEO) : voir [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md).

## Structure

```
public/
├── *.php                 Les pages du site (contenu dynamique, design statique)
├── includes/              En-tête SEO, navigation, pied de page communs
├── admin/                 Interface d'administration (contenu, sans toucher au code)
├── assets/css/             Feuille de style (design system fidèle au projet Claude Design)
├── assets/js/               Comportements (animations, menu mobile, formulaire, avis)
├── assets/img/               Logos, esperluettes, visuels temporaires, photos envoyées
├── api/                    Contact, avis Google, gestion de contenu (PHP)
├── robots.txt, sitemap.php  (sitemap généré dynamiquement)
└── .htaccess                HTTPS, URLs propres, sécurité, cache
```

## Administration

`/admin/` — identifiant `admin`, mot de passe communiqué séparément
(à changer dès la première connexion). Permet de gérer les réalisations,
textes, photos, SEO par page et réglages sans toucher au code. Détails
dans [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md) §6.

## Développement local

Le site nécessite PHP 8.1+ avec l'extension GD (optimisation d'images),
sans compilation. Pour le prévisualiser :

```bash
cd public
php -S 127.0.0.1:8000
```

Puis ouvrez http://127.0.0.1:8000/index.php (les URLs "propres" comme
`/contact` ou `/realisations/mon-projet` ne fonctionnent qu'avec Apache +
`.htaccess`, pas avec le serveur de développement PHP intégré).
