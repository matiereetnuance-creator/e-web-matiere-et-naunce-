/*
 * Galerie premium — lightbox légère, sans dépendance.
 * Ouverture animée depuis la vignette (transform/opacity uniquement, pas
 * de reflow répété par frame), voile clair + flou, navigation clavier,
 * flèches à l'écran, swipe tactile, compteur discret. Ne précharge que
 * les deux photos voisines de celle affichée (jamais toute la galerie).
 */
(function () {
  'use strict';

  function initGallery(container) {
    var figures = Array.prototype.slice.call(container.querySelectorAll('[data-mn-lightbox-item]'));
    if (!figures.length) return;

    var items = figures.map(function (fig) {
      var img = fig.querySelector('img');
      return { trigger: fig, src: img.currentSrc || img.src, alt: img.alt };
    });

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var overlay = null;
    var stage, imgEl, counterEl, closeBtn, prevBtn, nextBtn;
    var currentIndex = -1;
    var lastFocused = null;
    var preloaded = {};
    var animTimer = null;

    function build() {
      overlay = document.createElement('div');
      overlay.className = 'mn-lightbox';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Photo agrandie');
      overlay.hidden = true;
      overlay.innerHTML =
        '<div class="mn-lightbox__stage" data-mn-lb-stage>' +
          '<figure class="mn-lightbox__figure"><img class="mn-lightbox__img" alt=""></figure>' +
        '</div>' +
        '<button type="button" class="mn-lightbox__close" data-mn-lb-close aria-label="Fermer">×</button>' +
        '<button type="button" class="mn-lightbox__nav mn-lightbox__nav--prev" data-mn-lb-prev aria-label="Photo précédente">‹</button>' +
        '<button type="button" class="mn-lightbox__nav mn-lightbox__nav--next" data-mn-lb-next aria-label="Photo suivante">›</button>' +
        '<div class="mn-lightbox__counter" data-mn-lb-counter aria-hidden="true"></div>';
      document.body.appendChild(overlay);

      stage = overlay.querySelector('[data-mn-lb-stage]');
      imgEl = overlay.querySelector('.mn-lightbox__img');
      counterEl = overlay.querySelector('[data-mn-lb-counter]');
      closeBtn = overlay.querySelector('[data-mn-lb-close]');
      prevBtn = overlay.querySelector('[data-mn-lb-prev]');
      nextBtn = overlay.querySelector('[data-mn-lb-next]');

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close();
      });
      closeBtn.addEventListener('click', close);
      prevBtn.addEventListener('click', function () { go(-1); });
      nextBtn.addEventListener('click', function () { go(1); });
      overlay.addEventListener('keydown', onKeydown);
      overlay.addEventListener('pointerdown', onPointerDown);
    }

    function onKeydown(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowLeft') { go(-1); return; }
      if (e.key === 'ArrowRight') { go(1); return; }
      if (e.key === 'Tab') trapFocus(e);
    }

    function trapFocus(e) {
      var focusables = [closeBtn, prevBtn, nextBtn];
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Swipe tactile simple : seuil de distance horizontale, sans suivi du
    // doigt image par image (robuste, pas de reflow supplémentaire par frame).
    var swipeStartX = null;
    var swipeStartY = null;
    function onPointerDown(e) {
      if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
      swipeStartX = e.clientX;
      swipeStartY = e.clientY;
      overlay.addEventListener('pointerup', onPointerUp, { once: true });
    }
    function onPointerUp(e) {
      if (swipeStartX === null) return;
      var dx = e.clientX - swipeStartX;
      var dy = e.clientY - swipeStartY;
      swipeStartX = null;
      swipeStartY = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1);
      }
    }

    /** Précharge uniquement l'image donnée si elle ne l'est pas déjà. */
    function preload(index) {
      if (preloaded[index]) return;
      preloaded[index] = true;
      var im = new Image();
      im.src = items[index].src;
    }

    function updateChrome() {
      counterEl.textContent = (currentIndex + 1) + ' / ' + items.length;
      // Précharge discrètement les deux voisines de la photo affichée —
      // jamais le reste de la galerie — pour une navigation instantanée.
      preload((currentIndex - 1 + items.length) % items.length);
      preload((currentIndex + 1) % items.length);
    }

    function show(index, animateSwap) {
      currentIndex = index;
      var item = items[index];
      if (animateSwap && !reduceMotion) {
        imgEl.style.transition = 'opacity .15s ease';
        imgEl.style.opacity = '0';
        window.setTimeout(function () {
          imgEl.src = item.src;
          imgEl.alt = item.alt;
          imgEl.style.opacity = '1';
        }, 150);
      } else {
        imgEl.src = item.src;
        imgEl.alt = item.alt;
      }
      updateChrome();
    }

    function go(delta) {
      if (items.length < 2) return;
      show((currentIndex + delta + items.length) % items.length, true);
    }

    /** Position/taille relatives calculées une fois, sans dépendre du chargement de l'image finale. */
    function flipTransform(fromRect, toRect) {
      var dx = (fromRect.left + fromRect.width / 2) - (toRect.left + toRect.width / 2);
      var dy = (fromRect.top + fromRect.height / 2) - (toRect.top + toRect.height / 2);
      var sx = fromRect.width / toRect.width;
      var sy = fromRect.height / toRect.height;
      return 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')';
    }

    function open(index) {
      lastFocused = document.activeElement;
      if (!overlay) build();

      var triggerImg = items[index].trigger.querySelector('img');
      var thumbRect = triggerImg.getBoundingClientRect();

      overlay.hidden = false;
      document.body.style.overflow = 'hidden';
      show(index, false);

      if (reduceMotion) {
        overlay.classList.add('is-open');
      } else {
        var finalRect = stage.getBoundingClientRect();
        stage.style.transition = 'none';
        stage.style.opacity = '0';
        stage.style.transform = flipTransform(thumbRect, finalRect);
        // Force le calcul de style avant de lancer la transition (même
        // méthode que le voile de transition de page dans main.js).
        stage.getBoundingClientRect();
        overlay.classList.add('is-open');
        requestAnimationFrame(function () {
          stage.style.transition = '';
          stage.classList.add('is-animating');
          stage.style.transform = 'none';
          stage.style.opacity = '1';
        });
      }

      closeBtn.focus();
    }

    function close() {
      if (!overlay || overlay.hidden) return;

      var triggerImg = items[currentIndex].trigger.querySelector('img');
      var thumbRect = triggerImg.getBoundingClientRect();

      function finish() {
        overlay.hidden = true;
        overlay.classList.remove('is-open');
        stage.classList.remove('is-animating');
        stage.style.transition = '';
        stage.style.transform = '';
        stage.style.opacity = '';
        document.body.style.overflow = '';
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
      }

      if (reduceMotion) {
        finish();
        return;
      }

      var currentRect = stage.getBoundingClientRect();
      overlay.classList.remove('is-open');
      stage.classList.add('is-animating');
      stage.style.transform = flipTransform(thumbRect, currentRect);
      stage.style.opacity = '0';

      window.clearTimeout(animTimer);
      animTimer = window.setTimeout(finish, 260);
    }

    figures.forEach(function (fig, i) {
      fig.addEventListener('click', function () { open(i); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-mn-lightbox]').forEach(initGallery);
  });
})();
