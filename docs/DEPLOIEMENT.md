# Guide de mise en ligne — matiereetnuance.fr (o2switch)

Ce document explique comment mettre en ligne le site sur votre hébergement
o2switch et finaliser les intégrations (e-mail, avis Google, administration).
Il est écrit pour quelqu'un qui n'a pas forcément l'habitude de
l'administration serveur — suivez les étapes dans l'ordre.

## 1. Ce qui est déjà prêt

Tout le contenu du dossier `public/` constitue le site fini : pages PHP,
styles, scripts, formulaire de contact, synchronisation des avis Google et
**interface d'administration** pour gérer le contenu sans toucher au code.
Il n'y a rien à compiler : c'est du PHP classique, compatible avec
n'importe quel hébergement mutualisé (o2switch inclus). **PHP 8.1+ avec
l'extension GD** est requis (présente par défaut sur o2switch) pour
l'optimisation automatique des photos envoyées depuis l'administration.

```
public/
├── index.php, savoir-faire.php, realisations.php, realisation.php,
│   entreprise.php, avis.php, contact.php, 404.html
├── includes/            en-tête SEO, navigation, pied de page communs
├── admin/                interface d'administration (voir §6)
├── assets/               CSS, JS, images, logos, visuels temporaires
│   └── img/uploads/        photos envoyées depuis l'administration
├── api/
│   ├── config.php          ← à compléter (voir §3)
│   ├── contact.php          formulaire de contact (anti-spam inclus)
│   ├── google-reviews.php    synchronisation des avis Google
│   ├── lib/                   fonctions internes (dont la gestion de contenu)
│   └── data/
│       └── content/             contenu éditable (JSON : textes, réalisations, SEO…)
├── robots.txt, sitemap.php (généré dynamiquement)
└── .htaccess               HTTPS, URLs propres, sécurité, cache
```

## 2. Créer l'hébergement et pointer le domaine

1. Dans votre espace client o2switch, vérifiez que l'hébergement mutualisé
   est actif et que le domaine **matiereetnuance.fr** y est bien rattaché
   (Multisite/Domaines > Ajouter un domaine, si ce n'est pas déjà fait).
2. Si le domaine a été acheté ailleurs (OVH, Gandi…), pointez ses
   serveurs DNS (NS) vers ceux d'o2switch, ou a minima créez un enregistrement
   `A` vers l'IP fournie par o2switch et un `CNAME` pour `www`.
3. Une fois le domaine actif sur l'hébergement, activez le certificat SSL
   gratuit (cPanel > SSL/TLS Status > "Exécuter l'AutoSSL"). Le `.htaccess`
   fourni force automatiquement HTTPS et le sous-domaine `www` — vérifiez
   que ces deux règles sont bien actives (non commentées) dans le fichier
   une fois le certificat en place.

## 3. Compléter la configuration avant l'envoi des fichiers

Ouvrez `public/api/config.php` et vérifiez/complétez :

- `from_email` : `noreply@matiereetnuance.fr`. **Créez cette boîte** dans
  cPanel > Comptes e-mail > Créer, une fois le domaine actif (aucune
  utilisation manuelle nécessaire, elle sert uniquement à l'envoi
  automatique — cela évite que les e-mails partent en spam chez Hotmail).
- `google_places_api_key` / `google_place_id` : à renseigner pour activer
  la synchronisation automatique des avis (voir §5).
- L'adresse qui **reçoit** les demandes du formulaire (`contact_recipient`)
  et le lien Instagram se règlent désormais depuis l'administration
  (menu « Réglages »), pas dans ce fichier.

Vous pouvez aussi définir la clé Google comme variable d'environnement
côté serveur (cPanel > Configurer PHP > variables d'environnement) plutôt
que de l'écrire en clair dans le fichier : `GOOGLE_PLACES_API_KEY` et
`GOOGLE_PLACE_ID`.

## 4. Envoyer les fichiers sur o2switch

1. Récupérez vos identifiants FTP/SFTP dans cPanel > Comptes FTP (ou
   utilisez le "Gestionnaire de fichiers" du cPanel directement dans le
   navigateur).
2. Ouvrez le dossier `public_html` du domaine matiereetnuance.fr et envoyez
   **tout le contenu du dossier `public/`** de ce projet (pas le dossier
   `public` lui-même, son contenu) directement à la racine.
3. Vérifiez les droits en écriture (755, ou 775 si besoin) pour :
   - `api/data/` (cache avis, anti-spam, contenu éditable, sauvegardes) ;
   - `assets/img/uploads/` (photos envoyées depuis l'administration).
   Aucun de ces dossiers n'est accessible publiquement en listing — seul
   le site et l'administration peuvent y écrire/lire.
4. Dans cPanel > "Sélecteur de version PHP" (MultiPHP Manager), choisissez
   **PHP 8.1 ou supérieur**, et vérifiez que l'extension **GD** est cochée
   (elle l'est par défaut chez o2switch).

## 5. Activer la synchronisation automatique des avis Google

Méthode officielle Google (API Places) :

1. Rendez-vous sur [console.cloud.google.com](https://console.cloud.google.com),
   créez un projet (gratuit).
2. Dans "API et services" > "Bibliothèque", activez **"Places API"**.
3. Dans "Identifiants", créez une clé API. Cliquez sur la clé pour la
   restreindre :
   - Restriction d'application : "Référents HTTP", ajoutez
     `https://www.matiereetnuance.fr/*`.
   - Restriction d'API : limitez-la à "Places API" uniquement.
4. Récupérez le **Place ID** de votre fiche via l'outil officiel :
   https://developers.google.com/maps/documentation/places/web-service/place-id
5. Renseignez la clé et le Place ID dans `api/config.php` (ou en variables
   d'environnement, voir §3).

Une fois en place, la page Avis et la section Avis de l'accueil affichent
automatiquement la note moyenne, le nombre d'avis et les derniers avis
publiés sur votre fiche — sans aucune intervention manuelle. Vous pouvez
masquer entièrement la section (menu admin « Avis Google ») si besoin,
mais les avis eux-mêmes ne se modifient jamais depuis le site, exactement
comme sur votre fiche Google.

## 6. L'interface d'administration

Accessible à **https://www.matiereetnuance.fr/admin/** une fois le site en
ligne.

- **Identifiant** : `admin`
- **Mot de passe initial** : celui qui vous a été communiqué au moment du
  développement — **changez-le dès votre première connexion** (menu « Mot
  de passe »), il est stocké haché (jamais en clair), avec une limitation
  du nombre de tentatives de connexion et une protection CSRF.

Ce que vous pouvez gérer sans toucher au code :

| Menu | Ce que ça permet |
|---|---|
| **Réalisations** | Ajouter/modifier/supprimer un projet : titre, ville, description, prestations, date, image principale, avant/après, galerie photo (glisser-déposer, optimisation automatique JPEG + WebP, texte alternatif suggéré automatiquement). Chaque réalisation génère automatiquement sa page dédiée (`/realisations/votre-slug`) avec son propre référencement (titre, description, Open Graph, fil d'Ariane, données structurées), et des liens vers la réalisation précédente/suivante. |
| **Textes** | Accroche et texte d'accueil, histoire de l'entreprise, chiffres clés, note moyenne affichée, coordonnées affichées publiquement. |
| **Photos du site** | Remplace les visuels uniques (hero, portraits, cartes de zone…) — glisser-déposer, optimisation automatique. |
| **Avis Google** | Affiche ou masque la section (les avis eux-mêmes ne s'éditent pas ici, voir §5). |
| **SEO** | Meta Title, Meta Description et balises Open Graph, page par page. |
| **Réglages** | Adresse e-mail qui reçoit les demandes du formulaire de contact, lien Instagram. |
| **Mot de passe** | Changer le mot de passe de connexion. |

Une **sauvegarde horodatée automatique** est créée avant chaque
enregistrement (les 20 dernières versions sont conservées par type de
contenu), dans `api/data/content/backups/` — en cas d'erreur, demandez à
votre développeur de restaurer l'une de ces copies.

**Important — fidélité au design** : l'administration ne permet de
modifier que le *contenu* (textes, photos, réalisations). La mise en page,
les couleurs, les typographies et les animations restent strictement
celles validées dans Claude Design et ne sont pas éditables depuis
l'administration — c'est voulu.

## 7. Vérifications après mise en ligne

- Ouvrez https://www.matiereetnuance.fr et vérifiez que le cadenas HTTPS
  est présent, que les 6 pages sont accessibles, et que le design
  correspond au projet Claude Design.
- Connectez-vous à `/admin/`, changez le mot de passe, publiez une
  réalisation de test et vérifiez que sa page s'affiche bien.
- Testez le formulaire de contact avec votre propre e-mail : vous devez
  recevoir la demande à l'adresse réglée dans l'admin, et un e-mail de
  confirmation doit arriver sur l'adresse indiquée dans le formulaire.
- Vérifiez que `https://www.matiereetnuance.fr/robots.txt` et
  `/sitemap.xml` répondent correctement (le sitemap inclut automatiquement
  vos réalisations).

## 8. Référencement (à faire une fois le site en ligne)

1. [Google Search Console](https://search.google.com/search-console) :
   ajoutez la propriété `https://www.matiereetnuance.fr`, validez-la, puis
   soumettez `sitemap.xml`.
2. Reliez votre fiche **Google Business Profile** existante à ces mêmes
   informations (adresse, téléphone, zone d'intervention).
3. Les données structurées (Schema.org), balises Open Graph, canonical et
   balises ALT sont en place sur chaque page — éditables depuis
   l'administration pour le contenu qui vous concerne (§6).

## 9. Remplacer les visuels temporaires

Deux méthodes possibles :

1. **Depuis l'administration** (recommandé) : menu « Photos du site » pour
   les visuels uniques, ou « Réalisations » pour les photos de chantiers —
   glisser-déposer, optimisation automatique, aucune manipulation de
   fichier nécessaire.
2. **Manuellement** : les visuels de secours restent dans
   `assets/img/placeholders/` et s'affichent tant qu'aucune photo n'a été
   envoyée depuis l'administration pour cet emplacement.

## 10. Support technique courant

- **Support en cas de blocage** : toutes les actions de contenu passent
  par `/admin/` — il ne devrait plus être nécessaire de modifier le code
  pour les mises à jour courantes (textes, photos, réalisations, SEO).
- **Mot de passe oublié** : demandez à votre développeur de réinitialiser
  `api/data/content/admin-secrets.json` (ou de le supprimer pour revenir
  au mot de passe initial défini dans `config.php`).
