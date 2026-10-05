/* ==========================================================================
   Alternativa Humus — interacciones
   Sin dependencias: menú, slideshow del hero, texto que aparece al scrollear,
   contadores, carrusel de trabajos y animaciones de entrada.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ Navbar --- */
  (function nav() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var burger = nav.querySelector('.nav__burger');
    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav__links a'));

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    }
    burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.nav__menu a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });

    /* sombra al scrollear + link activo según la sección que se está viendo */
    var targets = links.map(function (a) {
      var id = (a.getAttribute('href') || '').replace('#', '');
      return { a: a, el: document.getElementById(id) };
    }).filter(function (t) { return t.el; });

    function onScroll() {
      nav.classList.toggle('is-scrolled', window.scrollY > 10);
      var line = window.scrollY + window.innerHeight * 0.35;
      var current = targets[0];
      targets.forEach(function (t) {
        if (t.el.getBoundingClientRect().top + window.scrollY <= line) current = t;
      });
      if (window.scrollY < 40) current = targets[0];
      links.forEach(function (a) {
        var on = !!current && a === current.a;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  })();

  /* -------------------------------------------- Slideshow (hero) --------
     Las slides se deslizan hacia la izquierda cada 3 s, en loop infinito:
     la última transición va hacia un clon de la primera y, al terminar,
     se salta sin animación a la primera de verdad. */
  document.querySelectorAll('[data-slideshow]').forEach(function (box) {
    var track = box.querySelector('[data-track]');
    var real = Array.prototype.slice.call(track.children).filter(function (s) { return !s.hasAttribute('data-clone'); });
    var dotsBox = box.querySelector('[data-dots]');
    var interval = parseInt(box.getAttribute('data-interval') || '3000', 10);
    var total = real.length;
    var index = 0;
    var timer;

    if (total < 2) return;

    var dots = real.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Imagen ' + (i + 1));
      b.innerHTML = '<span></span>';
      b.addEventListener('click', function () { go(i); restart(); });
      if (dotsBox) dotsBox.appendChild(b);
      return b;
    });

    function paintDots() {
      var active = index % total;
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === active);
        d.setAttribute('aria-selected', n === active ? 'true' : 'false');
      });
    }
    function place(i, animate) {
      track.classList.toggle('is-instant', !animate);
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      index = i;
      paintDots();
    }
    function go(i) {
      place(i, true);
      /* respaldo por si el navegador no emite transitionend (pestaña en segundo plano) */
      if (i >= total) setTimeout(function () { if (index >= total) place(0, false); }, 1100);
    }
    function next() { go(index + 1); }
    function restart() { clearInterval(timer); if (!reduceMotion) timer = setInterval(next, interval); }

    track.addEventListener('transitionend', function (e) {
      if (e.target !== track || index < total) return;
      /* llegó al clon: volver a la primera sin animar */
      place(0, false);
      void track.offsetWidth;
      track.classList.remove('is-instant');
    });

    place(0, false);
    restart();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(timer); else restart();
    });
  });

  /* ------------------------------------- Texto que se revela al scroll --- */
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var spans = words.map(function (w) {
      var s = document.createElement('span');
      s.textContent = w;
      el.appendChild(s);
      return s;
    });

    function update() {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // 0 cuando el bloque entra por abajo, 1 cuando llegó al 35% superior
      var progress = (vh * 0.9 - rect.top) / (vh * 0.55 + rect.height);
      progress = Math.max(0, Math.min(1, progress));
      var shown = Math.round(progress * spans.length);
      spans.forEach(function (s, i) { s.classList.toggle('is-on', i < shown); });
    }

    if (reduceMotion) {
      spans.forEach(function (s) { s.classList.add('is-on'); });
    } else {
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  });

  /* ------------------------------ Aparición al scrollear (una sola vez) -- */
  var watchers = [];
  function watch(el, cb) { watchers.push({ el: el, cb: cb, done: false }); }
  function checkWatchers() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var pending = false;
    watchers.forEach(function (w) {
      if (w.done) return;
      var r = w.el.getBoundingClientRect();
      /* se activa al entrar en pantalla, y también si ya quedó por encima */
      if (r.top < vh - 40) { w.done = true; w.cb(w.el); }
      else pending = true;
    });
    return pending;
  }
  window.addEventListener('scroll', checkWatchers, { passive: true });
  window.addEventListener('resize', checkWatchers);
  window.addEventListener('load', checkWatchers);

  /* --------------------------------------------------------- Contadores -- */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';

    if (reduceMotion) { el.textContent = target + suffix; return; }

    watch(el, function () {
      var duration = 1600;
      var start = Date.now();
      var tick = setInterval(function () {
        var t = Math.min(1, (Date.now() - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t >= 1) clearInterval(tick);
      }, 16);
    });
  });

  /* ------------------------------------------- Carrusel de trabajos ------
     Loop infinito: un punto por trabajo (15). Se clonan al final las primeras
     tarjetas visibles; al llegar a los clones se salta sin animar al principio. */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('[data-track]');
    var slides = Array.prototype.slice.call(track.children);
    var total = slides.length;
    var dotsBox = root.querySelector('[data-dots]');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var interval = parseInt(root.getAttribute('data-interval') || '5000', 10);
    var index = 0;
    var timer;

    /* clones de las primeras tarjetas (hasta 2 visibles a la vez) */
    slides.slice(0, 2).forEach(function (s) {
      var c = s.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });

    function step() { return slides[0].getBoundingClientRect().width + 10; /* ancho + gap */ }

    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Trabajo ' + (i + 1));
      b.innerHTML = '<span></span>';
      b.addEventListener('click', function () { go(i); restart(); });
      if (dotsBox) dotsBox.appendChild(b);
      return b;
    });

    function paintDots() {
      var active = ((index % total) + total) % total;
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === active);
        d.setAttribute('aria-selected', n === active ? 'true' : 'false');
      });
    }
    function place(i, animate) {
      track.classList.toggle('is-instant', !animate);
      track.style.transform = 'translateX(' + (-i * step()) + 'px)';
      index = i;
      paintDots();
    }
    function go(i) {
      if (i < 0) { place(total, false); void track.offsetWidth; i = total - 1; }
      place(i, true);
      /* respaldo por si no llega transitionend (pestaña en segundo plano) */
      if (i >= total) setTimeout(function () { if (index >= total) place(0, false); }, 900);
    }
    function restart() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { go(index + 1); }, interval); }

    track.addEventListener('transitionend', function (e) {
      if (e.target !== track || index < total) return;
      place(0, false);
      void track.offsetWidth;
      track.classList.remove('is-instant');
    });

    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });

    /* Swipe en touch */
    var startX = null;
    root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      startX = null;
      restart();
    });

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { place(index >= total ? 0 : index, false); }, 150);
    });

    place(0, false);
    restart();
  });

  /* ------------------------------------------------ Servicios (touch) ----
     Con mouse la tarjeta gira por :hover (CSS). En pantallas táctiles no hay
     hover: tocar una tarjeta la gira, volver a tocarla la devuelve, y tocar en
     cualquier otro lado cierra la que esté abierta. Solo una abierta a la vez. */
  (function servicios() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-servicio]'));
    if (!cards.length) return;
    var canHover = window.matchMedia('(hover: hover)');

    document.addEventListener('click', function (e) {
      if (canHover.matches) return;
      var hit = e.target.closest ? e.target.closest('[data-servicio]') : null;
      cards.forEach(function (card) {
        card.classList.toggle('is-expanded', card === hit && !card.classList.contains('is-expanded'));
      });
    });
  })();

  /* ------------------------------------------------- Pasos: tooltip "i" ----
     Con mouse el texto aparece por :hover sobre la i (CSS). En touch se
     muestra al tocar la i y se oculta al volver a tocarla o al tocar afuera. */
  (function pasos() {
    var pasos = Array.prototype.slice.call(document.querySelectorAll('.paso'));
    if (!pasos.length) return;
    var canHover = window.matchMedia('(hover: hover)');

    document.addEventListener('click', function (e) {
      if (canHover.matches) return;
      var btn = e.target.closest ? e.target.closest('.paso__info') : null;
      var hit = btn ? btn.closest('.paso') : null;
      pasos.forEach(function (p) {
        p.classList.toggle('is-info-open', p === hit && !p.classList.contains('is-info-open'));
      });
    });
  })();

  /* ------------------------------------------------------- WhatsApp ----- */
  (function whatsapp() {
    var wrap = document.querySelector('[data-whatsapp]');
    if (!wrap) return;
    var closeBtn = wrap.querySelector('[data-whatsapp-close]');
    if (sessionStorage.getItem('ah-whatsapp-dismissed') === '1') wrap.classList.add('is-dismissed');
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      wrap.classList.add('is-dismissed');
      try { sessionStorage.setItem('ah-whatsapp-dismissed', '1'); } catch (err) {}
    });
  })();

  /* ------------------------------------------ Animaciones de entrada ---- */
  (function fadeUp() {
    var nodes = document.querySelectorAll('.fade-up');
    if (!nodes.length) return;

    if (reduceMotion) {
      nodes.forEach(function (n) { n.classList.add('is-visible'); });
      return;
    }

    nodes.forEach(function (n) {
      watch(n, function (el) { el.classList.add('is-visible'); });
    });
  })();

  /* Primer chequeo (por si la página carga ya scrolleada) */
  checkWatchers();
  setTimeout(checkWatchers, 100);
})();
