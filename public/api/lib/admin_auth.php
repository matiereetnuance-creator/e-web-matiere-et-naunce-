<?php
/**
 * Authentification de l'espace d'administration (/admin).
 * Session PHP classique + hash de mot de passe + jeton CSRF + limitation
 * des tentatives de connexion. Pas de dépendance externe.
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

function admin_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/admin',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_name('mn_admin_session');
    session_start();
}

function admin_is_logged_in(): bool
{
    admin_session_start();
    return !empty($_SESSION['admin_user']);
}

function admin_require_login(): void
{
    if (!admin_is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function admin_csrf_token(): string
{
    admin_session_start();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function admin_csrf_check(): void
{
    $token = $_POST['csrf'] ?? '';
    if (!is_string($token) || !hash_equals(admin_csrf_token(), $token)) {
        http_response_code(403);
        die('Jeton de sécurité invalide. Merci de recharger la page et réessayer.');
    }
}

/**
 * Identifiant/hash effectifs : ceux définis depuis l'admin (Mot de passe)
 * prennent le pas sur les valeurs par défaut de config.php.
 */
function admin_effective_credentials(array $config): array
{
    require_once __DIR__ . '/content.php';
    $override = load_content('admin-secrets', []);
    return [
        'admin_username' => $override['admin_username'] ?? $config['admin_username'],
        'admin_password_hash' => $override['admin_password_hash'] ?? $config['admin_password_hash'],
    ];
}

/** @return true|string true si connecté, sinon un message d'erreur */
function admin_attempt_login(string $username, string $password, array $config)
{
    try {
        enforce_rate_limit(__DIR__ . '/../data/admin-login-attempts.json', client_ip(), $config['admin_rate_limit']);
    } catch (RuntimeException $e) {
        return 'Trop de tentatives. Merci de réessayer dans quelques minutes.';
    }

    $creds = admin_effective_credentials($config);
    $validUser = hash_equals($creds['admin_username'], $username);
    $validPass = password_verify($password, $creds['admin_password_hash']);

    if (!$validUser || !$validPass) {
        return 'Identifiant ou mot de passe incorrect.';
    }

    admin_session_start();
    session_regenerate_id(true);
    $_SESSION['admin_user'] = $username;
    return true;
}

function admin_logout(): void
{
    admin_session_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}
