/*
 * Réorganisation de la galerie photo par glisser-déposer (admin).
 * Pointer Events unifiés (desktop souris + tactile mobile — le drag & drop
 * HTML5 natif ne fonctionne pas sur tactile), même technique que le
 * comparateur avant/après et le swipe de la galerie premium publique.
 * Seule la vignette (pas le champ ALT ni la case "retirer") sert de poignée.
 */
(function () {
  'use strict';

  function initGrid(grid) {
    var items = function () { return Array.prototype.slice.call(grid.querySelectorAll('[data-mn-gallery-item]')); };
    var csrfInput = document.querySelector('input[name=csrf]');
    var idInput = document.querySelector('input[name=current_id]');
    if (!csrfInput || !idInput) return;

    var status = document.createElement('span');
    status.className = 'help';
    status.style.marginLeft = '10px';
    status.style.display = 'inline-block';
    var heading = grid.parentElement.querySelector('h2');
    if (heading) heading.appendChild(status);

    function setStatus(text, isError) {
      status.textContent = text;
      status.style.color = isError ? 'var(--danger)' : 'var(--ok)';
      if (!isError && text) {
        window.setTimeout(function () {
          if (status.textContent === text) status.textContent = '';
        }, 2200);
      }
    }

    function save() {
      var order = items().map(function (el) { return el.getAttribute('data-mn-gallery-file'); });
      var body = new URLSearchParams();
      body.set('csrf', csrfInput.value);
      body.set('id', idInput.value);
      order.forEach(function (file) { body.append('order[]', file); });

      setStatus('Enregistrement de l’ordre…');
      fetch('gallery-reorder.php', { method: 'POST', body: body, headers: { Accept: 'application/json' } })
        .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
        .then(function (result) {
          if (result.ok && result.json && result.json.success) {
            setStatus('Ordre enregistré ✓');
          } else {
            setStatus('Échec de l’enregistrement — rechargez la page.', true);
          }
        })
        .catch(function () {
          setStatus('Échec de l’enregistrement — rechargez la page.', true);
        });
    }

    var dragEl = null;
    var startX = 0;
    var startY = 0;
    var dragging = false;
    var DRAG_THRESHOLD = 6;

    // Écoute au niveau du document (et non de la vignette) pendant le
    // glisser : reste fiable même si le pointeur quitte rapidement les
    // limites de la vignette d'origine, sans dépendre de setPointerCapture.
    function onPointerDown(e) {
      var handle = e.target.closest('[data-mn-gallery-handle]');
      if (!handle) return;
      dragEl = handle.closest('[data-mn-gallery-item]');
      if (!dragEl) return;
      // Au toucher, empêche le navigateur de démarrer son propre geste de
      // défilement sur la poignée dès l'appui — touch-action:none (CSS)
      // seul suffit dans la plupart des cas, mais certains navigateurs
      // mobiles n'arbitrent correctement qu'avec ce preventDefault explicite.
      if (e.pointerType === 'touch') e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      dragging = false;
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
    }

    function onPointerMove(e) {
      if (!dragEl) return;
      if (!dragging) {
        if (Math.abs(e.clientX - startX) < DRAG_THRESHOLD && Math.abs(e.clientY - startY) < DRAG_THRESHOLD) return;
        dragging = true;
        dragEl.classList.add('is-dragging');
      }
      var overEl = document.elementFromPoint(e.clientX, e.clientY);
      var target = overEl && overEl.closest('[data-mn-gallery-item]');
      if (!target || target === dragEl || target.parentElement !== grid) return;
      var rect = target.getBoundingClientRect();
      var before = (e.clientX - rect.left) < rect.width / 2;
      grid.insertBefore(dragEl, before ? target : target.nextSibling);
    }

    function onPointerUp() {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      if (dragEl) dragEl.classList.remove('is-dragging');
      if (dragging) save();
      dragEl = null;
      dragging = false;
    }

    grid.addEventListener('pointerdown', onPointerDown);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-mn-gallery-grid]').forEach(initGrid);
  });
})();
