<?php
declare(strict_types=1);
/**
 * Client SMTP minimal (sans dépendance externe) pour l'envoi authentifié
 * des e-mails du site via un compte de messagerie o2switch.
 *
 * Pourquoi ne pas se contenter de mail() ? PHP mail() confie le message
 * au binaire sendmail local sans authentification et, sans le paramètre
 * -f, avec une adresse d'enveloppe (Return-Path) qui ne correspond pas
 * forcément au domaine affiché dans l'en-tête From. Or SPF s'évalue sur
 * l'adresse d'enveloppe, et DMARC exige l'alignement entre cette adresse
 * et le domaine du From : un décalage explique très souvent qu'un message
 * pourtant "envoyé avec succès" atterrisse dans les courriers indésirables
 * chez Outlook/Hotmail. En s'authentifiant sur le compte SMTP du domaine,
 * l'adresse d'enveloppe est garantie alignée, et le serveur o2switch
 * signe le message en DKIM de façon fiable.
 */

final class SmtpException extends RuntimeException
{
}

/**
 * @param array{host:string,port:int,secure:string,username:string,password:string,ehlo_domain?:string} $smtp
 */
function smtp_send_mail(
    array $smtp,
    string $to,
    string $subject,
    string $body,
    string $fromEmail,
    string $fromName,
    ?string $replyTo = null
): bool {
    $host = $smtp['host'] ?? '';
    $port = (int) ($smtp['port'] ?? 465);
    $secure = $smtp['secure'] ?? 'ssl';
    $username = $smtp['username'] ?? '';
    $password = $smtp['password'] ?? '';
    $ehloDomain = $smtp['ehlo_domain'] ?? 'localhost';

    if ($host === '' || $username === '' || $password === '') {
        return false;
    }

    $transport = $secure === 'ssl' ? 'ssl://' : 'tcp://';
    $errno = 0;
    $errstr = '';
    $stream = @stream_socket_client($transport . $host . ':' . $port, $errno, $errstr, 10);
    if ($stream === false) {
        error_log("[smtp] Connexion à {$host}:{$port} échouée : {$errstr} ({$errno})");
        return false;
    }
    stream_set_timeout($stream, 10);

    try {
        smtp_read($stream, [220]);
        smtp_cmd($stream, 'EHLO ' . $ehloDomain, [250]);

        if ($secure === 'tls') {
            smtp_cmd($stream, 'STARTTLS', [220]);
            if (!@stream_socket_enable_crypto($stream, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new SmtpException('Échec de la négociation TLS (STARTTLS).');
            }
            smtp_cmd($stream, 'EHLO ' . $ehloDomain, [250]);
        }

        smtp_cmd($stream, 'AUTH LOGIN', [334]);
        smtp_cmd($stream, base64_encode($username), [334]);
        smtp_cmd($stream, base64_encode($password), [235]);

        // L'adresse d'enveloppe (MAIL FROM) doit correspondre au compte
        // authentifié : la plupart des serveurs SMTP o2switch la forcent
        // de toute façon, et c'est elle qui garantit l'alignement SPF.
        smtp_cmd($stream, 'MAIL FROM:<' . $username . '>', [250]);
        smtp_cmd($stream, 'RCPT TO:<' . $to . '>', [250, 251]);
        smtp_cmd($stream, 'DATA', [354]);

        $domain = smtp_domain_of($fromEmail);
        $headers = [];
        $headers[] = 'Date: ' . date('r');
        $headers[] = 'Message-ID: <' . bin2hex(random_bytes(16)) . '@' . $domain . '>';
        $headers[] = 'From: ' . mb_encode_mimeheader($fromName, 'UTF-8', 'B', "\r\n") . ' <' . $fromEmail . '>';
        $headers[] = 'To: <' . $to . '>';
        $headers[] = 'Subject: ' . mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: 8bit';
        $headers[] = 'X-Mailer: MatiereEtNuance-Site/1.0';
        if ($replyTo !== null && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
            $headers[] = 'Reply-To: <' . $replyTo . '>';
        }

        $payload = implode("\r\n", $headers) . "\r\n\r\n" . smtp_dot_stuff($body) . "\r\n.";
        fwrite($stream, $payload . "\r\n");
        smtp_read($stream, [250]);

        fwrite($stream, "QUIT\r\n");
        fclose($stream);
        return true;
    } catch (Throwable $e) {
        error_log('[smtp] ' . $e->getMessage());
        if (is_resource($stream)) {
            fclose($stream);
        }
        return false;
    }
}

/** @param int[] $expectedCodes */
function smtp_cmd($stream, string $command, array $expectedCodes): string
{
    fwrite($stream, $command . "\r\n");
    return smtp_read($stream, $expectedCodes);
}

/** @param int[] $expectedCodes */
function smtp_read($stream, array $expectedCodes): string
{
    $response = '';
    do {
        $line = fgets($stream, 515);
        if ($line === false) {
            throw new SmtpException('Connexion SMTP interrompue.');
        }
        $response .= $line;
    } while (isset($line[3]) && $line[3] === '-');

    $code = (int) substr($response, 0, 3);
    if (!in_array($code, $expectedCodes, true)) {
        throw new SmtpException('Réponse SMTP inattendue : ' . trim($response));
    }
    return $response;
}

/** Préfixe d'un "." doublé toute ligne qui commencerait par un point (RFC 5321). */
function smtp_dot_stuff(string $body): string
{
    $normalized = str_replace(["\r\n", "\r"], "\n", $body);
    $lines = explode("\n", $normalized);
    foreach ($lines as &$line) {
        if (isset($line[0]) && $line[0] === '.') {
            $line = '.' . $line;
        }
    }
    return implode("\r\n", $lines);
}

function smtp_domain_of(string $email): string
{
    $at = strrchr($email, '@');
    return $at !== false ? substr($at, 1) : 'localhost';
}
