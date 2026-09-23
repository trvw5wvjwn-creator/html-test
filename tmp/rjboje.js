/* rjboje.js v3 (20260923i) — kutije boja istog modela uz „Odaberi boju:" na stranici bicikla / e-bicikla.
   Izvor: /user_files/rjboje.json v2 (gradi boje_build.py iz skena javnih stranica + prodaje po šifri iz xMPWEB):
     g[wid] = redoslijed boja modela (po prodaji, fiksan za sve boje modela → kutije se ne premještaju),
     a[wid] = {h: url, n: naziv, c: [temine hex], x: hex iz fotke, y: druga boja (mix) kad tema ima 2 boje — iz fotke, rezerva c[1], s: 1 ako postoji izrez /user_files/rjboja-<wid><_suf>.webp, q: prodano}; _suf = '' (čista boja) ili '-w' (širi izrez s logom).
   Kutija = izrez donje cijevi iz glavne fotografije (Ivo 23.09.: „uzmeš boju baš sa bicikla"); bez izreza → temini hex-ovi.
   Kad model ima grupu: temin .colorBtn se SAKRIJE (ostaje u DOM-u — tema po broju .colorBtn učitava veličine) i cijeli red
   crtamo mi, na istom mjestu; trenutačna boja ima kvačicu kao temina. Bez grupe: stari način — temin kvadrat ostaje,
   uzorci iz taba „Druga boja možda?" idu iza njega. Bez naziva ispod kutija (naziv u title/aria-label).
   Boja se sakrije samo kad izvor izričito kaže: rjkat a:0 ili rjboje _mrtvi. Kupnja ostaje po artiklu (1 bicikl = 1 boja).
   Uključuje se tagom na kraju sadržaja taba: <script src="/user_files/rjboje.js?v=…"></script> */
(function () {
  var D = document, W = window, MAP = {};
  if (W.__rjboje) return; W.__rjboje = 1;
  /* i: bez bljeska teminog kvadrata na osvježavanju — ako tag nosi data-g="1" (artikl ima grupu, postavlja sweep iz JSON-a)
     ili je grupa zapamćena u localStorage, temin .colorBtn se sakrije ODMAH (sinkrono, prije dohvata JSON-a); prostor reda se drži
     preko min-height. Ako JSON poslije kaže da grupe nema, stil se makne. */
  var CS = D.currentScript, LSK = 'rjboje_g';
  function lsHas(id) { try { return (localStorage.getItem(LSK) || '').split(',').indexOf(id) > -1; } catch (e) { return false; } }
  function lsAdd(id) { try { if (!lsHas(id)) localStorage.setItem(LSK, ((localStorage.getItem(LSK) || '') + ',' + id).replace(/^,/, '')); } catch (e) {} }
  function preHide(on) {
    var st = $('#rjboje-pre');
    if (!on) { if (st) st.parentNode.removeChild(st); return; }
    if (st) return; st = D.createElement('style'); st.id = 'rjboje-pre';
    st.textContent = '.colorsBtnsCtn{min-height:48px}.colorsBtnsCtn>.colorBtn{display:none!important}';
    (D.head || D.documentElement).appendChild(st);
  }
  var me0 = curId();
  if ((CS && CS.getAttribute('data-g') === '1') || (me0 && lsHas(me0))) preHide(true);
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || D).querySelectorAll(s)); }
  function css() {
    if ($('#rjboje-css2')) return;
    var st = D.createElement('style'); st.id = 'rjboje-css2';
    st.textContent = '.colorsBtnsCtn .rjb-it{position:relative;display:inline-block;vertical-align:top;margin-right:10px;border-radius:.3rem;padding:.2rem;border:1px solid #aaa;background:#fff;text-decoration:none!important;line-height:0}' +
      '.colorsBtnsCtn .rjb-it svg,.colorsBtnsCtn .rjb-it img{display:block;width:40px;height:40px;border-radius:2px}' +
      '.colorsBtnsCtn .rjb-it .rjb-acc{position:absolute;left:.2rem;top:.2rem;pointer-events:none}' +
      '.colorsBtnsCtn a.rjb-it:hover,.colorsBtnsCtn a.rjb-it:focus-visible{border-color:#111}' +
      '.colorsBtnsCtn .rjb-it.is-cur{border-color:#777}' +
      '.colorsBtnsCtn .rjb-it.is-cur:after{content:"";position:absolute;left:0;bottom:0;width:16px;height:16px;background:#ddd url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27><path fill=%27none%27 stroke=%27%230c7400%27 stroke-width=%272%27 d=%27M3 8.5l3 3 7-7%27/></svg>") center/12px no-repeat}';
    D.head.appendChild(st);
  }
  function cards() {
    var sec = $$('.rjs-cross').filter(function (c) { var h = $('.rjs-cross-head h3', c); return h && /drug[au] boj/i.test(h.textContent); })[0];
    if (!sec) return [];
    return $$('.rjs-cross-card', sec).map(function (a) {
      var nm = $('.rjs-cross-name', a);
      var href = a.getAttribute('href') || '', id = (href.match(/-(\d+)\/?$/) || [])[1];
      return { href: href, id: id, name: nm ? nm.textContent.trim() : '' };
    }).filter(function (c) { return c.href && c.id; });
  }
  function curId() { var c = $('.productDetail[data-productId],.bicycleDetail[data-productId]'); return c ? c.getAttribute('data-productId') : ''; }
  function short(n) { return (n || '').replace(/\s*\/.*$/, '').replace(/\s*\(?\b(19|20)\d\d\)?/g, '').replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function inner(id, rec) {
    if (rec && rec.s) return '<img src="/user_files/rjboja-' + id + (MAP._suf || '') + '.webp" width="40" height="40" alt="" loading="eager">' +
      (rec.y ? '<svg class="rjb-acc" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><polygon fill="' + rec.y + '" points="12,40 40,12 40,40"/><line x1="12" y1="40" x2="40" y2="12" stroke="#fff" stroke-width="2"/></svg>' : '');
    var cols = (rec && rec.c && rec.c.length) ? rec.c : (rec && rec.x ? [rec.x] : ['#eee']);
    if (cols.length > 1) return '<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><polygon fill="' + cols[0] + '" points="3,3 31,3 3,31"/><polygon fill="' + cols[1] + '" points="9,37 37,9 37,37"/></svg>';
    return '<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><rect fill="' + cols[0] + '" x="3" y="3" width="34" height="34"/></svg>';
  }
  function item(id, rec, href, name, cur) {
    var el = D.createElement(cur ? 'span' : 'a'); el.className = 'rjb-it' + (cur ? ' is-cur' : '');
    var nm = short(name || (rec && rec.n) || '');
    if (cur) { el.title = nm ? nm + ' (odabrano)' : 'Odabrana boja'; el.setAttribute('aria-current', 'true'); }
    else { el.href = href || (rec && rec.h) || '#'; el.title = nm; el.setAttribute('aria-label', 'Boja ' + nm); }
    el.innerHTML = inner(id, rec); return el;
  }
  function render(list, me, grouped) {
    var boxes = $$('.colorsBtnsCtn');
    if (!boxes.length || !list.length) return false;
    boxes.forEach(function (box) {
      if ($('.rjb-it', box)) return;
      var tb = $('.colorBtn', box);
      if (grouped && tb) tb.style.display = 'none';   /* red crtamo mi, na istom mjestu; element ostaje zbog teme */
      list.forEach(function (c) { box.appendChild(item(c.id, c.rec, c.href, c.name, c.id === me)); });
    });
    return true;
  }
  function go() {
    var me = curId(); if (!me) return;
    var kat = fetch('/user_files/rjkat.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).catch(function () { return null; });
    var map = fetch('/user_files/rjboje.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).catch(function () { return null; });
    Promise.all([kat, map]).then(function (res) {
      if (res[1] && typeof res[1] === 'object') MAP = res[1];
      var a = (res[0] && res[0].artikli) || {}, mrtvi = MAP._mrtvi || [], A = MAP.a || {};
      var dead = function (id) { return (a[id] && a[id].a === 0) || mrtvi.indexOf(id) > -1; };
      var list, grouped = false;
      if (MAP.g && MAP.g[me] && MAP.g[me].length > 1) {
        grouped = true; lsAdd(me);
        list = MAP.g[me].filter(function (id) { return id === me || !dead(id); }).map(function (id) { return { id: id, rec: A[id] }; });
      } else {
        list = cards().filter(function (c) { return c.id !== me && !dead(c.id); }).map(function (c) { return { id: c.id, rec: A[c.id], href: c.href, name: c.name }; });
      }
      if (!grouped) preHide(false);
      if (!list.length) return;
      css();
      if (!render(list, me, grouped)) { var n = 0, iv = setInterval(function () { if (render(list, me, grouped) || ++n > 20) clearInterval(iv); }, 500); }
      var mo = new MutationObserver(function () { render(list, me, grouped); });
      var col = $('.product_detail_price_column'); if (col) mo.observe(col, { childList: true, subtree: true });
    });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', go); else go();
})();
