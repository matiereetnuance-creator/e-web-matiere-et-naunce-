<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$config = require __DIR__ . '/../api/config.php';
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    $current = (string) ($_POST['current_password'] ?? '');
    $new = (string) ($_POST['new_password'] ?? '');
    $confirm = (string) ($_POST['confirm_password'] ?? '');

    $creds = admin_effective_credentials($config);
    if (!password_verify($current, $creds['admin_password_hash'])) {
        $errors[] = 'Mot de passe actuel incorrect.';
    }
    if (mb_strlen($new) < 10) {
        $errors[] = 'Le nouveau mot de passe doit contenir au moins 10 caractères.';
    }
    if ($new !== $confirm) {
        $errors[] = 'La confirmation ne correspond pas au nouveau mot de passe.';
    }

    if (!$errors) {
        $secrets = load_content('admin-secrets', []);
        $secrets['admin_username'] = $creds['admin_username'];
        $secrets['admin_password_hash'] = password_hash($new, PASSWORD_DEFAULT);
        save_content('admin-secrets', $secrets);
        $_SESSION['flash'] = ['type' => 'ok', 'message' => 'Mot de passe modifié.'];
        header('Location: password.php');
        exit;
    }
}

$csrf = admin_csrf_token();
$pageTitle = 'Mot de passe';
$activeNav = 'password';
require __DIR__ . '/includes/header.php';
?>
<?php if ($errors): ?><div class="flash flash-error"><?= htmlspecialchars(implode(' ', $errors)) ?></div><?php endif; ?>

<div class="card" style="max-width:420px">
  <h2>Changer le mot de passe</h2>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
    <div class="field">
      <label for="current_password">Mot de passe actuel</label>
      <input type="password" id="current_password" name="current_password" autocomplete="current-password" required>
    </div>
    <div class="field">
      <label for="new_password">Nouveau mot de passe</label>
      <input type="password" id="new_password" name="new_password" autocomplete="new-password" minlength="10" required>
      <div class="help">10 caractères minimum.</div>
    </div>
    <div class="field">
      <label for="confirm_password">Confirmer le nouveau mot de passe</label>
      <input type="password" id="confirm_password" name="confirm_password" autocomplete="new-password" minlength="10" required>
    </div>
    <div class="btn-row">
      <button type="submit" class="btn">Enregistrer</button>
    </div>
  </form>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
