<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$settings = load_content('settings', []);
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    $email = clean_text((string) ($_POST['contact_recipient'] ?? ''), 200);
    $instagram = clean_text((string) ($_POST['instagram_url'] ?? ''), 300);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "L'adresse e-mail de réception n'est pas valide.";
    }
    if ($instagram !== '' && !filter_var($instagram, FILTER_VALIDATE_URL)) {
        $errors[] = "Le lien Instagram n'est pas une URL valide.";
    }

    if (!$errors) {
        $settings['contact_recipient'] = $email;
        $settings['instagram_url'] = $instagram;
        save_content('settings', $settings);
        $_SESSION['flash'] = ['type' => 'ok', 'message' => 'Réglages enregistrés.'];
        header('Location: parametres.php');
        exit;
    }
}

$csrf = admin_csrf_token();
$pageTitle = 'Réglages';
$activeNav = 'parametres';
require __DIR__ . '/includes/header.php';
?>
<?php if ($errors): ?><div class="flash flash-error"><?= htmlspecialchars(implode(' ', $errors)) ?></div><?php endif; ?>

<form method="post">
  <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">

  <div class="card">
    <h2>Formulaire de contact</h2>
    <div class="field">
      <label for="contact_recipient">Adresse e-mail qui reçoit les demandes</label>
      <input type="email" id="contact_recipient" name="contact_recipient" value="<?= htmlspecialchars($settings['contact_recipient'] ?? '') ?>" required>
      <div class="help">Les coordonnées affichées publiquement (téléphone, e-mail visible) se règlent dans « Textes ».</div>
    </div>
  </div>

  <div class="card">
    <h2>Réseaux sociaux</h2>
    <div class="field">
      <label for="instagram_url">Lien Instagram</label>
      <input type="text" id="instagram_url" name="instagram_url" value="<?= htmlspecialchars($settings['instagram_url'] ?? '') ?>" placeholder="https://www.instagram.com/matiere_et_nuance">
    </div>
    <div class="help">Le design validé n'a une icône que pour Instagram, dans l'en-tête et le pied de page. Ajouter d'autres réseaux visibles nécessitera un court passage par le design avant de les intégrer ici.</div>
  </div>

  <div class="btn-row">
    <button type="submit" class="btn">Enregistrer</button>
    <a href="index.php" class="btn btn-ghost">Annuler</a>
  </div>
</form>
<?php require __DIR__ . '/includes/footer.php'; ?>
