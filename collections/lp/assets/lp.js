/* Collections concept: ad landing page runtime. The view (prospecting / retargeting) and the hook are set on <html>
   by the inline head script before first paint; this file carries the visitor's UTM parameters onto every store
   link and runs the colour / size picker. Nothing is added to a cart: buying happens on shop.ranchers.com. */
(function () {
  var d = document;
  var cfg = JSON.parse(d.getElementById('lp-data').textContent);
  var q = new URLSearchParams(location.search), carry = [];
  q.forEach(function (v, k) { if (/^utm_/i.test(k) || /^(fbclid|ttclid|gclid)$/i.test(k)) carry.push([k, v]); });

  function link(base, variant) {
    var u = new URL(base);
    if (variant) u.searchParams.set('variant', variant);
    carry.forEach(function (p) { u.searchParams.set(p[0], p[1]); });
    return u.toString();
  }
  function all(sel) { return [].slice.call(d.querySelectorAll(sel)); }

  // every store link carries the UTMs forward (and its variant, if it has one)
  all('a[data-base]').forEach(function (a) { a.href = link(a.getAttribute('data-base'), a.getAttribute('data-variant')); });

  if (!cfg.groups) return;

  var st = { g: 0, c: 0, s: null };
  var heroImg = d.getElementById('hero-img'), pickImg = d.getElementById('pick-img');

  function render() {
    var G = cfg.groups[st.g], W = G.ways[st.c];
    all('[data-seg]').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-seg') === st.g ? 'true' : 'false'); });
    all('.chip').forEach(function (b) {
      var g = +b.getAttribute('data-g'), c = +b.getAttribute('data-c');
      b.hidden = g !== st.g;
      b.setAttribute('aria-pressed', g === st.g && c === st.c ? 'true' : 'false');
    });
    all('.size').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-s') === st.s ? 'true' : 'false'); });
    if (heroImg) {
      heroImg.src = W.hero1400; heroImg.srcset = W.hero800 + ' 800w, ' + W.hero1400 + ' 1400w';
      heroImg.alt = W.alt;
    }
    if (pickImg) { pickImg.src = W.card; pickImg.alt = W.alt; }
    var sizes = G.sizes || [];
    var key = sizes.length ? (st.s && W.ids[st.s] ? st.s : sizes[0]) : '_';
    var href = link(G.url, W.ids[key]);
    all('a[data-cta]').forEach(function (a) { a.href = href; });
    all('[data-colour-name]').forEach(function (el) { el.textContent = G.label + ' · ' + W.colour; });
    all('[data-helper]').forEach(function (el) {
      el.textContent = !sizes.length ? W.colour + ' · opens on shop.ranchers.com'
        : st.s ? W.colour + ', size ' + st.s + ' · carried to the store'
        : W.colour + ' · pick a size to carry it to the store';
    });
  }

  all('[data-seg]').forEach(function (b) {
    b.addEventListener('click', function () { st.g = +b.getAttribute('data-seg'); st.c = 0; render(); });
  });
  all('.chip').forEach(function (b) {
    b.addEventListener('click', function () { st.g = +b.getAttribute('data-g'); st.c = +b.getAttribute('data-c'); render(); });
  });
  all('.size').forEach(function (b) {
    b.addEventListener('click', function () { var s = b.getAttribute('data-s'); st.s = st.s === s ? null : s; render(); });
  });
  render();
})();
