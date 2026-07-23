<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$settings = load_content('settings', []);
$config = require __DIR__ . '/../api/config.php';
$googleConfigured = !empty($config['google_places_api_key']) && !empty($config['google_place_id']);

$avisList = fallback_avis();
$avisErrors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();
    $action = (string) ($_POST['action'] ?? '');

    if ($action === 'toggle_section') {
        $settings['avis_section_enabled'] = !empty($_POST['avis_enabled']);
        save_content('settings', $settings);
        $_SESSION['flash'] = ['type' => 'ok', 'message' => 'Réglage mis à jour.'];
        header('Location: avis.php');
        exit;
    }

    if ($action === 'delete_avis') {
        $id = clean_text((string) ($_POST['id'] ?? ''), 80);
        $before = count($avisList);
        $avisList = array_values(array_filter($avisList, static fn ($a) => ($a['id'] ?? '') !== $id));
        if (count($avisList) < $before) {
            save_content('avis', $avisList);
            $_SESSION['flash'] = ['type' => 'ok', 'message' => 'Avis de secours supprimé.'];
        }
        header('Location: avis.php');
        exit;
    }

    if ($action === 'save_avis') {
        $id = clean_text((string) ($_POST['id'] ?? ''), 80);
        $entry = [
            'id' => $id !== '' ? $id : 'avis-' . bin2hex(random_bytes(4)),
            'author_name' => clean_text((string) ($_POST['author_name'] ?? ''), 80),
            'commune' => clean_text((string) ($_POST['commune'] ?? ''), 80),
            'rating' => max(1, min(5, (int) ($_POST['rating'] ?? 5))),
            'text' => clean_text((string) ($_POST['text'] ?? ''), 500),
            'relative_time' => clean_text((string) ($_POST['relative_time'] ?? ''), 40),
        ];

        if ($entry['author_name'] === '') {
            $avisErrors[] = 'Le nom est obligatoire.';
        }
        if ($entry['text'] === '') {
            $avisErrors[] = 'Le texte de l\'avis est obligatoire.';
        }

        if (!$avisErrors) {
            $found = false;
            foreach ($avisList as $k => $a) {
                if (($a['id'] ?? '') === $entry['id']) {
                    $avisList[$k] = $entry;
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $avisList[] = $entry;
            }
            save_content('avis', $avisList);
            $_SESSION['flash'] = ['type' => 'ok', 'message' => $found ? 'Avis de secours mis à jour.' : 'Avis de secours ajouté.'];
            header('Location: avis.php');
            exit;
        }
    }
}

// Pré-remplissage du formulaire : édition d'un avis existant (lien "Modifier"),
// ou valeurs postées si l'enregistrement a échoué (erreurs ci-dessus).
$editId = clean_text((string) ($_GET['edit_avis'] ?? ''), 80);
$formValues = ['id' => '', 'author_name' => '', 'commune' => '', 'rating' => 5, 'text' => '', 'relative_time' => ''];
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save_avis') {
    $formValues = array_merge($formValues, [
        'id' => clean_text((string) ($_POST['id'] ?? ''), 80),
        'author_name' => clean_text((string) ($_POST['author_name'] ?? ''), 80),
        'commune' => clean_text((string) ($_POST['commune'] ?? ''), 80),
        'rating' => max(1, min(5, (int) ($_POST['rating'] ?? 5))),
        'text' => clean_text((string) ($_POST['text'] ?? ''), 500),
        'relative_time' => clean_text((string) ($_POST['relative_time'] ?? ''), 40),
    ]);
} elseif ($editId !== '') {
    foreach ($avisList as $a) {
        if (($a['id'] ?? '') === $editId) {
            $formValues = $a;
            break;
        }
    }
}

$csrf = admin_csrf_token();
$pageTitle = 'Avis Google';
$activeNav = 'avis';
require __DIR__ . '/includes/header.php';
?>
<div class="card">
  <h2>Synchronisation Google</h2>
  <p style="color:var(--ink-soft);margin-top:0">
    Les avis affichés sur le site proviennent automatiquement de votre fiche Google Business Profile
    (API officielle Google Places) — ils ne se modifient pas ici, exactement comme sur votre fiche Google.
  </p>
  <table>
    <tr><td>État</td><td><strong><?= $googleConfigured ? '✅ Synchronisation active' : '⏳ Non configurée pour l\'instant' ?></strong></td></tr>
  </table>
  <?php if (!$googleConfigured): ?>
    <div class="help" style="margin-top:10px">
      Tant que la clé API Google n'est pas renseignée (voir <code>docs/DEPLOIEMENT.md</code>, section 5),
      le site affiche les avis de secours ci-dessous.
    </div>
  <?php endif; ?>
</div>

<div class="card">
  <h2>Affichage de la section</h2>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
    <input type="hidden" name="action" value="toggle_section">
    <div class="toggle-row">
      <div>
        <div style="font-weight:600">Afficher la section « Avis » sur le site</div>
        <div class="help">Masque à la fois la page /avis et le bloc d'avis sur l'accueil, si besoin.</div>
      </div>
      <label class="switch">
        <input type="checkbox" name="avis_enabled" <?= !empty($settings['avis_section_enabled']) ? 'checked' : '' ?> onchange="this.form.submit()">
        <span class="slider"></span>
      </label>
    </div>
  </form>
</div>

<div class="card">
  <h2>Avis de secours <span class="muted">(<?= count($avisList) ?>)</span></h2>
  <p style="color:var(--ink-soft);margin-top:0">
    Affichés à la place des avis Google tant que la synchronisation n'est pas active — les 3 premiers
    apparaissent aussi sur l'accueil. Sans lien avec votre fiche Google : ce sont vos propres textes.
  </p>
  <?php if ($avisErrors): ?>
    <div class="flash flash-error"><?= htmlspecialchars(implode(' ', $avisErrors)) ?></div>
  <?php endif; ?>
  <?php if (!$avisList): ?>
    <p class="empty">Aucun avis de secours pour l'instant.</p>
  <?php else: ?>
  <table>
    <tr><th>Auteur</th><th>Commune</th><th>Note</th><th>Avis</th><th>Date affichée</th><th></th></tr>
    <?php foreach ($avisList as $a): ?>
    <tr>
      <td><?= htmlspecialchars($a['author_name'] ?? '') ?></td>
      <td><?= htmlspecialchars($a['commune'] ?? '') ?></td>
      <td><?= str_repeat('★', max(1, min(5, (int) ($a['rating'] ?? 5)))) ?></td>
      <td style="max-width:320px"><?= htmlspecialchars(mb_strimwidth((string) ($a['text'] ?? ''), 0, 90, '…')) ?></td>
      <td><?= htmlspecialchars($a['relative_time'] ?? '') ?></td>
      <td style="white-space:nowrap">
        <a class="btn btn-ghost" style="padding:6px 12px" href="avis.php?edit_avis=<?= rawurlencode($a['id']) ?>#avis-form">Modifier</a>
        <form method="post" style="display:inline" onsubmit="return confirm('Supprimer définitivement cet avis de secours ?');">
          <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
          <input type="hidden" name="action" value="delete_avis">
          <input type="hidden" name="id" value="<?= htmlspecialchars($a['id']) ?>">
          <button type="submit" class="btn btn-danger" style="padding:6px 12px">Supprimer</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
  </table>
  <?php endif; ?>

  <h2 id="avis-form" style="margin-top:28px"><?= $formValues['id'] !== '' ? 'Modifier cet avis' : 'Ajouter un avis de secours' ?></h2>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
    <input type="hidden" name="action" value="save_avis">
    <input type="hidden" name="id" value="<?= htmlspecialchars($formValues['id']) ?>">
    <div class="field-row">
      <div class="field">
        <label for="avis_author_name">Nom *</label>
        <input type="text" id="avis_author_name" name="author_name" value="<?= htmlspecialchars($formValues['author_name']) ?>" required placeholder="Claire M.">
      </div>
      <div class="field">
        <label for="avis_commune">Commune</label>
        <input type="text" id="avis_commune" name="commune" value="<?= htmlspecialchars($formValues['commune']) ?>" placeholder="Écully">
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="avis_rating">Note</label>
        <select id="avis_rating" name="rating">
          <?php for ($n = 5; $n >= 1; $n--): ?>
            <option value="<?= $n ?>" <?= $formValues['rating'] === $n ? 'selected' : '' ?>><?= str_repeat('★', $n) ?> (<?= $n ?>/5)</option>
          <?php endfor; ?>
        </select>
      </div>
      <div class="field">
        <label for="avis_relative_time">Date affichée</label>
        <input type="text" id="avis_relative_time" name="relative_time" value="<?= htmlspecialchars($formValues['relative_time']) ?>" placeholder="il y a 2 mois">
      </div>
    </div>
    <div class="field">
      <label for="avis_text">Texte de l'avis *</label>
      <textarea id="avis_text" name="text" rows="3" required placeholder="Un chantier d'une propreté irréprochable…"><?= htmlspecialchars($formValues['text']) ?></textarea>
    </div>
    <div class="btn-row">
      <button type="submit" class="btn"><?= $formValues['id'] !== '' ? 'Enregistrer les modifications' : 'Ajouter cet avis' ?></button>
      <?php if ($formValues['id'] !== ''): ?><a href="avis.php" class="btn btn-ghost">Annuler</a><?php endif; ?>
    </div>
  </form>
</div>
<?php require __DIR__ . '/includes/footer.php'; ?>
