<?php
declare(strict_types=1);
require_once __DIR__ . '/api/lib/content.php';

$textes = load_content('textes', []);
$pageKey = 'contact';
$canonicalPath = 'contact';
$extraJsonLd = '<script type="application/ld+json">' . json_encode([
    '@context' => 'https://schema.org',
    '@type' => 'BreadcrumbList',
    'itemListElement' => [
        ['@type' => 'ListItem', 'position' => 1, 'name' => 'Accueil', 'item' => 'https://www.matiereetnuance.fr/'],
        ['@type' => 'ListItem', 'position' => 2, 'name' => 'Contact', 'item' => 'https://www.matiereetnuance.fr/contact'],
    ],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . '</script>';
$phoneTel = preg_replace('/\s+/', '', t_raw($textes, 'contact_phone', '0760033820'));
if ($phoneTel !== '' && $phoneTel[0] === '0') {
    $phoneTel = '+33' . substr($phoneTel, 1);
}
?><!DOCTYPE html>
<html lang="fr">
<head>
<?php require __DIR__ . '/includes/seo-head.php'; ?>
</head>
<body>

<?php $activePage = 'contact'; require __DIR__ . '/includes/nav.php'; ?>

<main id="main-content">

<header style="padding:110px 64px 70px">
  <div class="container" style="padding:0;max-width:1280px">
    <div data-mn-reveal style="display:flex;align-items:center;gap:18px">
      <img data-mn-amp src="/assets/img/esperluette-beige.svg" alt="" style="height:44px" width="44" height="44">
      <span style="font:500 13px 'Instrument Sans',sans-serif;letter-spacing:.28em;color:#a6947c">CONTACT</span>
    </div>
    <h1 class="mn-h1" data-mn-reveal style="font:400 76px/1.06 'Instrument Serif',serif;color:#2b2926;margin:26px 0 0;max-width:820px;font-weight:400;text-wrap:balance">Parlons de votre <em style="font-style:italic;color:#8a7a63">projet.</em></h1>
    <p data-mn-reveal class="mn-body-lg" style="font:400 16px/1.9 'Instrument Sans',sans-serif;color:#6c665c;margin:30px 0 0;max-width:540px">Décrivez-nous la pièce, la commune, l'envie. Nous répondons sous 48 h — et la première visite est toujours sans engagement.</p>
  </div>
</header>

<section style="padding:0 64px 100px">
  <div class="mn-contact-grid container" style="padding:0;max-width:1280px;display:grid;grid-template-columns:1.3fr 1fr;gap:28px;align-items:start">
    <!-- FORMULAIRE -->
    <div data-mn-reveal style="background:#fdfbf7;border:1px solid #e8e1d3;padding:52px">

      <div data-mn-contact-success hidden style="text-align:center;padding:60px 20px">
        <img src="/assets/img/esperluette-beige.svg" alt="" style="height:64px">
        <div style="font:400 32px 'Instrument Serif',serif;color:#2b2926;margin-top:26px">Merci, votre message est bien <em style="font-style:italic;color:#8a7a63">parti.</em></div>
        <div style="font:400 14.5px/1.8 'Instrument Sans',sans-serif;color:#6c665c;margin-top:14px">Nous revenons vers vous sous 48 h. Un e-mail de confirmation vient de vous être envoyé.</div>
      </div>

      <form data-mn-contact-form action="/api/contact.php" method="post" novalidate>
        <div role="alert" data-mn-contact-error hidden style="margin-bottom:20px;padding:14px 16px;background:#f7e9e4;border:1px solid #dba894;color:#7a3b26;font:400 13.5px/1.6 'Instrument Sans',sans-serif"></div>

        <!-- Honeypot anti-spam : champ invisible, doit rester vide -->
        <div class="mn-hp" aria-hidden="true">
          <label for="site_web">Ne pas remplir ce champ</label>
          <input type="text" id="site_web" name="site_web" tabindex="-1" autocomplete="off">
        </div>

        <div class="mn-field-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:22px">
          <div class="mn-field">
            <label for="nom">NOM</label>
            <input type="text" id="nom" name="nom" placeholder="Votre nom" required autocomplete="name">
          </div>
          <div class="mn-field">
            <label for="contact_val">TÉLÉPHONE OU EMAIL</label>
            <input type="text" id="contact_val" name="contact_val" placeholder="Pour vous répondre" required autocomplete="email">
          </div>
          <div class="mn-field">
            <label for="commune">COMMUNE</label>
            <input type="text" id="commune" name="commune" placeholder="Tassin, Écully, Villefranche…" autocomplete="address-level2">
          </div>
          <div class="mn-field">
            <label for="projet">PROJET</label>
            <select id="projet" name="projet">
              <option>Peinture intérieure</option>
              <option>Plâtrerie</option>
              <option>Béton ciré — pièce intime ou mobilier</option>
              <option>Rénovation complète</option>
              <option>Je ne sais pas encore</option>
            </select>
          </div>
          <div class="mn-field" style="grid-column:1/-1">
            <label for="message">VOTRE MESSAGE</label>
            <textarea id="message" name="message" rows="5" placeholder="La pièce, les surfaces, l'ambiance recherchée…" required></textarea>
          </div>
        </div>
        <p style="font:400 11.5px/1.6 'Instrument Sans',sans-serif;color:#a39a8a;margin:16px 0 0">En envoyant ce formulaire, vous acceptez que vos données soient utilisées pour vous recontacter au sujet de votre projet. Elles ne sont ni conservées au-delà de ce besoin, ni transmises à des tiers.</p>
        <button type="submit" class="btn-dark" style="margin-top:22px">ENVOYER MA DEMANDE</button>
      </form>
    </div>
    <!-- COORDONNÉES -->
    <div style="display:grid;gap:28px">
      <div data-mn-reveal data-mn-grain style="background:#2b2926;padding:44px;position:relative;overflow:hidden">
        <img src="/assets/img/esperluette-laiton.svg" alt="" style="position:absolute;right:-24px;bottom:-50px;height:220px;opacity:.14;pointer-events:none">
        <div style="position:relative;display:grid;gap:26px">
          <div>
            <div style="font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.22em;color:#c8b394">TÉLÉPHONE</div>
            <div style="font:400 22px 'Instrument Serif',serif;color:#f7f3ec;margin-top:8px"><a href="tel:<?= htmlspecialchars($phoneTel) ?>" style="color:#f7f3ec"><?= t($textes, 'contact_phone', '07 60 03 38 20') ?></a></div>
          </div>
          <div>
            <div style="font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.22em;color:#c8b394">EMAIL</div>
            <div style="font:400 20px 'Instrument Serif',serif;color:#f7f3ec;margin-top:8px"><a href="mailto:<?= htmlspecialchars(t_raw($textes, 'contact_email', 'matiereetnuance@hotmail.com')) ?>" style="color:#f7f3ec"><?= t($textes, 'contact_email', 'matiereetnuance@hotmail.com') ?></a></div>
          </div>
          <div>
            <div style="font:500 11px 'Instrument Sans',sans-serif;letter-spacing:.22em;color:#c8b394">ZONE D'INTERVENTION</div>
            <div style="font:400 15px/1.8 'Instrument Sans',sans-serif;color:#b0a99b;margin-top:8px"><?= t($textes, 'contact_zone', "Basée dans l'Ouest lyonnais, Matière & Nuance intervient auprès des particuliers et des professionnels dans l'ensemble de l'Ouest lyonnais et du Beaujolais.") ?></div>
            <div style="font:400 12.5px/1.7 'Instrument Sans',sans-serif;color:#7d766b;margin-top:10px"><?= t($textes, 'contact_zone_communes', "Tassin-la-Demi-Lune, Écully, Charbonnières-les-Bains, La Tour-de-Salvagny, Dommartin, Marcy-l'Étoile, Craponne, Grézieu-la-Varenne, Dardilly, Limonest, Francheville, Champagne-au-Mont-d'Or, Saint-Didier-au-Mont-d'Or, Sainte-Consorce, Brindas, Mornant, Villefranche-sur-Saône, Belleville-en-Beaujolais, Beaujeu, Lyon 5ᵉ, Lyon 9ᵉ et les communes environnantes.") ?></div>
          </div>
        </div>
      </div>
      <div data-mn-reveal class="mn-ph-contain mn-ph-contain--contact" style="height:280px;overflow:hidden">
        <?= render_photo(photo_src('contact-carte'), "Carte de la zone d'intervention — Ouest lyonnais et Beaujolais", 'width="500" height="280" loading="lazy"') ?>
      </div>
    </div>
  </div>
</section>

</main>

<?php require __DIR__ . '/includes/footer.php'; ?>

<script src="/assets/js/main.js?v=<?= asset_version('assets/js/main.js') ?>" defer></script>
</body>
</html>
