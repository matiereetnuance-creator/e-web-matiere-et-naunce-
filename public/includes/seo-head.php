<?php
declare(strict_types=1);
/**
 * En-tête <head> commun : SEO éditable depuis l'admin (api/data/content/seo.json),
 * favicon, polices, feuille de style. Inclus par chaque page publique.
 *
 * Variables attendues avant l'include :
 *   $pageKey            (string) clé dans seo.json : home | savoir-faire | realisations | entreprise | avis | contact
 *   $canonicalPath       (string) chemin après le domaine, ex. '' pour l'accueil, 'contact' pour /contact
 *   $ogImage             (string, optionnel) URL absolue de l'image OG (sinon og-cover.png)
 *   $extraJsonLd         (string, optionnel) bloc(s) <script type="application/ld+json"> supplémentaires, déjà formatés
 *   $robots               (string, optionnel) contenu de la balise meta robots (défaut "index, follow")
 */
require_once __DIR__ . '/../api/lib/content.php';

$siteUrl = 'https://www.matiereetnuance.fr';
$seoAll = load_content('seo', []);
$seo = $seoAll[$pageKey] ?? [];
$title = $seo['title'] ?? ($pageKey . ' | Matière & Nuance');
$description = $seo['description'] ?? '';
$ogTitle = $seo['og_title'] ?? $title;
$ogDescription = $seo['og_description'] ?? $description;
$canonical = $siteUrl . '/' . ltrim($canonicalPath ?? '', '/');
$canonical = rtrim($canonical, '/');
if (($canonicalPath ?? '') === '') {
    $canonical .= '/';
}
$ogImage = $ogImage ?? ($siteUrl . '/assets/img/og-cover.png');
$robots = $robots ?? 'index, follow';
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= htmlspecialchars($title) ?></title>
<meta name="description" content="<?= htmlspecialchars($description) ?>">
<link rel="canonical" href="<?= htmlspecialchars($canonical) ?>">
<meta name="robots" content="<?= htmlspecialchars($robots) ?>">
<meta name="theme-color" content="#f7f3ec">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Matière &amp; Nuance">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="<?= htmlspecialchars($ogTitle) ?>">
<meta property="og:description" content="<?= htmlspecialchars($ogDescription) ?>">
<meta property="og:url" content="<?= htmlspecialchars($canonical) ?>">
<meta property="og:image" content="<?= htmlspecialchars($ogImage) ?>">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="<?= htmlspecialchars($ogTitle) ?>">
<meta name="twitter:description" content="<?= htmlspecialchars($ogDescription) ?>">
<meta name="twitter:image" content="<?= htmlspecialchars($ogImage) ?>">
<link rel="icon" type="image/svg+xml" href="/assets/img/esperluette-noir.svg">
<link rel="preload" href="/assets/fonts/instrument-sans-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrument-serif-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.css">
<?php if (!empty($extraJsonLd)) { echo $extraJsonLd; } ?>
