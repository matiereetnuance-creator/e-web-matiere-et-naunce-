<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/content.php';

header('Content-Type: application/xml; charset=UTF-8');

$base = 'https://www.matiereetnuance.fr';
$settings = load_content('settings', []);
$avisEnabled = $settings['avis_section_enabled'] ?? true;
$realisations = load_content('realisations', []);

$pages = [
    ['loc' => '/', 'changefreq' => 'monthly', 'priority' => '1.0'],
    ['loc' => '/savoir-faire', 'changefreq' => 'monthly', 'priority' => '0.8'],
    ['loc' => '/realisations', 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['loc' => '/entreprise', 'changefreq' => 'monthly', 'priority' => '0.7'],
    ['loc' => '/contact', 'changefreq' => 'yearly', 'priority' => '0.9'],
];
if ($avisEnabled) {
    $pages[] = ['loc' => '/avis', 'changefreq' => 'weekly', 'priority' => '0.7'];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($pages as $p) {
    echo "  <url>\n";
    echo '    <loc>' . htmlspecialchars($base . $p['loc']) . "</loc>\n";
    echo '    <changefreq>' . $p['changefreq'] . "</changefreq>\n";
    echo '    <priority>' . $p['priority'] . "</priority>\n";
    echo "  </url>\n";
}
foreach ($realisations as $r) {
    if (empty($r['id'])) {
        continue;
    }
    echo "  <url>\n";
    echo '    <loc>' . htmlspecialchars($base . '/realisations/' . $r['id']) . "</loc>\n";
    echo "    <changefreq>monthly</changefreq>\n";
    echo "    <priority>0.6</priority>\n";
    if (!empty($r['date'])) {
        echo '    <lastmod>' . htmlspecialchars($r['date']) . "</lastmod>\n";
    }
    echo "  </url>\n";
}
echo '</urlset>' . "\n";
