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

    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    nav.querySelectorAll('.nav__menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  })();

  /* -------------------------------------------- Slideshow (hero) -------- */
  document.querySelectorAll('[data-slideshow]').forEach(function (box) {
    var slides = Array.prototype.slice.call(box.querySelectorAll('.hero__slide'));
    var dotsBox = box.querySelector('[data-dots]');
    var interval = parseInt(box.getAttribute('data-interval') || '3000', 10);
    var index = 0;
    var timer;

    if (slides.length < 2) return;

    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Imagen ' + (i + 1));
      b.innerHTML = '<span></span>';
      b.addEventListener('click', function () { go(i); restart(); });
      if (dotsBox) dotsBox.appendChild(b);
      return b;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === index);
        d.setAttribute('aria-selected', n === index ? 'true' : 'false');
      });
    }
    function next() { go(index + 1); }
    function restart() { clearInterval(timer); if (!reduceMotion) timer = setInterval(next, interval); }

    go(0);
    restart();
    box.addEventListener('mouseenter', function () { clearInterval(timer); });
    box.addEventListener('mouseleave', restart);
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

  /* ------------------------------------------- Carrusel de trabajos ------ */
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('[data-track]');
    var slides = Array.prototype.slice.call(track.children);
    var dotsBox = root.querySelector('[data-dots]');
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var interval = parseInt(root.getAttribute('data-interval') || '5000', 10);
    var index = 0;
    var timer;
    var dots = [];

    function step() { return slides[0].getBoundingClientRect().width + 10; /* ancho + gap */ }
    function perView() {
      var visible = root.querySelector('.carousel__viewport').getBoundingClientRect().width;
      return Math.max(1, Math.floor((visible + 10) / step()));
    }
    function pages() { return Math.max(1, slides.length - perView() + 1); }

    function buildDots() {
      if (!dotsBox) return;
      dotsBox.innerHTML = '';
      dots = [];
      for (var i = 0; i < pages(); i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-label', 'Trabajo ' + (i + 1));
          b.innerHTML = '<span></span>';
          b.addEventListener('click', function () { go(i); restart(); });
          dotsBox.appendChild(b);
          dots.push(b);
        })(i);
      }
    }

    function go(i) {
      var total = pages();
      index = (i + total) % total;
      track.style.transform = 'translateX(' + (-index * step()) + 'px)';
      dots.forEach(function (d, n) {
        d.classList.toggle('is-active', n === index);
        d.setAttribute('aria-selected', n === index ? 'true' : 'false');
      });
    }

    function restart() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { go(index + 1); }, interval); }

    if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(index + 1); restart(); });

    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', restart);

    /* Arrastre / swipe */
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
      resizeTimer = setTimeout(function () { buildDots(); go(Math.min(index, pages() - 1)); }, 150);
    });

    buildDots();
    go(0);
    restart();
  });

  /* ------------------------------------------------ Servicios (touch) ----
     Con mouse la tarjeta se expande por :hover (CSS). En pantallas táctiles
     no hay hover: tocar una tarjeta la expande, tocar en cualquier otro lado
     la vuelve a cerrar (mismo comportamiento que el sitio original). */
  (function servicios() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-servicio]'));
    if (!cards.length) return;
    var canHover = window.matchMedia('(hover: hover)');

    document.addEventListener('click', function (e) {
      if (canHover.matches) return;
      var hit = e.target.closest ? e.target.closest('[data-servicio]') : null;
      cards.forEach(function (card) {
        card.classList.toggle('is-expanded', card === hit);
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
