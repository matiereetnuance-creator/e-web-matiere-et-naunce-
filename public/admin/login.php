<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';

admin_session_start();
$config = require __DIR__ . '/../api/config.php';

if (admin_is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    $username = clean_text((string) ($_POST['username'] ?? ''), 100);
    $password = (string) ($_POST['password'] ?? '');
    $result = admin_attempt_login($username, $password, $config);
    if ($result === true) {
        header('Location: index.php');
        exit;
    }
    $error = $result;
}
$csrf = admin_csrf_token();
?><!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Connexion — Administration Matière &amp; Nuance</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#20211f;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.box{background:#fff;border-radius:12px;padding:36px 34px;width:100%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.box h1{font-size:17px;margin:0 0 4px;color:#20211f}
.box .sub{font-size:12.5px;color:#8a7a63;margin:0 0 22px}
label{display:block;font-size:12.5px;font-weight:600;color:#5b5a56;margin-bottom:5px}
input{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #d9d5cc;border-radius:7px;font-size:14px;margin-bottom:16px}
input:focus{outline:2px solid #8a7a63;border-color:#8a7a63}
button{width:100%;padding:11px;border:none;border-radius:8px;background:#8a7a63;color:#fff;font-size:14px;font-weight:600;cursor:pointer}
button:hover{background:#5f5342}
.error{background:#faeae8;color:#b3413a;border:1px solid #e3b7b2;border-radius:7px;padding:10px 12px;font-size:13px;margin-bottom:16px}
</style>
</head>
<body>
<form class="box" method="post" novalidate>
  <h1>Administration</h1>
  <p class="sub">Matière &amp; Nuance</p>
  <?php if ($error): ?><div class="error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
  <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
  <label for="username">Identifiant</label>
  <input type="text" id="username" name="username" autocomplete="username" required autofocus>
  <label for="password">Mot de passe</label>
  <input type="password" id="password" name="password" autocomplete="current-password" required>
  <button type="submit">Se connecter</button>
</form>
</body>
</html>
