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
l'optimisation automatique des photos envoyées depuis l'administration :
redimensionnement, compression, conversion JPEG + WebP et génération
d'une miniature, quelle que soit la taille du fichier d'origine (jusqu'à
20 Mo par photo — largement au-dessus d'une photo iPhone classique).

Les photos au format **HEIC** (réglage par défaut de l'appareil photo
iPhone) sont converties automatiquement si l'extension **Imagick** est
installée avec le délégué **libheif** — à vérifier/activer dans cPanel >
"Sélecteur de version PHP" > Extensions PHP. Si ce n'est pas le cas,
l'administration affiche un message clair demandant d'exporter la photo
en JPG avant l'envoi (l'app Photos de l'iPhone sait le faire), plutôt
que d'échouer silencieusement.

```
public/
├── index.php, savoir-faire.php, realisations.php, realisation.php,
│   entreprise.php, avis.php, contact.php, 404.html
├── includes/            en-tête SEO, navigation, pied de page communs
├── admin/                interface d'administration (voir §7)
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

- `from_email` / SMTP : voir §4 « Délivrabilité des e-mails » — c'est
  l'étape la plus importante pour que vos e-mails arrivent en boîte de
  réception plutôt qu'en courrier indésirable.
- `google_places_api_key` / `google_place_id` : à renseigner pour activer
  la synchronisation automatique des avis (voir §6 « Activer la
  synchronisation automatique des avis Google »).
- L'adresse qui **reçoit** les demandes du formulaire (`contact_recipient`)
  et le lien Instagram se règlent désormais depuis l'administration
  (menu « Réglages »), pas dans ce fichier.

Vous pouvez aussi définir la clé Google comme variable d'environnement
côté serveur (cPanel > Configurer PHP > variables d'environnement) plutôt
que de l'écrire en clair dans le fichier : `GOOGLE_PLACES_API_KEY` et
`GOOGLE_PLACE_ID`.

## 4. Délivrabilité des e-mails (SMTP, SPF, DKIM, DMARC)

Le formulaire de contact peut envoyer ses e-mails de deux façons :

1. **SMTP authentifié o2switch** (recommandé) — le site se connecte avec
   une vraie boîte e-mail du domaine, comme n'importe quel client de
   messagerie. C'est la méthode la plus fiable pour éviter le classement
   en courrier indésirable.
2. **`mail()` PHP** (repli automatique) — fonctionne sans configuration,
   mais confie le message au serveur sans authentification ; la
   délivrabilité est moins bonne, en particulier chez Outlook/Hotmail.

### 4.1 Activer le SMTP authentifié (recommandé)

1. cPanel > **Comptes e-mail** > créez `contact@matiereetnuance.fr` (ou
   l'adresse de votre choix sur le domaine) avec un mot de passe robuste.
2. Dans cPanel > Comptes e-mail > **Configurer le client de messagerie**
   pour cette adresse, notez le serveur SMTP indiqué (généralement
   `mail.matiereetnuance.fr`, port **465** en SSL, ou 587 en STARTTLS).
3. Renseignez ces informations soit directement dans `api/config.php`,
   soit — préférable, pour ne jamais écrire le mot de passe en clair dans
   un fichier — en variables d'environnement (cPanel > "Configurer PHP" >
   variables d'environnement, ou fichier `.env` selon ce que propose votre
   offre) :
   - `SMTP_HOST` (ex. `mail.matiereetnuance.fr`)
   - `SMTP_PORT` (`465` ou `587`)
   - `SMTP_SECURE` (`ssl` pour 465, `tls` pour 587)
   - `SMTP_USERNAME` (`contact@matiereetnuance.fr`)
   - `SMTP_PASSWORD` (le mot de passe de cette boîte)
   - `MAIL_FROM_EMAIL` : à régler sur la **même adresse** que
     `SMTP_USERNAME` (obligatoire pour l'alignement SPF/DMARC).
4. Tant que `SMTP_USERNAME`/`SMTP_PASSWORD` sont vides, le site continue de
   fonctionner via `mail()` automatiquement — aucune coupure de service
   pendant la mise en place.

### 4.2 Vérifier les enregistrements DNS du domaine

Ces enregistrements existent déjà sur `matiereetnuance.fr` (vérifiés lors
de l'audit) — à recontrôler après toute modification DNS :

- **SPF** (TXT sur `matiereetnuance.fr`) doit inclure l'IP/le serveur
  d'envoi o2switch. Envisagez de durcir `~all` (résultat "probablement
  spam" en cas d'échec) en `-all` (résultat "rejeté") une fois la
  configuration SMTP stabilisée et testée pendant quelques semaines.
- **DKIM** (TXT sur `default._domainkey.matiereetnuance.fr`) doit être
  présent et actif (cPanel > "E-mail" > "Gestionnaire d'authentification
  par e-mail" côté o2switch) — c'est lui qui signe cryptographiquement vos
  e-mails pour prouver qu'ils viennent bien du domaine.
- **DMARC** (TXT sur `_dmarc.matiereetnuance.fr`) : ajoutez une adresse de
  rapport pour être informé des échecs d'authentification, par exemple
  `v=DMARC1; p=none; rua=mailto:contact@matiereetnuance.fr;`. Après
  quelques semaines sans échec inattendu dans les rapports, passez
  progressivement `p=none` à `p=quarantine` puis `p=reject` pour une
  protection complète contre l'usurpation de votre domaine.

### 4.3 Bonnes pratiques d'expéditeur

- Adresse d'expédition sur le **domaine du site** (`@matiereetnuance.fr`),
  jamais une adresse Hotmail/Gmail générique.
- Évitez les préfixes `noreply@` : ils sont légèrement pénalisés par les
  filtres antispam et donnent une impression automatisée. Une adresse
  comme `contact@matiereetnuance.fr` est préférable.
- Objet et corps du message sans majuscules excessives, liens raccourcis
  ou vocabulaire commercial agressif (« gratuit », « urgent »…) — déjà le
  cas dans les modèles fournis.
- Une fois quelques e-mails envoyés en conditions réelles, marquez-les
  "Ce n'est pas un spam" s'ils arrivent malgré tout en courrier
  indésirable chez un premier destinataire Outlook/Gmail : cela contribue
  à réchauffer la réputation de l'adresse d'envoi.

## 5. Envoyer les fichiers sur o2switch

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

### ⚠️ Mettre à jour un site déjà en ligne (sans perdre vos données)

Un ZIP de mise à jour ne contient **jamais** vos données de production —
volontairement, car ce sont vos données, pas du code. Le ZIP ne contient
que le contenu de démonstration d'origine pour ces fichiers. **Ne
supprimez jamais tout `public_html` avant d'extraire une mise à jour** :
cela effacerait ces éléments propres à votre site, générés uniquement en
production et absents du ZIP :

- `api/data/content/admin-secrets.json` — votre mot de passe
  d'administration personnalisé (si vous en avez défini un depuis
  `/admin/`). Sans ce fichier, le site revient au mot de passe par défaut
  du code source.
- `api/data/content/realisations.json`, `textes.json`, `settings.json`,
  `seo.json` — **si vous les avez modifiés depuis l'administration**,
  vos modifications y sont stockées. Le ZIP contient sa propre version
  (contenu de démonstration ou dernière version connue de ce projet) qui
  écraserait les vôtres si vous remplacez le fichier.
- `assets/img/uploads/` — toutes les photos envoyées depuis
  l'administration.

**Procédure sûre pour une mise à jour :**

1. Avant toute chose, téléchargez une copie de sauvegarde de ces
   éléments depuis le Gestionnaire de fichiers (clic droit > Télécharger) :
   `api/data/content/admin-secrets.json`, `api/data/content/*.json`,
   `assets/img/uploads/`.
2. Extrayez le nouveau ZIP **par-dessus** `public_html` sans rien
   supprimer au préalable (le gestionnaire de fichiers o2switch propose
   d'écraser fichier par fichier) — cela met à jour le code sans toucher
   aux dossiers que le ZIP ne contient pas.
3. Si un fichier de contenu a malgré tout été écrasé, restaurez la copie
   de sauvegarde de l'étape 1 par-dessus.
4. Vérifiez la connexion à `/admin/` et l'affichage de vos réalisations
   avant de considérer la mise à jour terminée.

Un remplacement intégral (suppression puis ré-extraction) reste sûr
**uniquement** si vous n'avez encore rien personnalisé depuis
l'administration, ou si vous avez sauvegardé ces éléments au préalable.

## 6. Activer la synchronisation automatique des avis Google

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

## 7. L'interface d'administration

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
| **Réalisations** | Ajouter/modifier/supprimer un projet : titre, ville, description, prestations, date, image principale, avant/après, galerie photo. La galerie accepte l'envoi de **plusieurs photos en une seule fois** (ex. 10 photos sélectionnées d'un coup depuis l'iPhone) : chacune est redimensionnée, compressée, convertie en JPEG + WebP, avec sa miniature et son texte alternatif suggéré automatiquement — une photo illisible n'empêche pas l'ajout des autres. Chaque réalisation génère automatiquement sa page dédiée (`/realisations/votre-slug`) avec son propre référencement (titre, description, Open Graph, fil d'Ariane, données structurées), et des liens vers la réalisation précédente/suivante. |
| **Textes** | Accroche et texte d'accueil, histoire de l'entreprise, chiffres clés, note moyenne affichée, coordonnées affichées publiquement. |
| **Photos du site** | Remplace les visuels uniques (hero, portraits, cartes de zone…) — glisser-déposer, optimisation automatique. |
| **Avis Google** | Affiche ou masque la section (les avis eux-mêmes ne s'éditent pas ici, voir §6). |
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

## 8. Vérifications après mise en ligne

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
- **Délivrabilité** : envoyez un test via le formulaire vers une adresse
  [mail-tester.com](https://www.mail-tester.com/) pour obtenir un score
  détaillé (SPF, DKIM, DMARC, contenu) et confirmer que le SMTP
  authentifié (§4) est bien actif plutôt que le repli `mail()`.

## 9. Référencement (à faire une fois le site en ligne)

1. [Google Search Console](https://search.google.com/search-console) :
   ajoutez la propriété `https://www.matiereetnuance.fr`, validez-la, puis
   soumettez `sitemap.xml`.
2. Reliez votre fiche **Google Business Profile** existante à ces mêmes
   informations (adresse, téléphone, zone d'intervention).
3. Les données structurées (Schema.org), balises Open Graph, canonical et
   balises ALT sont en place sur chaque page — éditables depuis
   l'administration pour le contenu qui vous concerne (§7).

## 10. Remplacer les visuels temporaires

Deux méthodes possibles :

1. **Depuis l'administration** (recommandé) : menu « Photos du site » pour
   les visuels uniques, ou « Réalisations » pour les photos de chantiers —
   glisser-déposer, optimisation automatique, aucune manipulation de
   fichier nécessaire.
2. **Manuellement** : les visuels de secours restent dans
   `assets/img/placeholders/` et s'affichent tant qu'aucune photo n'a été
   envoyée depuis l'administration pour cet emplacement.

## 11. Support technique courant

- **Support en cas de blocage** : toutes les actions de contenu passent
  par `/admin/` — il ne devrait plus être nécessaire de modifier le code
  pour les mises à jour courantes (textes, photos, réalisations, SEO).
- **Mot de passe oublié** : demandez à votre développeur de réinitialiser
  `api/data/content/admin-secrets.json` (ou de le supprimer pour revenir
  au mot de passe initial défini dans `config.php`).

## 12. Diagnostic : photo iPhone 16 Pro refusée à l'import

Incident constaté : certains imports de photos depuis un iPhone 16 Pro
(réglage Apple ProRAW activé) affichaient « Ce fichier est trop
volumineux (limite : 20 Mo) » — message correct dans son principe, mais
peu clair sur la cause réelle et pouvant laisser penser à un problème de
serveur. Investigation et correctifs apportés :

**Cause exacte.** Une photo prise avec Apple ProRAW activé n'est pas un
HEIC : c'est un fichier **DNG** (25 à 100 Mo selon le modèle), un format
de travail non destiné à la publication web, quelle que soit sa taille.
Le CMS ne faisait pas cette distinction et traitait tout fichier trop
volumineux de la même façon, sans dire qu'il s'agissait probablement
d'un fichier RAW plutôt que d'une vraie photo HEIC trop lourde.

**Deux bugs réels identifiés en creusant, corrigés :**

1. Quand un fichier dépasse `upload_max_filesize` ou `post_max_size`
   côté PHP, le serveur vide `tmp_name`/`size`/`type` avant même que le
   code du site s'exécute. L'ordre des vérifications faisait qu'un
   contrôle de sécurité (`is_uploaded_file()`) s'exécutait avant la
   lecture du code d'erreur PHP, ce qui affichait un message générique
   (« format non reconnu ») au lieu du bon message (« trop volumineux »).
   Corrigé en lisant le code d'erreur PHP en tout premier.
2. Dans un envoi groupé (plusieurs photos de galerie à la fois), un
   fichier en erreur au niveau PHP était ignoré silencieusement, sans
   aucun message — un fichier ProRAW mêlé à un lot de 10 photos
   disparaissait sans explication. Corrigé pour que chaque fichier,
   y compris en erreur, passe par la même analyse et remonte un
   avertissement nommé.

**Comportement désormais en place :**

- Un fichier **`.dng`** (Apple ProRAW), **`.jxl`** (JPEG-XL) ou autre
  format RAW d'appareil photo est détecté par son extension. S'il dépasse
  45 Mo, ou si le serveur ne sait pas le décoder, ou s'il s'agit d'un
  `.jxl`, il est refusé avec un message dédié : *« Cette photo semble
  avoir été prise en Apple ProRAW. Les photos RAW ne sont pas destinées à
  une publication web. Désactivez simplement RAW dans l'application
  Appareil photo puis reprenez la photo. »* — y compris si le fichier est
  si volumineux que PHP l'a déjà tronqué avant que le site ne le reçoive.
  Sinon, une **conversion automatique en JPEG est proposée** (voir §13).
- Un **HEIC classique** (photo iPhone normale, RAW désactivé) est
  accepté et converti automatiquement si Imagick + libheif sont
  disponibles sur le serveur (voir `/admin/diagnostic.php`).
- Si Imagick est absent, le message est : *« Votre serveur ne permet
  actuellement pas la conversion HEIC. Activez Imagick dans PHP ou
  utilisez un JPG. »*
- Toute erreur d'envoi affiche désormais, entre crochets, un **détail
  technique** (taille reçue, type MIME déclaré par le navigateur, type
  MIME réel détecté par lecture du fichier, extension, limites PHP
  effectives) — de quoi vérifier immédiatement si un blocage vient de ce
  site ou de la configuration serveur, sans avoir besoin d'un accès SSH.
- La page **`/admin/diagnostic.php`** (menu « Diagnostic serveur »)
  affiche en lecture seule : Imagick installé, support HEIC effectif,
  formats Imagick supportés, formats GD disponibles, ainsi que
  `upload_max_filesize`, `post_max_size`, `max_file_uploads` et
  `memory_limit` tels qu'appliqués réellement par le serveur.

**Sur Safari iOS spécifiquement** : la sélection d'une photo (y compris
une Live Photo) dans le sélecteur natif de l'iPhone ne transmet que
l'image fixe au champ `<input type="file">` — la partie vidéo d'une Live
Photo n'est jamais envoyée par un simple champ d'upload d'image, aucun
traitement particulier n'était donc nécessaire de ce côté. Le JPEG-XL
n'est à ce jour pas un format produit par l'appareil photo de l'iPhone ;
sa détection est incluse par précaution plutôt qu'en réponse à un cas
observé.

**Ce qui n'a délibérément pas changé** : la limite de 20 Mo par photo
n'a pas été augmentée. Une vraie photo HEIC ou JPEG issue d'un iPhone,
même en haute résolution, ne l'atteint pratiquement jamais ; le
symptôme observé venait de fichiers RAW envoyés par erreur, désormais
identifiés et expliqués clairement plutôt que masqués par une limite
plus haute.

## 13. Proposition de conversion automatique d'un RAW

Plutôt que de toujours refuser un fichier Apple ProRAW (`.dng`),
l'administration propose désormais sa conversion automatique en JPEG
optimisé quand c'est possible :

- Le fichier doit faire **45 Mo ou moins** (au-delà, conversion trop
  coûteuse pour un hébergement mutualisé — refus direct).
- Le serveur doit savoir décoder le DNG : Imagick installé **avec le
  délégué RAW** (dcraw ou libraw) — visible sur `/admin/diagnostic.php`,
  ligne « Conversion automatique RAW ». C'est un délégué différent de
  celui utilisé pour le HEIC (libheif) : les deux peuvent être présents
  ou absents indépendamment l'un de l'autre.

Si ces deux conditions sont réunies, l'écran affiche : *« Cette photo
(nom du fichier, taille) semble être un fichier Apple ProRAW (.dng).
Voulez-vous convertir cette photo en JPEG optimisé ? »* avec deux
boutons, **Convertir en JPEG** et **Annuler**. Rien n'est décodé avant
cette confirmation explicite. Le fichier original est mis de côté
(hors du dossier public, protégé par `.htaccess`) pendant 30 minutes,
purgé automatiquement si aucune réponse n'est donnée.

- Disponible pour **l'image principale**, **avant** et **après** d'une
  réalisation, ainsi que pour les **photos du site** (menu « Photos du
  site »). Pour une réalisation, les autres champs du formulaire (titre,
  ville, description…) restent conservés pendant l'attente de
  confirmation — rien n'est perdu, mais la réalisation n'est enregistrée
  qu'une fois chaque proposition résolue (converti ou annulé).
- **Non proposé dans l'envoi groupé de la galerie** (plusieurs photos à
  la fois) : la complexité de gérer plusieurs confirmations simultanées
  n'en valait pas la peine pour l'instant. Un RAW détecté dans un lot est
  signalé en avertissement, avec l'invitation à le renvoyer seul via
  l'image principale ou avant/après pour bénéficier de la conversion.

`upload_max_filesize` (`.user.ini`) est réglé à 50 Mo — volontairement
au-dessus du seuil de 45 Mo, sinon PHP tronquerait le fichier avant même
que le site ne puisse proposer sa conversion.

## 14. Conversion HEIC automatique, invisible, côté navigateur

Le diagnostic serveur (§7) a confirmé qu'Imagick est absent sur
l'hébergement o2switch utilisé — la conversion HEIC côté serveur (celle
qui dépend d'Imagick) n'y fonctionne donc pas. Plutôt que de dépendre
d'une extension PHP qu'un hébergement mutualisé n'active pas toujours,
la conversion HEIC → JPEG se fait désormais **dans le navigateur**,
avant l'envoi, via la bibliothèque [heic2any](https://github.com/alexcorvi/heic2any)
(MIT, auto-hébergée dans `admin/assets/vendor/`, aucun appel réseau
externe à l'exécution).

**Totalement invisible** : dès qu'une photo HEIC/HEIF est sélectionnée
dans un champ d'envoi de l'administration (image principale, avant,
après, galerie, photos du site), elle est convertie en JPEG (qualité
92 %) automatiquement — aucun bouton, aucune confirmation, aucun élément
d'interface visible. Le serveur ne reçoit jamais le fichier HEIC
d'origine ; il applique son traitement habituel (redimensionnement,
WebP, miniature) sur le JPEG déjà reçu, exactement comme pour n'importe
quelle autre photo.

- **JPG, PNG, WebP** : non touchés, envoyés tels quels (aucune
  reconversion, aucune perte de qualité).
- **RAW/ProRAW (.dng) et JPEG-XL (.jxl)** : non concernés par cette
  conversion — la détection et le message dédié (§12) ainsi que la
  proposition de conversion RAW (§13) restent inchangés.
- **Si la conversion échoue** (variante HEIC exotique, JavaScript
  désactivé, navigateur ancien) : le fichier d'origine part tel quel, et
  le serveur reprend la main avec son propre traitement (conversion via
  Imagick si disponible, sinon le message HEIC habituel) — l'utilisateur
  n'est jamais bloqué.
- **`/admin/diagnostic.php`** vérifie en direct (dans le navigateur qui
  charge la page, pas de simple supposition) que la bibliothèque se
  charge correctement et que les API nécessaires sont disponibles.

Aucune configuration serveur requise pour cette méthode : elle
fonctionne quel que soit l'état d'Imagick sur l'hébergement.
