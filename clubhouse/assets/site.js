/* Clubhouse (Option 06): shared behaviour for the homepage, product pages and ad landing pages.
   Shelves (arrows + swipe), the menu drawer, the product gallery (colour swatches swap the five renders and the 360,
   which loads only when its tile is shown), size chips, the store CTA (variant + the visitor's UTM parameters) and the
   UI-only newsletter. Reduced motion: no smooth scrolling and no autoplay; the 360 waits for a tap. */
(function () {
  var d = document, h = d.documentElement;
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function rm() { return !!(mq && mq.matches); }
  function reducedNow() { return !!(mq && mq.matches); }
  function syncRm() { h.classList.toggle('rm', rm()); }
  syncRm();
  if (mq) { if (mq.addEventListener) mq.addEventListener('change', syncRm); else if (mq.addListener) mq.addListener(syncRm); }
  function noop() {}

  /* visitor's UTM parameters ride along on store links (landing pages) */
  var q = null; try { q = new URLSearchParams(location.search); } catch (e) { q = null; }
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  function withUtm(href) {
    if (!q) return href;
    try { var u = new URL(href); KEYS.forEach(function (k) { var v = q.get(k); if (v) u.searchParams.set(k, v); }); return u.toString(); } catch (e) { return href; }
  }
  $$('a[data-utm]').forEach(function (a) { a.setAttribute('data-href', a.getAttribute('href')); a.href = withUtm(a.getAttribute('href')); });

  /* announcement bar */
  var annX = $('.ann-x');
  if (annX) annX.addEventListener('click', function () { var a = $('#ann'); if (a) a.hidden = true; });

  /* menu drawer */
  var drawer = $('#drawer'), menuBtn = $('.menu-btn');
  if (drawer && menuBtn) {
    var closeT = null;
    var open = function () {
      clearTimeout(closeT); drawer.hidden = false; void drawer.offsetWidth; drawer.classList.add('open');
      menuBtn.setAttribute('aria-expanded', 'true'); d.body.style.overflow = 'hidden';
      var c = $('[data-close].icon-btn', drawer); if (c) c.focus();
    };
    var close = function () {
      drawer.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); d.body.style.overflow = '';
      closeT = setTimeout(function () { drawer.hidden = true; }, rm() ? 0 : 260); menuBtn.focus();
    };
    menuBtn.addEventListener('click', open);
    $$('[data-close]', drawer).forEach(function (b) { b.addEventListener('click', close); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('open')) close(); });
  }

  /* rotating hero: autoplay every data-interval ms with a crossfade; pauses on hover, on focus, when the tab is hidden,
     when the hero is off screen and on the pause button; reduced motion = no autoplay. Only the shown slide is reachable
     (inert on the others). Slides after the first load their images after the page has loaded (or when shown). */
  var rot = $('.hero-rot');
  if (rot) {
    var slides = $$('.slide', rot), ticks = $$('.hc-tick', rot), pbtn = $('.hc-pause', rot), live = $('.slides', rot);
    var iv = Number(rot.getAttribute('data-interval')) || 5000, curS = 0, timer = 0;
    var st = { hover: false, focus: false, hidden: !!d.hidden, off: false, user: false };
    var loadSlide = function (s) {
      $$('[data-srcset]', s).forEach(function (el) { el.setAttribute('srcset', el.getAttribute('data-srcset')); el.removeAttribute('data-srcset'); });
      $$('img[data-src]', s).forEach(function (el) { el.setAttribute('src', el.getAttribute('data-src')); el.removeAttribute('data-src'); });
    };
    var isPaused = function () { return st.hover || st.focus || st.hidden || st.off || st.user || reducedNow(); };
    var sync = function () {
      var p = isPaused();
      rot.classList.toggle('is-paused', p); rot.classList.toggle('is-user-paused', st.user);
      if (pbtn) pbtn.setAttribute('aria-label', st.user ? 'Play slideshow' : 'Pause slideshow');
      if (live) live.setAttribute('aria-live', p ? 'polite' : 'off');
      clearTimeout(timer);
      if (!p) timer = setTimeout(function () { go(curS + 1); }, iv);
    };
    var go = function (i) {
      i = (i + slides.length) % slides.length;
      loadSlide(slides[i]);
      slides.forEach(function (s, k) { var on = k === i; s.classList.toggle('is-active', on); if (on) s.removeAttribute('inert'); else s.setAttribute('inert', ''); });
      ticks.forEach(function (t, k) { if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
      curS = i; loadSlide(slides[(i + 1) % slides.length]); sync();
    };
    $$('.hc-arr', rot).forEach(function (b) { b.addEventListener('click', function () { go(curS + Number(b.getAttribute('data-dir'))); }); });
    ticks.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
    if (pbtn) pbtn.addEventListener('click', function () { st.user = !st.user; sync(); });
    rot.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') { st.hover = true; sync(); } });
    rot.addEventListener('pointerleave', function () { st.hover = false; sync(); });
    rot.addEventListener('focusin', function () { st.focus = true; sync(); });
    rot.addEventListener('focusout', function (e) { if (!e.relatedTarget || !rot.contains(e.relatedTarget)) { st.focus = false; sync(); } });
    d.addEventListener('visibilitychange', function () { st.hidden = !!d.hidden; sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { st.off = !es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(rot);
    var later = function () { setTimeout(function () { slides.forEach(loadSlide); }, 600); };
    if (d.readyState === 'complete') later(); else window.addEventListener('load', later);
    if (mq) { if (mq.addEventListener) mq.addEventListener('change', sync); else if (mq.addListener) mq.addListener(sync); }
    sync();
  }

  /* shelves: arrows step one card; the track itself swipes and scroll-snaps */
  $$('.shelf').forEach(function (sec) {
    var track = $('.track', sec), prev = $('.arr[data-dir="-1"]', sec), next = $('.arr[data-dir="1"]', sec), wrap = $('.arrows', sec);
    if (!track || !prev || !next) return;
    function step() { var c = track.children[0]; if (!c) return 300; var g = parseFloat(getComputedStyle(track).columnGap) || 0; return c.getBoundingClientRect().width + g; }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max;
      if (wrap) wrap.style.visibility = max <= 0 ? 'hidden' : '';
    }
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () { track.scrollBy({ left: Number(b.getAttribute('data-dir')) * step(), behavior: rm() ? 'auto' : 'smooth' }); });
    });
    var raf = 0;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* product gallery, swatches, sizes and the store CTA (product pages and the product landing pages) */
  var cfgEl = d.getElementById('pdp-cfg');
  if (cfgEl) {
    var cfg = JSON.parse(cfgEl.textContent), byId = {}, state = { p: cfg.products[0].id };
    cfg.products.forEach(function (p) { byId[p.id] = p; p.size = null; });
    var qc = q && q.get('color');
    if (qc) cfg.products.forEach(function (p) { p.colors.forEach(function (c) { if (c.name.toLowerCase() === qc.toLowerCase()) p.sel = c.name; }); });
    var cur = function () { return byId[state.p]; };
    var col = function (p) { return p.colors.filter(function (c) { return c.name === p.sel; })[0] || p.colors[0]; };
    var video = $('.shot-360 video'), playBtn = $('.shot-360 .play'), vidSeen = false;

    var ctaUrl = function (p, c) {
      if (p.nvar <= 1) return p.url;
      var needSize = p.choices.length > 0;
      if (needSize && !p.size) return p.url;
      var id = p.variants[(c.key || '') + '|' + (needSize ? p.size.toLowerCase() : '')];
      return id ? p.url + '?variant=' + id : p.url;
    };
    var loadVideo = function (andPlay) {
      if (!video) return;
      var src = video.getAttribute('data-src');
      if (video.getAttribute('src') !== src) video.setAttribute('src', src);
      if (andPlay) { var pr = video.play(); if (pr && pr.catch) pr.catch(noop); }
    };
    var render = function () {
      var p = cur(), c = col(p);
      $$('[data-strip]').forEach(function (img) {
        if (img.getAttribute('src') !== c.strip) img.setAttribute('src', c.strip);
        img.alt = p.title + ', ' + c.name + ', ' + img.getAttribute('data-angle');
      });
      if (video) {
        video.setAttribute('aria-label', '360 degree spin of the ' + p.title + ', ' + c.name);
        if (video.getAttribute('data-src') !== c.mp4) {
          var had = !!video.getAttribute('src'), playing = had && !video.paused;
          video.setAttribute('poster', c.poster); video.setAttribute('data-src', c.mp4);
          if (had) { video.removeAttribute('src'); video.load(); loadVideo(playing); }
        }
      }
      $$('[data-p-title]').forEach(function (el) { el.textContent = p.title; });
      $$('[data-p-price]').forEach(function (el) { el.textContent = p.price; });
      $$('[data-color-name]').forEach(function (el) { el.textContent = c.name; });
      $$('.sws').forEach(function (g) { g.hidden = g.getAttribute('data-for') !== p.id; });
      $$('.sw').forEach(function (b) {
        if (b.getAttribute('data-for') !== p.id) return;
        var on = b.getAttribute('data-c') === p.sel; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
      });
      $$('.opt-size').forEach(function (g) { g.hidden = g.getAttribute('data-for') !== p.id; });
      $$('.sz').forEach(function (b, k) {
        if (b.getAttribute('data-for') !== p.id) return;
        var on = p.size !== null && b.getAttribute('data-s') === p.size;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      $$('.cuts button').forEach(function (b) { var on = b.getAttribute('data-p') === p.id; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
      $$('.facts[data-for]').forEach(function (f) { f.hidden = f.getAttribute('data-for') !== p.id; });
      var u = ctaUrl(p, c);
      $$('a[data-cta]').forEach(function (a) { if (cfg.perProduct || !a.getAttribute('data-fixed')) { a.setAttribute('data-href', u); a.href = withUtm(u); } });
    };
    var radioKeys = function (list, b, e) {
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(e.key) < 0) return;
      e.preventDefault();
      var k = list.indexOf(b), o = list[(k + ((e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : list.length - 1)) % list.length];
      o.click(); o.focus();
    };
    $$('.cuts button').forEach(function (b, k, all) {
      b.addEventListener('click', function () { state.p = b.getAttribute('data-p'); render(); });
      b.addEventListener('keydown', function (e) { radioKeys(all, b, e); });
    });
    $$('.sw').forEach(function (b) {
      b.addEventListener('click', function () { byId[b.getAttribute('data-for')].sel = b.getAttribute('data-c'); render(); });
      b.addEventListener('keydown', function (e) { radioKeys($$('.sw[data-for="' + b.getAttribute('data-for') + '"]'), b, e); });
    });
    $$('.sz').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = byId[b.getAttribute('data-for')], s = b.getAttribute('data-s');
        p.size = p.size === s ? null : s; render();
      });
    });

    /* phone gallery: counter and dots follow the swipe */
    var gt = $('.gal-track'), dots = $$('.gdot'), nEl = $('[data-gal-n]');
    if (gt) {
      var idx = function () { return Math.round(gt.scrollLeft / Math.max(1, gt.clientWidth)); };
      var syncDots = function () {
        var i = idx(); if (nEl) nEl.textContent = String(i + 1);
        dots.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      };
      var gr = 0;
      gt.addEventListener('scroll', function () { cancelAnimationFrame(gr); gr = requestAnimationFrame(syncDots); }, { passive: true });
      dots.forEach(function (b, k) { b.addEventListener('click', function () { gt.scrollTo({ left: k * gt.clientWidth, behavior: rm() ? 'auto' : 'smooth' }); }); });
    }

    /* 360: the mp4 loads only when its tile is on screen; it autoplays unless reduced motion is on */
    if (video) {
      var showPlay = function (on) { if (playBtn) playBtn.hidden = !on; };
      if (playBtn) playBtn.addEventListener('click', function () { vidSeen = true; loadVideo(true); showPlay(false); });
      video.addEventListener('click', function () { if (rm()) { if (video.paused) loadVideo(true); else video.pause(); } });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) {
              if (rm()) { if (!video.getAttribute('src')) showPlay(true); }
              else loadVideo(true);
            } else if (!video.paused) video.pause();
          });
        }, { threshold: 0.55 }).observe(video.parentNode);
      } else if (!rm()) loadVideo(true);
    }
    render();
  }

  /* newsletter: a concept page, so nothing is sent anywhere */
  var news = $('#news');
  if (news) news.addEventListener('submit', function (e) {
    e.preventDefault();
    var em = $('#news-email'), msg = $('#news-msg');
    if (!em.value || !em.checkValidity()) { msg.textContent = 'Enter an email address to sign up.'; em.focus(); return; }
    msg.textContent = news.getAttribute('data-sent');
  });
})();
