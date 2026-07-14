<?php
/**
 * Traitement du formulaire de contact — Matière & Nuance
 *
 * - Valide et nettoie les champs
 * - Bloque les robots (honeypot + délai minimum de saisie)
 * - Limite la fréquence des envois par IP
 * - Envoie la demande au studio + un e-mail de confirmation au visiteur
 */

declare(strict_types=1);

require __DIR__ . '/lib/helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Méthode non autorisée.'], 405);
}

$config = require __DIR__ . '/config.php';

// --- Anti-spam : honeypot -------------------------------------------------
if (!empty($_POST['site_web'])) {
    // Robot détecté : on répond succès pour ne pas l'informer, sans envoyer.
    json_response(['success' => true]);
}

// --- Anti-spam : délai minimum entre affichage et soumission -------------
$elapsedMs = isset($_POST['elapsed_ms']) ? (int) $_POST['elapsed_ms'] : 0;
if ($elapsedMs > 0 && $elapsedMs < 2500) {
    json_response(['success' => false, 'message' => 'Merci de patienter quelques secondes avant d’envoyer le formulaire.'], 422);
}

// --- Anti-spam : limite de fréquence par IP -------------------------------
try {
    enforce_rate_limit(__DIR__ . '/data/ratelimit.json', client_ip(), $config['rate_limit']);
} catch (RuntimeException $e) {
    json_response(['success' => false, 'message' => 'Trop de demandes envoyées récemment. Merci de réessayer plus tard ou de nous appeler directement.'], 429);
}

// --- Validation des champs -------------------------------------------------
$nom = clean_text((string) ($_POST['nom'] ?? ''), 120);
$contactVal = clean_text((string) ($_POST['contact_val'] ?? ''), 200);
$commune = clean_text((string) ($_POST['commune'] ?? ''), 120);
$projet = clean_text((string) ($_POST['projet'] ?? ''), 120);
$message = clean_text((string) ($_POST['message'] ?? ''), 4000);

$errors = [];
if ($nom === '') {
    $errors[] = 'le nom';
}
if ($contactVal === '') {
    $errors[] = 'un téléphone ou un email';
}
if ($message === '') {
    $errors[] = 'votre message';
}

if (!empty($errors)) {
    json_response([
        'success' => false,
        'message' => 'Merci de renseigner ' . implode(', ', $errors) . '.',
    ], 422);
}

$visitorEmail = filter_var($contactVal, FILTER_VALIDATE_EMAIL) ?: null;

// --- Composition de l'e-mail vers le studio -------------------------------
$body = "Nouvelle demande reçue depuis le site matiereetnuance.fr\n\n"
    . "Nom : {$nom}\n"
    . "Contact (tél. ou email) : {$contactVal}\n"
    . "Commune : " . ($commune !== '' ? $commune : 'non précisée') . "\n"
    . "Type de projet : " . ($projet !== '' ? $projet : 'non précisé') . "\n\n"
    . "Message :\n{$message}\n\n"
    . '--' . "\n"
    . 'Reçu le ' . date('d/m/Y à H:i') . " depuis l'adresse IP " . client_ip() . "\n";

$sent = send_mail_safe(
    $config['contact_recipient'],
    'Nouvelle demande de contact — ' . $nom,
    $body,
    $config['from_email'],
    $config['from_name'],
    $visitorEmail
);

if (!$sent) {
    error_log('[matiereetnuance] Échec envoi e-mail formulaire de contact');
    json_response([
        'success' => false,
        'message' => "L'envoi a échoué. Merci de réessayer ou de nous appeler au 07 60 03 38 20.",
    ], 502);
}

// --- E-mail de confirmation au visiteur (si une adresse email valide) ----
if ($visitorEmail !== null) {
    $confirmBody = "Bonjour {$nom},\n\n"
        . "Nous avons bien reçu votre demande concernant votre projet"
        . ($projet !== '' ? " de " . mb_strtolower($projet) : '')
        . ($commune !== '' ? " à {$commune}" : '') . ".\n\n"
        . "Nous revenons vers vous sous 48 h. La première visite est toujours sans engagement.\n\n"
        . "À bientôt,\n"
        . "L'équipe Matière & Nuance\n"
        . "07 60 03 38 20\n"
        . "matiereetnuance@hotmail.com\n";

    send_mail_safe(
        $visitorEmail,
        'Votre demande a bien été reçue — Matière & Nuance',
        $confirmBody,
        $config['from_email'],
        $config['site_name'],
        $config['contact_recipient']
    );
}

json_response(['success' => true]);
