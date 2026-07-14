<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/content.php';

$textes = load_content('textes', []);
$pageKey = 'entreprise';
$canonicalPath = 'entreprise';
$extraJsonLd = '<script type="application/ld+json">' . json_encode([
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Accueil', 'item' => 'https://www.matiereetnuance.fr/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => "L'entreprise", 'item' => 'https://www.matiereetnuance.fr/entreprise'],
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
?><!DOCTYPE html>
<html lang="fr">
<head>
<?php require __DIR__ . '/includes/seo-head.php'; ?>
</head>
<body>

<?php $activePage = 'entreprise'; require __DIR__ . '/includes/nav.php'; ?>

<header style="padding:110px 64px 90px">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;align-items:center;gap:18px">
      <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:44px" width="44" height="44">
      <span style="font:500 13px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">L'ENTREPRISE</span>
    </div>
    <h1 class="mn-h1" data-mn-reveal style="font:400 76px/1.06 'Instrument Serif',serif;color:#2b2926;margin:26px 0 0;max-width:940px;font-weight:400;text-wrap:balance">L'exigence du détail, la passion des beaux <em style="font-style:italic;color:#8a7a63">intérieurs.</em></h1>
  </div>
</header>

<section id="histoire" style="padding:0 64px 100px">
  <div class="mn-entreprise-grid container" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1fr 1.25fr;gap:72px;align-items:start">
    <div data-mn-reveal style="height:620px;overflow:hidden">
      <div style="height:100%"><?= render_photo(photo_src('ent-portrait'), "Portrait du fondateur de Matière & Nuance dans son atelier", 'width="620" height="620" loading="eager" fetchpriority="high"') ?></div>
    </div>
    <div style="padding-top:12px">
      <div data-mn-reveal style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">L'HISTOIRE</div>
      <p data-mn-reveal style="font:400 24px/1.65 'Instrument Serif',serif;color:#2b2926;margin:24px 0 0"><?= t($textes, 'ent_histoire_lead', "Matière & Nuance est née d'une conviction simple : la peinture n'est pas une couche, c'est une matière que l'on travaille.") ?></p>
      <p data-mn-reveal class="mn-body-lg" style="font:400 15.5px/1.95 'Instrument Sans',sans-serif;color:#6c665c;margin:26px 0 0"><?= t($textes, 'ent_histoire_p1', "Après plusieurs années de métier, j'ai souhaité créer une entreprise à mon image.") ?></p>
      <p data-mn-reveal class="mn-body-lg" style="font:400 15.5px/1.95 'Instrument Sans',sans-serif;color:#6c665c;margin:20px 0 0"><?= t($textes, 'ent_histoire_p2', "J'accorde une importance particulière à la préparation des supports, à la qualité des finitions et au respect des lieux de vie.") ?></p>
      <p data-mn-reveal style="font:400 16px/1.7 'Instrument Serif',serif;font-style:italic;color:#8a7a63;margin:20px 0 0"><?= t($textes, 'ent_histoire_conclusion', "C'est cette façon de travailler, simple et sincère, qui guide chaque réalisation.") ?></p>
      <div data-mn-reveal class="mn-stat-row" style="display:flex;gap:56px;margin-top:44px">
        <div><div style="font:400 44px 'Instrument Serif',serif;color:#2b2926"><?= t($textes, 'stat_years', '10') ?><span style="color:#a6947c"> ans</span></div><div style="font:500 11.5px 'Instrument Sans',sans-serif;letter-spacing:.18em;color:#8a7a63;margin-top:6px">D'EXPÉRIENCE</div></div>
        <div><div style="font:400 44px 'Instrument Serif',serif;color:#2b2926"><?= t($textes, 'stat_rating', '4,9') ?><span style="color:#a6947c">/5</span></div><div style="font:500 11.5px 'Instrument Sans',sans-serif;letter-spacing:.18em;color:#8a7a63;margin-top:6px">SUR GOOGLE</div></div>
        <div><div style="font:400 44px 'Instrument Serif',serif;color:#2b2926"><?= t($textes, 'stat_clients', '+ 20') ?></div><div style="font:500 11.5px 'Instrument Sans',sans-serif;letter-spacing:.18em;color:#8a7a63;margin-top:6px">CLIENTS ACCOMPAGNÉS</div></div>
      </div>
    </div>
  </div>
</section>

<section id="valeurs" style="background:#eee8db;padding:96px 64px">
  <div class="container" style="padding:0;max-width:1280px">
    <h2 class="mn-h2" data-mn-reveal style="font:400 46px/1.1 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">Ce qui nous <em style="font-style:italic;color:#8a7a63">tient.</em></h2>
    <div class="mn-grid-3" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;margin-top:56px">
      <div data-mn-reveal style="border-top:1px solid #a6947c;padding-top:22px">
        <h3 style="font:400 24px 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">La précision</h3>
        <p style="font:400 14.5px/1.8 'Instrument Sans',sans-serif;color:#6c665c;margin:12px 0 0">Une belle finition commence toujours par une préparation soignée. Chaque détail compte, des angles aux rechampis, parce que c'est ce qui fait toute la différence une fois le chantier terminé.</p>
      </div>
      <div data-mn-reveal style="border-top:1px solid #a6947c;padding-top:22px">
        <h3 style="font:400 24px 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">Le respect des lieux</h3>
        <p style="font:400 14.5px/1.8 'Instrument Sans',sans-serif;color:#6c665c;margin:12px 0 0">Sols protégés, meubles couverts, chantier rangé chaque soir. Votre maison reste la vôtre, même pendant les travaux.</p>
      </div>
      <div data-mn-reveal style="border-top:1px solid #a6947c;padding-top:22px">
        <h3 style="font:400 24px 'Instrument Serif',serif;color:#2b2926;margin:0;font-weight:400">La parole tenue</h3>
        <p style="font:400 14.5px/1.8 'Instrument Sans',sans-serif;color:#6c665c;margin:12px 0 0">Un devis clair, un calendrier réaliste, des délais tenus. Ce que nous annonçons, nous le faisons — et nous le vérifions avec vous.</p>
      </div>
    </div>
  </div>
</section>

<section id="garanties" style="padding:96px 64px">
  <div class="mn-entreprise-grid container" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center">
    <div>
      <div data-mn-reveal style="font:500 12px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">LES GARANTIES</div>
      <h2 class="mn-h2--md" data-mn-reveal style="font:400 44px/1.15 'Instrument Serif',serif;color:#2b2926;margin:20px 0 0;font-weight:400">Une confiance <em style="font-style:italic;color:#8a7a63">assurée.</em></h2>
      <div data-mn-reveal style="margin-top:36px;display:grid;gap:20px;font:400 14.5px/1.7 'Instrument Sans',sans-serif;color:#4c463d">
        <div style="display:flex;gap:16px;align-items:baseline"><span style="color:#a6947c">—</span>Assurance décennale &amp; responsabilité civile professionnelle</div>
        <div style="display:flex;gap:16px;align-items:baseline"><span style="color:#a6947c">—</span>Devis détaillé poste par poste, sans surprise</div>
        <div style="display:flex;gap:16px;align-items:baseline"><span style="color:#a6947c">—</span>Produits sélectionnés : peintures haut de gamme, faibles émissions</div>
        <div style="display:flex;gap:16px;align-items:baseline"><span style="color:#a6947c">—</span>Réception de chantier contradictoire, retouches immédiates</div>
      </div>
    </div>
    <div data-mn-reveal style="height:440px;overflow:hidden">
      <div style="height:100%"><?= render_photo(photo_src('ent-garanties'), 'Nuancier et outils de peinture, détail matière', 'width="600" height="440" loading="lazy"') ?></div>
    </div>
  </div>
</section>

<section style="padding:0 64px 96px">
  <div data-mn-reveal class="cta-dark">
    <img class="cta-dark__amp" src="/assets/img/esperluette-laiton.svg" alt="">
    <div style="position:relative">
      <div class="cta-dark__title">Rencontrons-nous chez <em style="font-style:italic;color:#c8b394">vous.</em></div>
      <div class="cta-dark__sub">La première visite est toujours sans engagement.</div>
    </div>
    <a class="btn-outline-gold" style="position:relative" href="/contact">DEMANDER UN ÉCHANGE</a>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>

<script src="/assets/js/main.js" defer></script>
</body>
</html>
