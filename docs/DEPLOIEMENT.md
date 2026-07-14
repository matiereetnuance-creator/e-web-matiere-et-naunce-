# Guide de mise en ligne — matiereetnuance.fr (o2switch)

Ce document explique comment mettre en ligne le site sur votre hébergement
o2switch et finaliser les intégrations (e-mail, avis Google). Il est écrit
pour quelqu'un qui n'a pas forcément l'habitude de l'administration
serveur — suivez les étapes dans l'ordre.

## 1. Ce qui est déjà prêt

Tout le contenu du dossier `public/` constitue le site fini : pages HTML,
styles, scripts, formulaire de contact et synchronisation des avis Google.
Il n'y a rien à compiler ni à installer : c'est un site statique + deux
scripts PHP, compatible avec n'importe quel hébergement mutualisé
(o2switch inclus).

```
public/
├── index.html, savoir-faire.html, realisations.html, entreprise.html,
│   avis.html, contact.html, 404.html
├── assets/            (CSS, JS, images, logos, visuels temporaires)
├── api/
│   ├── config.php      ← à compléter (voir §3)
│   ├── contact.php      formulaire de contact (anti-spam inclus)
│   ├── google-reviews.php  synchronisation des avis Google
│   ├── lib/             fonctions internes
│   └── data/             cache & anti-spam (créé automatiquement, jamais accessible publiquement)
├── robots.txt, sitemap.xml
└── .htaccess            HTTPS, URLs propres, sécurité, cache
```

## 2. Créer l'hébergement et pointer le domaine

1. Dans votre espace client o2switch, vérifiez que l'hébergement mutualisé
   est actif et que le domaine **matiereetnuance.fr** y est bien rattaché
   (Multisite/Domaines > Ajouter un domaine, si ce n'est pas déjà fait).
2. Si le domaine a été acheté ailleurs (OVH, Gandi…), pointez ses
   serveurs DNS (NS) vers ceux d'o2switch, ou a minima créez un enregistrement
   `A` vers l'IP fournie par o2switch et un `CNAME` pour `www`. o2switch
   fournit ces informations dans "Mes domaines".
3. Une fois le domaine actif sur l'hébergement, activez le certificat SSL
   gratuit (cPanel > SSL/TLS Status > "Exécuter l'AutoSSL"). Le `.htaccess`
   fourni force automatiquement HTTPS et le sous-domaine `www`.

## 3. Compléter la configuration avant l'envoi des fichiers

Ouvrez `public/api/config.php` et vérifiez/complétez :

- `contact_recipient` : déjà réglé sur `matiereetnuance@hotmail.com`.
- `from_email` : `noreply@matiereetnuance.fr`. **Créez cette boîte** dans
  cPanel > Comptes e-mail > Créer, une fois le domaine actif (aucune
  utilisation manuelle nécessaire, elle sert uniquement à l'envoi
  automatique — cela évite que les e-mails partent en spam chez Hotmail).
- `google_places_api_key` / `google_place_id` : à renseigner pour activer
  la synchronisation automatique des avis (voir §5). Tant qu'ils sont
  vides, le site affiche les avis "de secours" déjà présents dans les
  pages, sans erreur.

Vous pouvez aussi définir ces deux dernières valeurs comme variables
d'environnement côté serveur (cPanel > Configurer PHP > variables
d'environnement) plutôt que de les écrire en clair dans le fichier :
`GOOGLE_PLACES_API_KEY` et `GOOGLE_PLACE_ID`.

## 4. Envoyer les fichiers sur o2switch

1. Récupérez vos identifiants FTP/SFTP dans cPanel > Comptes FTP (ou
   utilisez le "Gestionnaire de fichiers" du cPanel directement dans le
   navigateur).
2. Avec un client FTP (FileZilla, Cyberduck…), connectez-vous à votre
   hébergement et ouvrez le dossier `public_html` (ou `www`) du domaine
   matiereetnuance.fr.
3. Envoyez **tout le contenu du dossier `public/`** de ce projet
   (pas le dossier `public` lui-même, son contenu) directement à la
   racine `public_html`.
4. Vérifiez les droits du dossier `api/data/` : il doit être accessible en
   écriture par PHP (droits `755`, ou `775` si besoin). Il stocke
   uniquement un compteur anti-spam et un cache d'avis Google — aucune
   donnée personnelle n'y est conservée durablement.
5. Dans cPanel > "Sélecteur de version PHP" (MultiPHP Manager), choisissez
   **PHP 8.1 ou supérieur** pour le domaine.

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
   (recherchez "Matière & Nuance" ou votre adresse).
5. Renseignez la clé et le Place ID dans `api/config.php` (ou en variables
   d'environnement, voir §3).

Une fois en place, la page Avis et la section Avis de l'accueil affichent
automatiquement la note moyenne, le nombre d'avis et les derniers avis
publiés sur votre fiche — sans aucune intervention manuelle, avec un
cache d'une heure pour ne pas consommer inutilement le quota gratuit de
l'API (très largement suffisant pour ce volume de trafic).

Le bouton "Voir tous les avis sur Google" pointe automatiquement vers
votre fiche une fois l'API active.

## 6. Vérifications après mise en ligne

- Ouvrez https://www.matiereetnuance.fr et vérifiez que le cadenas HTTPS
  est présent, que les 6 pages sont accessibles, et que le design
  correspond au projet Claude Design.
- Testez le formulaire de contact avec votre propre e-mail : vous devez
  recevoir la demande sur matiereetnuance@hotmail.com, et un e-mail de
  confirmation doit arriver sur l'adresse indiquée dans le formulaire.
  Si l'e-mail n'arrive pas, vérifiez dans cPanel > "Suivi des e-mails"
  qu'il a bien été envoyé (les hébergements mutualisés utilisent la
  fonction `mail()` de PHP, fournie par o2switch).
- Vérifiez que `https://www.matiereetnuance.fr/robots.txt` et
  `/sitemap.xml` répondent correctement.

## 7. Référencement (à faire une fois le site en ligne)

1. [Google Search Console](https://search.google.com/search-console) :
   ajoutez la propriété `https://www.matiereetnuance.fr`, validez-la (une
   méthode simple : ajouter la balise HTML fournie par Google dans le
   `<head>` de chaque page, ou passer par la vérification de domaine DNS),
   puis soumettez `sitemap.xml`.
2. Reliez votre fiche **Google Business Profile** existante à ces mêmes
   informations (adresse, téléphone, zone d'intervention) pour la
   cohérence du référencement local.
3. Les données structurées (Schema.org LocalBusiness), balises Open
   Graph, canonical, et balises ALT sont déjà en place sur chaque page.

## 8. Remplacer les visuels temporaires

Chaque photo du site est actuellement un visuel de substitution élégant
(fond crème avec le nom de la photo attendue), aux mêmes dimensions que
le design validé. Pour les remplacer :

1. Préparez vos photos aux formats JPG/WebP, compressées (< 400 Ko
   idéalement) pour rester sous la barre des 2 secondes de chargement.
2. Remplacez le fichier correspondant dans `assets/img/placeholders/`
   **en gardant exactement le même nom de fichier** (ex :
   `hero-main.svg` → vous pouvez le remplacer par un fichier `hero-main.jpg`
   à condition de mettre à jour le `src=` correspondant dans le fichier
   HTML ; le plus simple est de garder le nom de base et l'extension
   `.jpg`/`.webp`, puis d'ajuster les 2-3 lignes `src="assets/img/placeholders/xxx.svg"`
   dans les fichiers `.html` concernés).
3. Conservez les mêmes proportions (largeur/hauteur) que celles du
   design pour ne pas déformer les cadrages.

## 9. Support technique courant

- **Mettre à jour un texte** : chaque page est un fichier `.html` que
  vous pouvez éditer directement (texte en clair dans le code).
- **Ajouter un avis statique de secours** : dupliquez un bloc
  `<blockquote class="quote-card">…</blockquote>` dans `avis.html` ou
  `index.html`.
- **Changer le sitemap** après ajout de page : mettez à jour
  `sitemap.xml` avec la nouvelle URL.
