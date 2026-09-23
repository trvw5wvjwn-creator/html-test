/* rjvideo.js v20260923a — temin „Mali video sa strane" (.popupVideoContainer, autoplay=1) svira tek na klik (Ivin nalog 23.09.2026.).
   Tag ide u sadržaj SAMO na artiklima koji imaju mali video (mali_video.json). Skripta se izvrši prije nego parser dođe do
   playera (on je pri dnu body-ja), pa MutationObserver uhvati iframe čim se pojavi: src → data-rjv, src=about:blank,
   preko njega sličica videa (i.ytimg.com hqdefault) s gumbom ▶; klik/Enter vraća src (bez mute=1 — kupac je sam pokrenuo).
   YouTube player (~1 MB) i stream se ne učitavaju dok kupac ne klikne. Temini gumbi (povećaj/minimiziraj) rade kao i prije. */
(function () {
  var D = document; if (window.__rjvideo) return; window.__rjvideo = 1;
  function facade(f) {
    if (f.getAttribute('data-rjv')) return;
    var src = f.getAttribute('src') || '', m = src.match(/embed\/([\w-]+)/); if (!m) return;
    f.setAttribute('data-rjv', src); f.setAttribute('src', 'about:blank');
    var w = f.parentNode; if (getComputedStyle(w).position === 'static') w.style.position = 'relative';
    var c = D.createElement('div'); c.className = 'rjv-cover'; c.setAttribute('role', 'button'); c.tabIndex = 0;
    c.setAttribute('aria-label', 'Pokreni video'); c.title = 'Pokreni video';
    c.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;cursor:pointer;background:#000 url(https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg) center/cover no-repeat;z-index:2';
    c.innerHTML = '<span style="position:absolute;left:50%;top:50%;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true"><path fill="#fff" d="M6 3l11 7-11 7z"/></svg></span>';
    function play() { f.setAttribute('src', src.replace(/([?&])mute=1&?/, '$1').replace(/[?&]$/, '')); if (c.parentNode) c.parentNode.removeChild(c); }
    c.addEventListener('click', play);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
    w.appendChild(c);
  }
  function scan() { var f = D.querySelector('.popupVideoContainer iframe[src*="youtube"]'); if (f) facade(f); return !!f; }
  if (!scan()) {
    var mo = new MutationObserver(function () { if (scan()) mo.disconnect(); });
    mo.observe(D.documentElement, { childList: true, subtree: true });
    D.addEventListener('DOMContentLoaded', function () { scan(); setTimeout(function () { mo.disconnect(); }, 5000); });
  }
})();
