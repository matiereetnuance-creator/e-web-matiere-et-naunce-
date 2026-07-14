<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/lib/content.php';
/** @var string $activePage savoir-faire | realisations | entreprise | avis | contact | '' */
$activePage = $activePage ?? '';
$settings = load_content('settings', []);
$textes = load_content('textes', []);
$instagram = $settings['instagram_url'] ?? 'https://www.instagram.com/matiere_et_nuance';
$phone = t($textes, 'contact_phone', '07 60 03 38 20');
$navClass = static function (string $key) use ($activePage): string {
    return $activePage === $key ? 'is-active' : '';
};
?>
<nav class="mn-nav" aria-label="Navigation principale">
  <a href="/" aria-label="Retour à l'accueil Matière &amp; Nuance"><img class="mn-nav__logo" src="/assets/img/logo-noir.png" alt="Matière &amp; Nuance" width="230" height="52"></a>
  <div class="mn-nav__links mn-nav__links--desktop">
    <a class="<?= $navClass('savoir-faire') ?>" href="/savoir-faire">SAVOIR-FAIRE</a>
    <a class="<?= $navClass('realisations') ?>" href="/realisations">RÉALISATIONS</a>
    <a class="<?= $navClass('entreprise') ?>" href="/entreprise">L'ENTREPRISE</a>
    <?php if ($settings['avis_section_enabled'] ?? true): ?><a class="<?= $navClass('avis') ?>" href="/avis">AVIS</a><?php endif; ?>
    <a class="mn-nav__ig" href="<?= htmlspecialchars($instagram) ?>" target="_blank" rel="noopener" aria-label="Instagram Matière &amp; Nuance">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"></circle></svg>
    </a>
    <a class="mn-nav__cta" href="/contact"<?= $activePage === 'contact' ? ' style="background:#2b2926;color:#f7f3ec"' : '' ?>>CONTACT</a>
  </div>
  <div class="mn-burger-wrap">
    <a href="<?= htmlspecialchars($instagram) ?>" target="_blank" rel="noopener" aria-label="Instagram" style="display:flex;align-items:center;color:#2b2926;padding:8px">
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"></circle></svg>
    </a>
    <button class="mn-burger" data-mn-burger aria-label="Ouvrir le menu"><span></span><span></span><span></span></button>
  </div>
</nav>

<div class="mn-mobile-menu" data-mn-mobile-menu>
  <div style="display:flex;justify-content:space-between;align-items:center">
    <img src="/assets/img/logo-noir.png" alt="Matière &amp; Nuance" style="height:36px">
    <button data-mn-close aria-label="Fermer" style="background:none;border:none;cursor:pointer;font:400 26px 'Instrument Serif',serif;color:#2b2926;padding:6px 10px">×</button>
  </div>
  <div style="display:flex;flex-direction:column;gap:26px;margin-top:70px;padding:0 8px">
    <a href="/savoir-faire" style="font:400 32px 'Instrument Serif',serif;color:#2b2926">Savoir-faire</a>
    <a href="/realisations" style="font:400 32px 'Instrument Serif',serif;color:#2b2926">Réalisations</a>
    <a href="/entreprise" style="font:400 32px 'Instrument Serif',serif;color:#2b2926">L'entreprise</a>
    <?php if ($settings['avis_section_enabled'] ?? true): ?><a href="/avis" style="font:400 32px 'Instrument Serif',serif;color:#2b2926">Avis</a><?php endif; ?>
    <a href="/contact" style="font:400 32px 'Instrument Serif',serif;color:#2b2926">Contact</a>
  </div>
  <div style="margin-top:auto;padding:0 8px 28px;display:flex;align-items:center;gap:14px">
    <img src="/assets/img/esperluette-beige.svg" alt="&amp;" style="height:26px">
    <span style="font:400 12.5px 'Instrument Sans',sans-serif;color:#8a7a63"><?= htmlspecialchars($phone) ?> · Ouest lyonnais &amp; Beaujolais</span>
  </div>
</div>
