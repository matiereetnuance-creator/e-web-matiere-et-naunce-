<?php
declare(strict_types=1);
require __DIR__ . '/../api/lib/helpers.php';
require __DIR__ . '/../api/lib/admin_auth.php';
require __DIR__ . '/../api/lib/content.php';
admin_require_login();

$realisations = load_content('realisations', []);
$editId = clean_text((string) ($_GET['id'] ?? ($_POST['current_id'] ?? '')), 80);
$existing = null;
$existingIndex = null;
foreach ($realisations as $k => $r) {
    if (($r['id'] ?? '') === $editId) {
        $existing = $r;
        $existingIndex = $k;
        break;
    }
}
$isNew = $existing === null;

$errors = [];
$values = $existing ?? [
    'id' => '', 'title' => '', 'ville' => '', 'description' => '', 'prestations' => '',
    'tags' => '', 'date' => '', 'fallback_slot' => '', 'image_main' => '', 'gallery' => [],
    'avant' => '', 'apres' => '', 'meta_title' => '', 'meta_description' => '',
    'image_main_alt' => '', 'avant_alt' => '', 'apres_alt' => '',
];
// Compat : anciennes galeries stockées comme simples noms de fichiers
foreach ($values['gallery'] as $gi => $g) {
    if (is_string($g)) {
        $values['gallery'][$gi] = ['file' => $g, 'alt' => ''];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    admin_csrf_check();

    $values['title'] = clean_text((string) ($_POST['title'] ?? ''), 140);
    $values['ville'] = clean_text((string) ($_POST['ville'] ?? ''), 120);
    $values['description'] = clean_text((string) ($_POST['description'] ?? ''), 3000);
    $values['prestations'] = clean_text((string) ($_POST['prestations'] ?? ''), 160);
    $values['tags'] = clean_text((string) ($_POST['tags'] ?? ''), 160);
    $values['date'] = clean_text((string) ($_POST['date'] ?? ''), 20);
    $values['meta_title'] = clean_text((string) ($_POST['meta_title'] ?? ''), 160);
    $values['meta_description'] = clean_text((string) ($_POST['meta_description'] ?? ''), 300);
    $values['image_main_alt'] = clean_text((string) ($_POST['image_main_alt'] ?? ''), 200);
    $values['avant_alt'] = clean_text((string) ($_POST['avant_alt'] ?? ''), 200);
    $values['apres_alt'] = clean_text((string) ($_POST['apres_alt'] ?? ''), 200);

    if ($values['title'] === '') {
        $errors[] = 'Le titre est obligatoire.';
    }
    if ($values['ville'] === '') {
        $errors[] = 'La ville est obligatoire.';
    }

    // Slug / URL : personnalisable, unique
    $requestedSlug = clean_text((string) ($_POST['slug'] ?? ''), 100);
    $existingIds = array_values(array_filter(array_column($realisations, 'id'), static fn ($id) => $id !== $editId));
    $desiredSlug = $requestedSlug !== '' ? $requestedSlug : $values['title'];
    $finalSlug = unique_slug($desiredSlug, $existingIds);

    if (!$errors) {
        $oldId = $values['id'];
        $values['id'] = $finalSlug;
        if ($isNew) {
            $values['fallback_slot'] = '';
        }

        // Si le slug change sur une réalisation existante, on renomme son dossier photos
        if (!$isNew && $oldId !== '' && $oldId !== $finalSlug) {
            $oldDir = realisation_photo_dir($oldId);
            $newDir = realisation_photo_dir($finalSlug);
            if (is_dir($oldDir) && !is_dir($newDir)) {
                rename($oldDir, $newDir);
            }
        }

        $dir = realisation_photo_dir($values['id']);

        if (!empty($_FILES['image_main']['name'])) {
            $result = optimize_and_store_upload($_FILES['image_main'], $dir, 'principale-' . time());
            if ($result['ok']) {
                $values['image_main'] = $result['filename'];
                if ($values['image_main_alt'] === '') {
                    $values['image_main_alt'] = suggest_alt($values['title'], $values['ville']);
                }
            } else {
                $errors[] = "Image principale : " . upload_error_message($result['error']);
            }
        }
        if (!empty($_FILES['avant']['name'])) {
            $result = optimize_and_store_upload($_FILES['avant'], $dir, 'avant-' . time());
            if ($result['ok']) {
                $values['avant'] = $result['filename'];
                if ($values['avant_alt'] === '') {
                    $values['avant_alt'] = suggest_alt($values['title'], $values['ville'], 'avant travaux');
                }
            } else {
                $errors[] = "Photo « avant » : " . upload_error_message($result['error']);
            }
        }
        if (!empty($_FILES['apres']['name'])) {
            $result = optimize_and_store_upload($_FILES['apres'], $dir, 'apres-' . time());
            if ($result['ok']) {
                $values['apres'] = $result['filename'];
                if ($values['apres_alt'] === '') {
                    $values['apres_alt'] = suggest_alt($values['title'], $values['ville'], 'après travaux');
                }
            } else {
                $errors[] = "Photo « après » : " . upload_error_message($result['error']);
            }
        }

        // Galerie : mise à jour des textes ALT existants
        $galleryAlts = $_POST['gallery_alt'] ?? [];
        foreach ($values['gallery'] as $gi => $g) {
            if (isset($galleryAlts[$g['file']])) {
                $values['gallery'][$gi]['alt'] = clean_text((string) $galleryAlts[$g['file']], 200);
            }
        }
        // Galerie : suppression des photos cochées
        $toRemove = $_POST['remove_gallery'] ?? [];
        if (is_array($toRemove) && $toRemove) {
            $values['gallery'] = array_values(array_filter($values['gallery'], static fn ($g) => !in_array($g['file'], $toRemove, true)));
        }
        // Galerie : nouveaux envois (plusieurs fichiers à la fois, ex. 10 photos
        // sélectionnées d'un coup sur iPhone). Une photo en échec (HEIC non
        // convertible, format inconnu…) n'empêche pas l'enregistrement des
        // autres : elle est simplement listée en avertissement, à renvoyer.
        $galleryWarnings = [];
        if (!empty($_FILES['gallery']['name'][0])) {
            $count = count($_FILES['gallery']['name']);
            for ($i = 0; $i < $count; $i++) {
                $originalName = $_FILES['gallery']['name'][$i] ?? ('fichier ' . ($i + 1));
                if (($_FILES['gallery']['error'][$i] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
                    continue;
                }
                $single = [
                    'name' => $_FILES['gallery']['name'][$i],
                    'type' => $_FILES['gallery']['type'][$i],
                    'tmp_name' => $_FILES['gallery']['tmp_name'][$i],
                    'error' => $_FILES['gallery']['error'][$i],
                    'size' => $_FILES['gallery']['size'][$i],
                ];
                $result = optimize_and_store_upload($single, $dir, 'galerie-' . time() . '-' . $i);
                if ($result['ok']) {
                    $n = count($values['gallery']) + 1;
                    $values['gallery'][] = ['file' => $result['filename'], 'alt' => suggest_alt($values['title'], $values['ville'], 'photo ' . $n)];
                } else {
                    $galleryWarnings[] = $originalName . ' : ' . upload_error_message($result['error']);
                }
            }
        }
        $values['gallery'] = array_values($values['gallery']);

        if (!$errors) {
            if ($isNew) {
                $realisations[] = $values;
            } else {
                $realisations[$existingIndex] = $values;
            }
            save_content('realisations', $realisations);
            $message = $isNew
                ? 'Réalisation publiée — sa page est en ligne immédiatement sur /realisations/' . $values['id']
                : 'Réalisation mise à jour.';
            if ($galleryWarnings) {
                $message .= ' — ' . count($galleryWarnings) . ' photo(s) de la galerie non ajoutée(s) : ' . implode(' / ', $galleryWarnings);
            }
            $_SESSION['flash'] = ['type' => $galleryWarnings ? 'warn' : 'ok', 'message' => $message];
            header('Location: realisations.php');
            exit;
        }
    }
}

$csrf = admin_csrf_token();
$pageTitle = $isNew ? 'Ajouter une réalisation' : 'Modifier — ' . $values['title'];
$activeNav = 'realisations';
require __DIR__ . '/includes/header.php';
$suggestedSlug = $values['id'] !== '' ? $values['id'] : '(généré automatiquement à partir du titre)';
$suggestedMetaTitle = realisation_meta_title($values);
$suggestedMetaDesc = realisation_meta_description($values);
?>
<script src="assets/dropzone.js" defer></script>

<?php if ($errors): ?>
  <div class="flash flash-error"><?= htmlspecialchars(implode(' ', $errors)) ?></div>
<?php endif; ?>

<form method="post" enctype="multipart/form-data">
  <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf) ?>">
  <input type="hidden" name="current_id" value="<?= htmlspecialchars($editId) ?>">

  <div class="card">
    <h2>Informations</h2>
    <div class="field-row">
      <div class="field">
        <label for="title">Titre *</label>
        <input type="text" id="title" name="title" value="<?= htmlspecialchars($values['title']) ?>" required placeholder="Maison familiale">
      </div>
      <div class="field">
        <label for="ville">Ville *</label>
        <input type="text" id="ville" name="ville" value="<?= htmlspecialchars($values['ville']) ?>" required placeholder="Tassin-la-Demi-Lune">
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="prestations">Prestations réalisées</label>
        <input type="text" id="prestations" name="prestations" value="<?= htmlspecialchars($values['prestations']) ?>" placeholder="PEINTURE · PLÂTRERIE">
      </div>
      <div class="field">
        <label for="date">Date du chantier</label>
        <input type="date" id="date" name="date" value="<?= htmlspecialchars($values['date']) ?>">
      </div>
    </div>
    <div class="field">
      <label for="tags">Tags (optionnel)</label>
      <input type="text" id="tags" name="tags" value="<?= htmlspecialchars($values['tags']) ?>" placeholder="rénovation, conseil couleur…">
    </div>
    <div class="field">
      <label for="description">Description</label>
      <textarea id="description" name="description" rows="5" placeholder="Le contexte du chantier, les envies du client, les surfaces travaillées…"><?= htmlspecialchars($values['description']) ?></textarea>
    </div>
  </div>

  <div class="card">
    <h2>Adresse de la page &amp; référencement</h2>
    <div class="field">
      <label for="slug">URL de la page</label>
      <div style="display:flex;align-items:center;gap:4px">
        <span class="help" style="margin:0">matiereetnuance.fr/realisations/</span>
        <input type="text" id="slug" name="slug" value="<?= htmlspecialchars($values['id']) ?>" placeholder="<?= htmlspecialchars($suggestedSlug) ?>" style="max-width:260px">
      </div>
      <?php if (!$isNew): ?><div class="help">⚠️ Changer l'URL casse les liens déjà partagés ou indexés par Google.</div><?php endif; ?>
    </div>
    <div class="field">
      <label for="meta_title">Meta Title <span class="muted">(optionnel — sinon généré automatiquement)</span></label>
      <input type="text" id="meta_title" name="meta_title" value="<?= htmlspecialchars($values['meta_title']) ?>" placeholder="<?= htmlspecialchars($suggestedMetaTitle) ?>">
    </div>
    <div class="field">
      <label for="meta_description">Meta Description <span class="muted">(optionnel — sinon générée automatiquement)</span></label>
      <textarea id="meta_description" name="meta_description" rows="2" placeholder="<?= htmlspecialchars($suggestedMetaDesc) ?>"><?= htmlspecialchars($values['meta_description']) ?></textarea>
    </div>
    <div class="help">Les balises Open Graph, le fil d'Ariane et les données structurées (Schema.org) sont générés automatiquement à partir de ces informations — rien d'autre à faire.</div>
  </div>

  <div class="card">
    <h2>Image principale <span class="muted">— utilisée sur la vignette du site</span></h2>
    <?php if ($values['image_main'] || $values['fallback_slot']): ?>
      <img class="thumb" style="width:160px;height:110px;margin-bottom:12px" src="../<?= htmlspecialchars(realisation_main_image_url($values)) ?>" alt="">
    <?php endif; ?>
    <label class="dropzone" data-dropzone>
      <input type="file" name="image_main" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif">
      <span data-dz-label>Cliquez ou glissez-déposez une photo ici</span>
    </label>
    <div class="field" style="margin-top:12px">
      <label for="image_main_alt">Texte alternatif (ALT)</label>
      <input type="text" id="image_main_alt" name="image_main_alt" value="<?= htmlspecialchars($values['image_main_alt']) ?>" placeholder="<?= htmlspecialchars(suggest_alt($values['title'] ?: 'Réalisation', $values['ville'])) ?>">
    </div>
    <div class="help">Photo directement depuis un iPhone acceptée telle quelle (HEIC compris) : redimensionnement, compression et conversion JPEG + WebP automatiques.</div>
  </div>

  <div class="card">
    <h2>Photos Avant / Après <span class="muted">— optionnel</span></h2>
    <div class="field-row">
      <div class="field">
        <label>Avant</label>
        <?php if ($values['avant']): ?><img class="thumb" style="width:140px;height:96px;margin-bottom:8px" src="<?= htmlspecialchars(realisation_thumb_url($values['id'], $values['avant'])) ?>" alt=""><?php endif; ?>
        <label class="dropzone" data-dropzone>
          <input type="file" name="avant" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif">
          <span data-dz-label>Photo « avant »</span>
        </label>
        <input type="text" name="avant_alt" value="<?= htmlspecialchars($values['avant_alt']) ?>" placeholder="Texte alternatif" style="margin-top:8px">
      </div>
      <div class="field">
        <label>Après</label>
        <?php if ($values['apres']): ?><img class="thumb" style="width:140px;height:96px;margin-bottom:8px" src="<?= htmlspecialchars(realisation_thumb_url($values['id'], $values['apres'])) ?>" alt=""><?php endif; ?>
        <label class="dropzone" data-dropzone>
          <input type="file" name="apres" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif">
          <span data-dz-label>Photo « après »</span>
        </label>
        <input type="text" name="apres_alt" value="<?= htmlspecialchars($values['apres_alt']) ?>" placeholder="Texte alternatif" style="margin-top:8px">
      </div>
    </div>
  </div>

  <div class="card">
    <h2>Galerie photos</h2>
    <?php if (!empty($values['gallery'])): ?>
      <div class="gallery-grid">
        <?php foreach ($values['gallery'] as $g): ?>
          <div style="text-align:center;font-size:11px;width:110px">
            <img src="<?= htmlspecialchars(realisation_thumb_url($values['id'], $g['file'])) ?>" alt="" style="width:110px;height:76px">
            <input type="text" name="gallery_alt[<?= htmlspecialchars($g['file']) ?>]" value="<?= htmlspecialchars($g['alt']) ?>" placeholder="Texte alternatif" style="width:100%;margin-top:4px;padding:4px 6px;font-size:11px">
            <label style="display:block;margin-top:4px"><input type="checkbox" name="remove_gallery[]" value="<?= htmlspecialchars($g['file']) ?>"> retirer</label>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
    <label class="dropzone" data-dropzone style="margin-top:12px">
      <input type="file" name="gallery[]" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple>
      <span data-dz-label>📷 Sélectionnez plusieurs photos d'un coup depuis votre iPhone (10 ou plus) — toutes sont optimisées, converties en WebP et classées automatiquement</span>
    </label>
    <div class="help">Un texte alternatif est proposé automatiquement à l'ajout — modifiable ici à tout moment. En cas de fichier illisible (ex. HEIC non convertible), les autres photos sont tout de même ajoutées ; le détail s'affiche après l'enregistrement.</div>
  </div>

  <div class="btn-row">
    <button type="submit" class="btn">Enregistrer</button>
    <a href="realisations.php" class="btn btn-ghost">Annuler</a>
  </div>
</form>
<?php require __DIR__ . '/includes/footer.php'; ?>
