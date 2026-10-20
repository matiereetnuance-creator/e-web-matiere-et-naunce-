<?php
/**
 * Configuration du site — Matière & Nuance
 *
 * Ce fichier centralise les réglages sensibles. Il n'est jamais exposé
 * directement (voir api/.htaccess) et n'est chargé que via include().
 *
 * À COMPLÉTER avant mise en ligne : voir docs/DEPLOIEMENT.md
 */

return [

    // Adresse qui reçoit les demandes du formulaire de contact.
    'contact_recipient' => 'matiereetnuance@hotmail.com',

    // Adresse technique d'envoi. DOIT être une vraie boîte e-mail créée
    // sur o2switch (cPanel > Comptes e-mail) et correspondre exactement
    // à 'smtp_username' ci-dessous : c'est ce qui garantit l'alignement
    // SPF/DKIM/DMARC attendu par Outlook et Gmail. Éviter "noreply@" —
    // les filtres antispam le pénalisent légèrement ; une adresse comme
    // contact@matiereetnuance.fr paraît plus légitime.
    'from_email' => getenv('MAIL_FROM_EMAIL') ?: 'contact@matiereetnuance.fr',
    'from_name'  => getenv('MAIL_FROM_NAME') ?: 'Matière & Nuance',

    // Nom affiché à l'utilisateur pour les e-mails de confirmation.
    'site_name' => 'Matière & Nuance',
    'site_url'  => 'https://www.matiereetnuance.fr',

    // --- Envoi authentifié (SMTP o2switch) ------------------------------
    // Recommandé pour une délivrabilité professionnelle (voir
    // docs/DEPLOIEMENT.md, section « Délivrabilité des e-mails »).
    // Tant que smtp_username/smtp_password sont vides, le site se replie
    // automatiquement sur mail() — fonctionnel, mais avec une
    // délivrabilité moins fiable.
    // 1. cPanel > Comptes e-mail > créer contact@matiereetnuance.fr.
    // 2. Renseigner ci-dessous cette adresse + son mot de passe (via les
    //    variables d'environnement SMTP_USERNAME / SMTP_PASSWORD, jamais
    //    en clair dans ce fichier).
    // 3. smtp_host est généralement le nom de domaine lui-même sur
    //    o2switch (mail.matiereetnuance.fr) ; à confirmer dans cPanel >
    //    Comptes e-mail > Configurer le client de messagerie.
    'smtp_host'       => getenv('SMTP_HOST') ?: 'mail.matiereetnuance.fr',
    'smtp_port'       => (int) (getenv('SMTP_PORT') ?: 465),
    'smtp_secure'     => getenv('SMTP_SECURE') ?: 'ssl', // 'ssl' (port 465) ou 'tls' (port 587, STARTTLS)
    'smtp_username'   => getenv('SMTP_USERNAME') ?: '',
    'smtp_password'   => getenv('SMTP_PASSWORD') ?: '',

    // Limites anti-spam (voir api/contact.php).
    'rate_limit' => [
        'max_per_10_minutes' => 3,
        'max_per_day'        => 8,
    ],

    // --- Avis Google (Google Places API — méthode officielle) ---------
    // 1. Console Google Cloud > créer un projet > activer "Places API".
    // 2. Créer une clé API, la restreindre par référent HTTP à
    //    https://www.matiereetnuance.fr/* et à l'API "Places API".
    // 3. Récupérer le Place ID de la fiche via :
    //    https://developers.google.com/maps/documentation/places/web-service/place-id
    // 4. Renseigner les deux valeurs ci-dessous.
    // Tant qu'elles sont vides, le site affiche les avis de secours
    // (statiques, issus du design validé) sans bloquer l'affichage.
    'google_places_api_key' => getenv('GOOGLE_PLACES_API_KEY') ?: '',
    'google_place_id'       => getenv('GOOGLE_PLACE_ID') ?: '',

    // Durée de cache des avis Google en secondes (évite de consommer
    // le quota d'API à chaque visite). 3600 = 1 heure.
    'google_reviews_cache_ttl' => 3600,

    // --- Administration (/admin) ---------------------------------------
    // Identifiant + hash du mot de passe (jamais le mot de passe en clair).
    // Pour changer le mot de passe manuellement :
    //   php -r "echo password_hash('nouveau-mot-de-passe', PASSWORD_DEFAULT);"
    // puis coller le résultat ci-dessous. Le formulaire "Changer le mot de
    // passe" de l'admin fait exactement cela pour vous.
    'admin_username'      => getenv('ADMIN_USERNAME') ?: 'admin',
    'admin_password_hash' => getenv('ADMIN_PASSWORD_HASH') ?: '$2y$12$fMxSkVNdzsqVDfN.s6VjmO7S5D0U0x.EyDWq7iUUVales.lo1y/MG',

    // Limite de tentatives de connexion admin (protection brute-force).
    'admin_rate_limit' => [
        'max_per_10_minutes' => 5,
        'max_per_day'        => 20,
    ],

    // --- Google Analytics 4 --------------------------------------------
    // Identifiant de mesure (Admin Google Analytics > Flux de données).
    // Laisser vide pour désactiver le suivi (aucune balise n'est alors
    // injectée). Voir includes/analytics.php pour l'intégration.
    'ga4_measurement_id' => getenv('GA4_MEASUREMENT_ID') ?: 'G-64S51T6H5Q',
];
