# Matière & Nuance — site web

Site vitrine développé fidèlement d'après le design validé dans Claude
Design (projet « Matière & Nuance direction artistique »). Site statique
(HTML/CSS/JS) + deux points d'API PHP (formulaire de contact, avis
Google), pensé pour un hébergement mutualisé classique (o2switch).

- Le site à déployer se trouve entièrement dans `public/`.
- Guide de mise en ligne complet (o2switch, DNS, e-mail, avis Google,
  SEO) : voir [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md).

## Structure

```
public/
├── *.html              Les 6 pages du site
├── assets/css/          Feuille de style (design system fidèle au projet Claude Design)
├── assets/js/            Comportements (animations, menu mobile, formulaire, avis)
├── assets/img/            Logos, esperluettes, visuels temporaires
├── api/                  Formulaire de contact + synchronisation avis Google (PHP)
├── robots.txt, sitemap.xml
└── .htaccess              HTTPS, URLs propres, sécurité, cache
```

## Développement local

Le site ne nécessite aucune compilation. Pour le prévisualiser :

```bash
cd public
php -S 127.0.0.1:8000
```

Puis ouvrez http://127.0.0.1:8000/index.html (les URLs "propres" comme
`/contact` ne fonctionnent qu'avec Apache + `.htaccess`, pas avec le
serveur de développement PHP).
