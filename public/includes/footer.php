<?php
declare(strict_types=1);
require_once __DIR__ . '/../api/lib/content.php';
$settings = load_content('settings', []);
$instagram = $settings['instagram_url'] ?? 'https://www.instagram.com/matiere_et_nuance';
$showLogoLink = $showLogoLink ?? true;
?>
<footer class="mn-footer">
  <div class="mn-footer__row">
    <?php if ($showLogoLink): ?>
      <a href="/"><img src="/assets/img/logo-blanc.png" alt="Matière &amp; Nuance" style="height:40px" width="177" height="40"></a>
    <?php else: ?>
      <img src="/assets/img/logo-blanc.png" alt="Matière &amp; Nuance" style="height:40px" width="177" height="40">
    <?php endif; ?>
    <div class="mn-footer__links">
      <a href="/savoir-faire">SAVOIR-FAIRE</a>
      <a href="/realisations">RÉALISATIONS</a>
      <a href="/entreprise">L'ENTREPRISE</a>
      <?php if ($settings['avis_section_enabled'] ?? true): ?><a href="/avis">AVIS</a><?php endif; ?>
      <a href="/contact">CONTACT</a>
      <a href="<?= htmlspecialchars($instagram) ?>" target="_blank" rel="noopener" aria-label="Instagram" style="display:flex;align-items:center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"></circle></svg>
      </a>
    </div>
    <div class="mn-footer__copy">© <?= date('Y') ?> Matière &amp; Nuance</div>
  </div>
</footer>
