<?php
/**
 * Fonctions utilitaires partagées par les points d'API du site.
 */

declare(strict_types=1);

/** Répond en JSON et termine le script. */
function json_response(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Adresse IP du visiteur (best-effort, gère les proxys o2switch). */
function client_ip(): string
{
    $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($keys as $key) {
        if (!empty($_SERVER[$key])) {
            $parts = explode(',', $_SERVER[$key]);
            $ip = trim($parts[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}

/**
 * Limiteur de fréquence simple basé sur un fichier JSON verrouillé.
 * Évite les envois massifs (spam / abus) sans dépendance externe.
 *
 * @throws RuntimeException si la limite est dépassée
 */
function enforce_rate_limit(string $storageFile, string $ip, array $limits): void
{
    $dir = dirname($storageFile);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $fp = fopen($storageFile, 'c+');
    if (!$fp) {
        // Si le stockage est indisponible, on n'empêche pas l'envoi
        // (mieux vaut un site fonctionnel qu'un formulaire cassé).
        return;
    }

    flock($fp, LOCK_EX);
    $raw = stream_get_contents($fp);
    $data = $raw ? json_decode($raw, true) : [];
    if (!is_array($data)) {
        $data = [];
    }

    $now = time();
    $key = hash('sha256', $ip);
    $entries = $data[$key] ?? [];

    // Purge des entrées de plus de 24h
    $entries = array_values(array_filter($entries, static fn ($t) => $now - $t < 86400));

    $last10min = count(array_filter($entries, static fn ($t) => $now - $t < 600));
    $lastDay = count($entries);

    if ($last10min >= $limits['max_per_10_minutes'] || $lastDay >= $limits['max_per_day']) {
        flock($fp, LOCK_UN);
        fclose($fp);
        throw new RuntimeException('rate_limited');
    }

    $entries[] = $now;
    $data[$key] = $entries;

    // Purge globale des IP inactives depuis + de 2 jours pour éviter
    // que le fichier ne grossisse indéfiniment.
    foreach ($data as $k => $times) {
        $times = array_values(array_filter((array) $times, static fn ($t) => $now - $t < 172800));
        if (empty($times)) {
            unset($data[$k]);
        } else {
            $data[$k] = $times;
        }
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

/**
 * Envoi d'e-mail sécurisé : les valeurs fournies par l'utilisateur ne
 * sont jamais placées dans les en-têtes, uniquement dans le corps.
 */
function send_mail_safe(string $to, string $subject, string $body, string $fromEmail, string $fromName, ?string $replyTo = null): bool
{
    $subject = mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");

    $headers = [];
    $headers[] = 'From: ' . mb_encode_mimeheader($fromName, 'UTF-8', 'B', "\r\n") . ' <' . $fromEmail . '>';
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $headers[] = 'Content-Transfer-Encoding: 8bit';
    $headers[] = 'X-Mailer: MatiereEtNuance-Site/1.0';

    if ($replyTo !== null && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    return @mail($to, $subject, $body, implode("\r\n", $headers));
}

/** Nettoie une chaîne saisie par l'utilisateur pour un usage texte simple. */
function clean_text(string $value, int $maxLength = 2000): string
{
    $value = trim($value);
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $value) ?? '';
    return mb_substr($value, 0, $maxLength);
}
