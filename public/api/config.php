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

    // Adresse technique d'envoi (créée sur o2switch une fois le domaine
    // hébergé — cPanel > Comptes e-mail > noreply@matiereetnuance.fr).
    // Elle bénéficie du SPF/DKIM du domaine, ce qui évite les faux
    // positifs "spam" chez Hotmail/Outlook lors de la réception.
    'from_email' => 'noreply@matiereetnuance.fr',
    'from_name'  => 'Matière & Nuance — Site web',

    // Nom affiché à l'utilisateur pour les e-mails de confirmation.
    'site_name' => 'Matière & Nuance',
    'site_url'  => 'https://www.matiereetnuance.fr',

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
