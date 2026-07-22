/*
 * Matière & Nuance — comportements du site
 * Reproduction fidèle des animations du design (Claude Design) :
 * transition de page en fondu crème, révélation au scroll,
 * dessin de l'esperluette, grain sur fonds sombres, menu mobile,
 * comparateur avant/après, survol des vignettes projet.
 */
(function () {
  'use strict';

  /* ---------- Transition de page (voile crème) ---------- */
  function initPageTransition() {
    var veil = document.createElement('div');
    veil.className = 'mn-veil';
    document.body.appendChild(veil);
    veil.getBoundingClientRect();
    requestAnimationFrame(function () {
      veil.style.opacity = '0';
    });
    setTimeout(function () {
      if (veil.parentNode) veil.remove();
    }, 1600);

    var leaving = false;
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (a.target === '_blank' || href === '' || href.charAt(0) === '#') return;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      // Liens externes uniquement : même origine = navigation interne
      if (/^[a-z][a-z0-9+.-]*:/i.test(href) && a.hostname !== window.location.hostname) return;
      e.preventDefault();
      if (leaving) return;
      leaving = true;
      var out = document.createElement('div');
      out.className = 'mn-veil mn-veil-out';
      out.style.opacity = '0';
      document.body.appendChild(out);
      out.getBoundingClientRect();
      out.style.opacity = '1';
      setTimeout(function () {
        window.location.href = href;
      }, 900);
    }, true);
  }

  /* ---------- Révélation au scroll + esperluettes ---------- */
  function initReveals() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-mn-reveal]'));
    var amps = Array.prototype.slice.call(document.querySelectorAll('[data-mn-amp]'));
    var ampsOnce = Array.prototype.slice.call(document.querySelectorAll('[data-mn-amp-once]'));
    var pending = els.slice();
    var pendingAmps = amps.slice();
    var pendingAmpsOnce = ampsOnce.slice();
    var stagger = 0;
    var lastTick = 0;
    var raf = null;

    function check() {
      var vh = window.innerHeight;
      var now = performance.now();
      if (now - lastTick > 400) stagger = 0;
      lastTick = now;

      pendingAmps = pendingAmps.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.85 && r.bottom > 0) {
          el.classList.add('is-visible');
          return false;
        }
        return true;
      });

      pendingAmpsOnce = pendingAmpsOnce.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.85 && r.bottom > 0) {
          el.classList.add('is-visible');
          return false;
        }
        return true;
      });

      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          var d = stagger * 120;
          stagger++;
          setTimeout(function () {
            el.classList.add('is-visible');
          }, d);
          return false;
        }
        return true;
      });
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        check();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    setTimeout(check, 80);
    var safety = setInterval(function () {
      if (!pending.length && !pendingAmps.length && !pendingAmpsOnce.length) {
        clearInterval(safety);
        return;
      }
      check();
    }, 1200);
  }

  /* ---------- Révélation cinématique du titre (Accueil) ---------- */
  function initTitleReveal() {
    setTimeout(function () {
      document.querySelectorAll('[data-mn-title]').forEach(function (h) {
        var spans = [];
        (function process(parent) {
          Array.prototype.slice.call(parent.childNodes).forEach(function (n) {
            if (n.nodeType === 3) {
              var words = n.textContent.split(/\s+/).filter(Boolean);
              if (!words.length) {
                parent.removeChild(n);
                return;
              }
              var frag = document.createDocumentFragment();
              var lead = /^\s/.test(n.textContent);
              var trail = /\s$/.test(n.textContent);
              words.forEach(function (w, wi) {
                var s = document.createElement('span');
                s.textContent = w;
                s.style.display = 'inline-block';
                spans.push(s);
                if (wi === 0 && lead) frag.appendChild(document.createTextNode(' '));
                frag.appendChild(s);
                if (wi < words.length - 1 || trail) frag.appendChild(document.createTextNode(' '));
              });
              parent.replaceChild(frag, n);
            } else if (n.nodeType === 1) {
              process(n);
            }
          });
        })(h);
        spans.forEach(function (s, i) {
          s.style.animation = 'mnfade 1.2s cubic-bezier(.22,1,.36,1) ' + (0.15 + i * 0.1) + 's both';
        });
      });
    }, 250);
  }

  /* ---------- Grain film sur fonds sombres ---------- */
  function initGrain() {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">' +
      '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/>' +
      '<feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0"/></filter>' +
      '<rect width="140" height="140" filter="url(#n)"/></svg>';
    var uri = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
    document.documentElement.style.setProperty('--mn-grain-uri', uri);
  }

  /* ---------- Survol vignette projet (nom qui apparaît) ---------- */
  function initFigureHover() {
    document.querySelectorAll('figure.mn-fig').forEach(function (fig) {
      var box = fig.querySelector('.mn-fig__img');
      if (!box || fig.querySelector('.mn-fig__overlay')) return;
      var title = fig.getAttribute('data-fig-title') || '';
      var tag = fig.getAttribute('data-fig-tag') || '';
      var ov = document.createElement('div');
      ov.className = 'mn-fig__overlay';
      var w = document.createElement('div');
      var t1 = document.createElement('div');
      t1.className = 'mn-fig__overlay-title';
      t1.textContent = title;
      var t2 = document.createElement('div');
      t2.className = 'mn-fig__overlay-tag';
      t2.textContent = tag;
      w.appendChild(t1);
      w.appendChild(t2);
      ov.appendChild(w);
      box.appendChild(ov);
    });
  }

  /* ---------- Comparateur avant / après ---------- */
  function initBeforeAfter() {
    var ba = document.querySelector('[data-ba]');
    if (!ba) return;
    var top = ba.querySelector('[data-ba-top]');
    var line = ba.querySelector('[data-ba-line]');
    // Le rectangle est figé au pointerdown (pas relu à chaque pointermove) :
    // getBoundingClientRect() force un recalcul de layout, coûteux si on
    // l'appelle à chaque frame pendant le glissement.
    var rect = null;
    var pendingX = null;
    var rafId = null;

    function apply() {
      rafId = null;
      if (pendingX === null || !rect) return;
      var p = Math.max(4, Math.min(96, ((pendingX - rect.left) / rect.width) * 100));
      top.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
      line.style.left = p + '%';
    }

    // Une seule écriture DOM par frame, alignée sur le rafraîchissement de
    // l'écran (60 fps) : plusieurs pointermove entre deux frames ne
    // produisent qu'une seule mise à jour, sans jamais prendre de retard.
    function queue(clientX) {
      pendingX = clientX;
      if (rafId === null) {
        rafId = requestAnimationFrame(apply);
      }
    }

    var dragging = false;
    ba.addEventListener('pointerdown', function (e) {
      dragging = true;
      rect = ba.getBoundingClientRect();
      ba.classList.add('is-dragging');
      ba.setPointerCapture(e.pointerId);
      queue(e.clientX);
    });
    ba.addEventListener('pointermove', function (e) {
      if (dragging) queue(e.clientX);
    });
    function stopDrag() {
      dragging = false;
      ba.classList.remove('is-dragging');
    }
    ba.addEventListener('pointerup', stopDrag);
    ba.addEventListener('pointercancel', stopDrag);
  }

  /* ---------- Menu mobile ---------- */
  function initMobileMenu() {
    var burger = document.querySelector('[data-mn-burger]');
    var menu = document.querySelector('[data-mn-mobile-menu]');
    if (!burger || !menu) return;
    var closeBtn = menu.querySelector('[data-mn-close]');
    function open() {
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      burger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
      burger.setAttribute('aria-expanded', 'false');
    }
    burger.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  /* ---------- Formulaire de contact ---------- */
  function initContactForm() {
    var form = document.querySelector('[data-mn-contact-form]');
    if (!form) return;
    var loadedAt = Date.now();
    var successPanel = document.querySelector('[data-mn-contact-success]');
    var errorBox = document.querySelector('[data-mn-contact-error]');
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = '';
      }

      // Piège à robots : champ honeypot rempli, ou soumission trop rapide (<3s)
      var hp = form.querySelector('input[name="site_web"]');
      if (hp && hp.value) return;
      if (Date.now() - loadedAt < 3000) {
        if (errorBox) {
          errorBox.hidden = false;
          errorBox.textContent = 'Merci de patienter quelques secondes avant d’envoyer le formulaire.';
        }
        return;
      }

      var data = new FormData(form);
      data.append('elapsed_ms', String(Date.now() - loadedAt));

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'ENVOI EN COURS…';
      }

      fetch(form.getAttribute('action') || '/api/contact.php', {
        method: 'POST',
        body: data,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
        .then(function (res) {
          return res.json().then(function (json) {
            return { ok: res.ok, json: json };
          });
        })
        .then(function (result) {
          if (result.ok && result.json && result.json.success) {
            form.hidden = true;
            if (successPanel) successPanel.hidden = false;
          } else {
            var msg =
              (result.json && result.json.message) ||
              'Une erreur est survenue. Merci de réessayer ou de nous appeler directement.';
            if (errorBox) {
              errorBox.hidden = false;
              errorBox.textContent = msg;
            }
          }
        })
        .catch(function () {
          if (errorBox) {
            errorBox.hidden = false;
            errorBox.textContent =
              'Impossible d’envoyer le message pour le moment. Merci de réessayer ou de nous appeler directement.';
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.originalText || 'ENVOYER MA DEMANDE';
          }
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPageTransition();
    initGrain();
    initReveals();
    if (document.querySelector('[data-mn-title]')) initTitleReveal();
    initFigureHover();
    initBeforeAfter();
    initMobileMenu();
    initContactForm();
  });
})();
