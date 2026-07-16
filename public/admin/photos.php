<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$slots = [
    'Accueil' => [
        'hero-main' => 'Photo principale du hero',
        'hero-detail' => 'Détail matière (hero)',
        'sf-platrerie' => 'Carte « Plâtrerie »',
        'sf-peinture' => 'Carte « Peinture »',
        'sf-beton' => 'Carte « Béton ciré »',
        'entreprise-portrait' => 'Portrait (section entreprise)',
        'zone-carte' => 'Carte de zone d\'intervention',
    ],
    'Savoir-faire' => [
        'sf-page-platrerie' => 'Plâtrerie — photo pleine page',
        'sf-page-peinture' => 'Peinture — photo pleine page',
        'sf-page-beton' => 'Béton ciré — photo pleine page',
    ],
    'L\'entreprise' => [
        'ent-portrait' => 'Portrait du fondateur',
        'ent-garanties' => 'Détail — outils, nuancier',
    ],
    'Réalisations — comparateur avant/après' => [
        'ba-avant' => 'Photo « avant »',
        'ba-apres' => 'Photo « après »',
    ],
    'Contact' => [
        'contact-carte' => 'Carte de zone d\'intervention',
    ],
];
$allSlots = array_merge(...array_values($slots));

admin_session_start();
$_SESSION['pending_raw'] ??= [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    $action = (string) ($_POST['action'] ?? 'upload');
    $slot = clean_text((string) ($_POST['slot'] ?? ''), 60);

    if ($action === 'confirm_raw' && isset($allSlots[$slot]) && !empty($_SESSION['pending_raw'][$slot]['token'])) {
        $result = confirm_raw_conversion($_SESSION['pending_raw'][$slot]['token']);
        unset($_SESSION['pending_raw'][$slot]);
        $_SESSION['flash'] = $result['ok']
            ? ['type' => 'ok', 'message' => 'Photo convertie et mise à jour : ' . $allSlots[$slot] . '.']
            : ['type' => 'error', 'message' => upload_error_with_details($result)];
    } elseif ($action === 'cancel_raw' && isset($allSlots[$slot])) {
        if (!empty($_SESSION['pending_raw'][$slot]['token'])) {
            discard_staged_raw($_SESSION['pending_raw'][$slot]['token']);
        }
        unset($_SESSION['pending_raw'][$slot]);
    } elseif (isset($allSlots[$slot]) && !empty($_FILES['photo']['name'])) {
        $result = optimize_and_store_upload($_FILES['photo'], MN_UPLOADS_DIR, $slot);
        if (($result['error'] ?? null) === 'raw_convertible') {
            $_SESSION['pending_raw'][$slot] = [
                'token' => $result['stage_token'],
                'name' => $_FILES['photo']['name'],
                'size' => $_FILES['photo']['size'],
            ];
        } else {
            $_SESSION['flash'] = $result['ok']
                ? ['type' => 'ok', 'message' => 'Photo mise à jour : ' . $allSlots[$slot] . '.']
                : ['type' => 'error', 'message' => upload_error_with_details($result)];
        }
    }
    header('Location: photos.php');
    exit;
}

// Nettoie les propositions de conversion expirées (délai de confirmation dépassé)
foreach ($_SESSION['pending_raw'] as $slot => $pending) {
    if (get_staged_raw($pending['token'] ?? '') === null) {
        unset($_SESSION['pending_raw'][$slot]);
    }
}

$csrf = admin_csrf_token();
$pageTitle = 'Photos du site';
$activeNav = 'photos';
require __DIR__ . '/includes/header.php';
?>
<script src="assets/vendor/heic2any.min.js" defer></script>
<script src="assets/heic-convert.js" defer></script>
<script src="assets/dropzone.js" defer></script>

<?php foreach ($slots as $group => $items): ?>
<div class="card">
  <h2><?= htmlspecialchars($group) ?></h2>
  <?php foreach ($items as $slot => $label): ?>
    <?php $pending = $_SESSION['pending_raw'][$slot] ?? null; ?>
    <div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--line)">
      <img class="thumb" style="width:96px;height:66px" src="../<?= htmlspecialchars(photo_src($slot)) ?>" alt="">
      <div style="flex:1"><?= htmlspecialchars($label) ?></div>
      <?php if ($pending): ?>
        <div style="flex:0 0 420px;background:var(--warn-soft);border:1px solid #ecd5a3;border-radius:8px;padding:10px 14px">
          <div style="font-size:12.5px;color:var(--warn);margin-bottom:8px"><?= htmlspecialchars(raw_convert_prompt($pending)) ?></div>
          <div style="display:flex;gap:8px">
            <form method="post" style="display:inline">
              <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
              <input type="hidden" name="slot" value="<?= htmlspecialchars($slot) ?>">
              <input type="hidden" name="action" value="confirm_raw">
              <button type="submit" class="btn" style="padding:6px 12px;font-size:12.5px">Convertir en JPEG</button>
            </form>
            <form method="post" style="display:inline">
              <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
              <input type="hidden" name="slot" value="<?= htmlspecialchars($slot) ?>">
              <input type="hidden" name="action" value="cancel_raw">
              <button type="submit" class="btn btn-ghost" style="padding:6px 12px;font-size:12.5px">Annuler</button>
            </form>
          </div>
        </div>
      <?php else: ?>
        <form method="post" enctype="multipart/form-data" style="display:flex;align-items:center;gap:8px">
          <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
          <input type="hidden" name="slot" value="<?= htmlspecialchars($slot) ?>">
          <input type="file" name="photo" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,.dng" required style="font-size:12px;max-width:190px">
          <button type="submit" class="btn btn-ghost" style="padding:8px 14px">Remplacer</button>
        </form>
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
</div>
<?php endforeach; ?>
<?php require __DIR__ . '/includes/footer.php'; ?>
