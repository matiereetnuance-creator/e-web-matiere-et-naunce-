<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/helpers.php';
require_once __DIR__ . '/api/lib/content.php';

$id = clean_text((string) ($_GET['id'] ?? ''), 100);
$realisations = load_content('realisations', []);

$index = null;
foreach ($realisations as $k => $r) {
    if (($r['id'] ?? '') === $id) {
        $index = $k;
        break;
    }
}

if ($index === null) {
    http_response_code(404);
    require __DIR__ . '/404.html';
    exit;
}

$r = $realisations[$index];
$prev = $index > 0 ? $realisations[$index - 1] : null;
$next = $index < count($realisations) - 1 ? $realisations[$index + 1] : null;

$caption = trim(($r['title'] ?? '') . ' — ' . ($r['ville'] ?? ''));
$mainAlt = $r['image_main_alt'] ?: suggest_alt($r['title'] ?? '', $r['ville'] ?? '');
$hasBeforeAfter = !empty($r['avant']) && !empty($r['apres']);

$pageKey = 'realisation'; // ne correspond à aucune clé de seo.json : $title/$description ci-dessous priment (voir includes/seo-head.php)
$canonicalPath = 'realisations/' . $r['id'];
$metaTitle = realisation_meta_title($r);
$metaDescription = realisation_meta_description($r);
$ogImage = 'https://www.matiereetnuance.fr/' . realisation_main_image_url($r);
$title = $metaTitle;
$description = $metaDescription;
$ogType = 'article';

$jsonLd = [
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Accueil', 'item' => 'https://www.matiereetnuance.fr/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Réalisations', 'item' => 'https://www.matiereetnuance.fr/realisations'],
        ['@type' => 'ListItem', 'position' => 3, 'name' => $r['title'] ?? '', 'item' => 'https://www.matiereetnuance.fr/realisations/' . $r['id']],
    ],
];
$articleLd = [
    '@context' => 'https://schema.org',
    '@type' => 'Article',
    'headline' => $r['title'] ?? '',
    'image' => [$ogImage],
    'description' => $metaDescription,
    'about' => $r['prestations'] ?? '',
    'author' => ['@type' => 'Organization', 'name' => 'Matière & Nuance'],
    'publisher' => ['@type' => 'Organization', 'name' => 'Matière & Nuance', 'logo' => ['@type' => 'ImageObject', 'url' => 'https://www.matiereetnuance.fr/assets/img/logo-carre.png', 'width' => 512, 'height' => 512]],
];
if (!empty($r['date'])) {
    $articleLd['datePublished'] = $r['date'];
}
$extraJsonLd = '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>'
    . '<script type="application/ld+json">' . json_encode($articleLd, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
?><!DOCTYPE html>
<html lang="fr">
<head>
<?php require __DIR__ . '/includes/seo-head.php'; ?>
</head>
<body>

<?php $activePage = 'realisations'; require __DIR__ . '/includes/nav.php'; ?>

<main id="main-content">

<header style="padding:110px 64px 50px">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;align-items:center;gap:18px">
      <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:44px" width="44" height="44">
      <span style="font:500 13px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">RÉALISATION</span>
    </div>
    <h1 class="mn-h1" data-mn-reveal style="font:400 62px/1.1 'Instrument Serif',serif;color:#2b2926;margin:26px 0 0;max-width:900px;font-weight:400;text-wrap:balance"><?= htmlspecialchars($r['title'] ?? '') ?></h1>
    <div data-mn-reveal style="display:flex;gap:22px;flex-wrap:wrap;align-items:center;margin-top:20px;font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.1em;color:#8a7a63">
      <span><?= htmlspecialchars($r['ville'] ?? '') ?></span>
      <?php if (!empty($r['type_bien'])): ?><span style="color:#a6947c">·</span><span>Type de bien : <?= htmlspecialchars($r['type_bien']) ?></span><?php endif; ?>
      <?php if (!empty($r['prestations'])): ?><span class="pill-like" style="color:#a6947c">·</span><span><?= htmlspecialchars($r['prestations']) ?></span><?php endif; ?>
      <?php if (!empty($r['date'])): ?><span style="color:#a6947c">·</span><span><?= htmlspecialchars(date('m/Y', strtotime($r['date']))) ?></span><?php endif; ?>
    </div>
  </div>
</header>

<section style="padding:0 64px 60px">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="height:560px;overflow:hidden">
      <?= render_photo(realisation_main_image_url($r), $mainAlt, 'width="1200" height="560" loading="eager" fetchpriority="high" style="width:100%;height:100%;object-fit:cover"') ?>
    </div>
  </div>
</section>

<?php if (!empty($r['description'])): ?>
<section style="padding:0 64px 60px">
  <div class="container" style="padding:0;max-width:820px;margin-left:auto;margin-right:auto">
    <p data-mn-reveal style="font:400 17px/1.85 'Instrument Sans',sans-serif;color:#4c463d;text-align:center"><?= nl2br(htmlspecialchars($r['description'])) ?></p>
  </div>
</section>
<?php endif; ?>

<?php if ($hasBeforeAfter): ?>
<section style="padding:0 64px 90px">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;justify-content:space-between;align-items:baseline">
      <h2 class="mn-h2--md" style="font:400 32px/1.1 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">Avant <em style="font-style:italic;color:#8a7a63">/ après</em></h2>
      <span style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.2em;color:#a6947c">GLISSEZ POUR COMPARER</span>
    </div>
    <?php
      // Calque de base (toujours visible) = APRÈS. Calque du dessus, découpé
      // par clip-path pour ne montrer que sa partie gauche (voir setP() dans
      // main.js) = AVANT. Résultat : AVANT à gauche, APRÈS à droite — ne pas
      // permuter l'un sans l'autre, ni sans les étiquettes ci-dessous.
    ?>
    <div data-mn-reveal data-ba style="height:560px;margin-top:32px">
      <div style="position:absolute;inset:0">
        <img class="mn-ph" src="<?= htmlspecialchars(realisation_photo_url($r['id'], $r['apres'])) ?>" alt="<?= htmlspecialchars($r['apres_alt'] ?: suggest_alt($r['title'] ?? '', $r['ville'] ?? '', 'après travaux')) ?>" width="1200" height="560" loading="lazy">
      </div>
      <div data-ba-top style="clip-path:inset(0 45% 0 0)">
        <img class="mn-ph" src="<?= htmlspecialchars(realisation_photo_url($r['id'], $r['avant'])) ?>" alt="<?= htmlspecialchars($r['avant_alt'] ?: suggest_alt($r['title'] ?? '', $r['ville'] ?? '', 'avant travaux')) ?>" width="1200" height="560" loading="lazy">
      </div>
      <div data-ba-line style="left:55%;width:2px">
        <div class="mn-ba-handle">
          <span class="mn-ba-arrow mn-ba-arrow--l" aria-hidden="true">‹</span>
          <img src="/assets/img/esperluette-beige.svg" alt="" draggable="false" style="height:35px">
          <span class="mn-ba-arrow mn-ba-arrow--r" aria-hidden="true">›</span>
        </div>
      </div>
      <div style="position:absolute;left:24px;bottom:20px;font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.22em;color:#f7f3ec;background:rgba(43,41,38,.55);padding:8px 14px;backdrop-filter:blur(4px)">AVANT</div>
      <div style="position:absolute;right:24px;bottom:20px;font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.22em;color:#f7f3ec;background:rgba(43,41,38,.55);padding:8px 14px;backdrop-filter:blur(4px)">APRÈS</div>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if (!empty($r['gallery'])): ?>
<section style="padding:0 64px 90px">
  <div class="container" style="padding:0;max-width:1280px">
    <h2 class="mn-h2--md" data-mn-reveal style="font:400 32px/1.1 'Instrument Serif',serif;color:#2b2926;margin:0 0 32px;font-weight:400">Galerie</h2>
    <div class="mn-grid-3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px" data-mn-lightbox>
      <?php foreach ($r['gallery'] as $gi => $g): $galleryItem = is_array($g) ? $g : ['file' => $g, 'alt' => '']; $galleryAlt = $galleryItem['alt'] ?: suggest_alt($r['title'] ?? '', $r['ville'] ?? ''); ?>
        <figure class="mn-fig" data-mn-reveal style="margin:0">
          <button type="button" class="mn-fig__trigger" data-mn-lightbox-item aria-label="Agrandir la photo <?= $gi + 1 ?> — <?= htmlspecialchars($galleryAlt) ?>">
            <div class="mn-fig__img" style="height:260px">
              <div class="mn-fig__img-inner">
                <img class="mn-ph" src="<?= htmlspecialchars(realisation_photo_url($r['id'], $galleryItem['file'])) ?>" alt="<?= htmlspecialchars($galleryAlt) ?>" width="400" height="260" loading="lazy">
              </div>
            </div>
          </button>
        </figure>
      <?php endforeach; ?>
    </div>
  </div>
</section>
<?php endif; ?>

<?php if ($prev || $next): ?>
<section style="padding:0 64px 60px">
  <div class="container" style="padding:0;max-width:1280px;display:flex;justify-content:space-between;gap:20px;border-top:1px solid #e8e1d3;padding-top:28px;flex-wrap:wrap">
    <?php if ($prev): ?>
      <a href="/realisations/<?= rawurlencode($prev['id']) ?>" style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.14em;color:#8a7a63">← <?= htmlspecialchars($prev['title'] ?? '') ?></a>
    <?php else: ?><span></span><?php endif; ?>
    <?php if ($next): ?>
      <a href="/realisations/<?= rawurlencode($next['id']) ?>" style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.14em;color:#8a7a63"><?= htmlspecialchars($next['title'] ?? '') ?> →</a>
    <?php endif; ?>
  </div>
</section>
<?php endif; ?>

<section style="padding:0 64px 96px">
  <div data-mn-reveal class="cta-dark">
    <img class="cta-dark__amp" src="/assets/img/esperluette-laiton.svg" alt="">
    <div style="position:relative">
      <div class="cta-dark__title">Votre intérieur mérite la même <em style="font-style:italic;color:#c8b394">attention.</em></div>
      <div class="cta-dark__sub">Parlons de votre pièce, de votre projet.</div>
    </div>
    <a class="btn-outline-gold" style="position:relative" href="/contact">DEMANDER UN ÉCHANGE</a>
  </div>
</section>

</main>

<?php require __DIR__ . '/includes/footer.php'; ?>

<script src="/assets/js/main.js?v=<?= asset_version('assets/js/main.js') ?>" defer></script>
<?php if (!empty($r['gallery'])): ?><script src="/assets/js/lightbox.js?v=<?= asset_version('assets/js/lightbox.js') ?>" defer></script><?php endif; ?>
</body>
</html>
