// Pomoćne funkcije za objavu blogova iz admin kartice rog-joma.hr (/rj_admin/v2/...).
// Učitavanje: const s = await rjIzGitaTekst(...) ; (0, eval)(s)  — ili zalijepiti cijelu datoteku u javascript_tool.
(function () {
  const W = window;
  const C = '/rj_admin/v2/elFinder/php/connector_rj.php';
  const T = 'l1_ZWRpdG9yaWFsX3NsaWtl'; // user_files/editorial_slike
  W.rjSpavaj = ms => new Promise(r => { const w = new Worker(URL.createObjectURL(new Blob(['onmessage=e=>setTimeout(()=>postMessage(1),e.data)']))); w.onmessage = () => { w.terminate(); r(); }; w.postMessage(ms + 700); });
  W.rjGitBuf = async function (sha, path, hash) {
    const r = await fetch('https://raw.githubusercontent.com/trvw5wvjwn-creator/html-test/' + sha + '/' + path, { cache: 'no-store' });
    if (!r.ok) throw 'github ' + r.status;
    const buf = await r.arrayBuffer();
    const h = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map(b => b.toString(16).padStart(2, '0')).join('');
    if (h !== hash) throw 'sha256 ' + path;
    return buf;
  };
  W.rjIzGita = async (sha, path, hash) => new TextDecoder().decode(await W.rjGitBuf(sha, path, hash));
  W.rjUp = async function (nm, blob) {
    const fd = new FormData(); fd.set('cmd', 'upload'); fd.set('target', T); fd.set('overwrite', '1');
    fd.append('upload[]', new File([blob], nm, { type: blob.type || 'image/webp' }));
    const r = await (await fetch(C, { method: 'POST', body: fd })).json();
    const h = await fetch('/user_files/editorial_slike/' + nm, { method: 'HEAD', cache: 'no-store' });
    return { kb: Math.round(blob.size / 1024), err: r.error || null, head: h.status };
  };
  W.rjKopija = async function (nm, src) {
    const b = await (await fetch(src, { cache: 'no-store' })).blob();
    const im = await createImageBitmap(b); const k = Math.min(1, 1600 / im.width);
    const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const o = await new Promise(r => c.toBlob(r, 'image/webp', 0.86));
    return { dim: c.width + 'x' + c.height, up: await W.rjUp(nm, o) };
  };
  W.rjCld = async function (nm, id) {
    const b = await (await fetch('https://media.trekbikes.com/image/upload/w_1600,f_webp,q_82/' + id)).blob();
    const im = await createImageBitmap(b);
    return { dim: im.width + 'x' + im.height, up: await W.rjUp(nm, b) };
  };
  W.rjModel = async function (id, p) {
    const b = await (await fetch('/fajlovi/artikli_slike/' + p, { cache: 'no-store' })).blob();
    const im = await createImageBitmap(b);
    const c = document.createElement('canvas'); c.width = 1000; c.height = Math.round(1000 * im.height / im.width);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const o = await new Promise(r => c.toBlob(r, 'image/webp', 0.86));
    return { dim: c.width + 'x' + c.height, up: await W.rjUp('blog-model-' + id + '.webp', o) };
  };
  W.rjSlikaGit = async (nm, sha, path, hash) => ({ up: await W.rjUp(nm, new Blob([await W.rjGitBuf(sha, path, hash)], { type: 'image/webp' })) });
  W.rjSlike = async function (lista, st) {
    for (const [nm, iz] of lista) {
      try {
        const h = await fetch('/user_files/editorial_slike/' + nm, { method: 'HEAD', cache: 'no-store' });
        if (h.ok) { st.slike.push([nm, 'postoji']); continue; }
        let r;
        if (iz.startsWith('cld:')) r = await W.rjCld(nm, iz.slice(4));
        else if (iz.startsWith('model:')) { const [, id, ...p] = iz.split(':'); r = await W.rjModel(id, p.join(':')); }
        else if (iz.startsWith('rj:')) r = await W.rjKopija(nm, iz.slice(3));
        else if (iz.startsWith('git:')) { const [, sha, path, hash] = iz.split(':'); r = await W.rjSlikaGit(nm, sha, path, hash); }
        else throw 'nepoznat izvor ' + iz.slice(0, 20);
        const h2 = await fetch('/user_files/editorial_slike/' + nm, { method: 'HEAD', cache: 'no-store' });
        st.slike.push([nm, r && r.dim, h2.status]);
        if (h2.status !== 200) st.greske.push('slika ' + nm + ' ' + h2.status);
      } catch (e) { st.greske.push('slika ' + nm + ': ' + e); }
      await W.rjSpavaj(800);
    }
  };
  // ID bloga po slugu iz blogs_list.php (keš)
  W.rjId = function (slug) {
    if (!W.__ids) {
      const x = new XMLHttpRequest(); x.open('GET', 'blogs_list.php', false); x.send();
      const d = new DOMParser().parseFromString(x.responseText, 'text/html'); W.__ids = {};
      for (const tr of d.querySelectorAll('tr')) {
        const a = [...tr.querySelectorAll('a')].map(a => (a.getAttribute('href') || '').match(/blog\.php\?a=edit&i=(\d+)/)).find(Boolean);
        if (!a) continue;
        for (const td of tr.querySelectorAll('td')) { const t = td.textContent.trim(); if (/^[a-z0-9-]+$/.test(t) && t.length > 3) W.__ids[t] = +a[1]; }
      }
    }
    return W.__ids[slug];
  };
  const procitaj = async ID => {
    const t = await (await fetch('blog.php?a=edit&i=' + ID, { cache: 'no-store' })).text();
    const raw = n => { const m = t.match(new RegExp('<textarea[^>]*name="' + n + '"[^>]*>([\\s\\S]*?)</textarea>')); return m ? m[1] : null; };
    const d = new DOMParser().parseFromString(t, 'text/html');
    return { t, raw, d, f: d.querySelector('[name=html_description]').form };
  };
  const kopija = async (kljuc, v) => {
    const db = await new Promise((res, rej) => { const r = indexedDB.open('rjbackup'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    await new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, kljuc); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  };
  // objava sadržaja: html_field = frag, display_type 2, meta; kopija starog u IndexedDB
  W.rjObjavi = async function (slug, frag, meta) {
    const ID = W.rjId(slug); if (!ID) throw 'nema ID za ' + slug;
    const { raw, f } = await procitaj(ID);
    if (f.querySelector('[name=navig_url]').value !== slug) throw 'krivi blog';
    await kopija('blog' + ID + '_prije_' + Date.now(), raw('html_field'));
    const fd = new FormData(f);
    for (const n of ['main_text', 'short_text']) { const v = raw(n); if (v !== null) fd.set(n, v); }
    fd.set('html_field', frag); fd.set('display_type', '2'); if (meta) fd.set('html_description', meta);
    fd.delete('main_picture');
    await fetch(f.getAttribute('action') || ('blog.php?a=edit&i=' + ID), { method: 'POST', body: fd });
    await W.rjSpavaj(600);
    const p = await procitaj(ID);
    const ta = document.createElement('textarea'); ta.innerHTML = p.raw('html_field') || '';
    return { ID, hf_isti: ta.value === frag || p.raw('html_field') === frag, disp: p.d.querySelector('[name=display_type]:checked')?.value,
             active: p.d.querySelector('[name=is_active]').checked, desc: (p.d.querySelector('[name=html_description]').value || '').slice(0, 40) };
  };
  W.rjDatum = async function (slug, datum, aktivan) {
    const ID = W.rjId(slug); const { raw, f } = await procitaj(ID);
    if (f.querySelector('[name=navig_url]').value !== slug) throw 'krivi blog';
    const fd = new FormData(f);
    for (const n of ['html_field', 'main_text', 'short_text']) { const v = raw(n); if (v !== null) fd.set(n, v); }
    fd.delete('main_picture'); fd.set('date_created', datum);
    if (aktivan === false) fd.delete('is_active'); else if (aktivan === true) fd.set('is_active', '1');
    await fetch(f.getAttribute('action') || ('blog.php?a=edit&i=' + ID), { method: 'POST', body: fd });
    const p = await procitaj(ID);
    return { ID, novo: p.d.querySelector('[name=date_created]').value, aktivan: p.d.querySelector('[name=is_active]').checked, hf_isti: p.raw('html_field') === raw('html_field') };
  };
  // kartica na popisu bloga: main_picture (izrez 940×528), title, short_text
  W.rjNaslovna = async function (slug, x) {
    const ID = W.rjId(slug); if (!ID) throw 'nema ID';
    const b = await (await fetch(x.i, { cache: 'no-store' })).blob(); const im = await createImageBitmap(b);
    const Wd = 940, H = 528, k = Math.max(Wd / im.width, H / im.height), sw = Wd / k, sh = H / k;
    const c = document.createElement('canvas'); c.width = Wd; c.height = H;
    c.getContext('2d').drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, 0, 0, Wd, H);
    const jpg = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
    const { raw, f } = await procitaj(ID);
    if (f.querySelector('[name=navig_url]').value !== slug) throw 'krivi blog';
    const fd = new FormData(f);
    for (const n of ['html_field', 'main_text']) { const v = raw(n); if (v !== null) fd.set(n, v); }
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (x.s) fd.set('short_text', '<p>' + esc(x.s) + '</p>'); else { const v = raw('short_text'); if (v !== null) fd.set('short_text', v); }
    if (x.t) { fd.set('title', x.t); fd.set('html_title', x.t); }
    fd.set('navig_url', slug);
    fd.set('main_picture', new File([jpg], slug.slice(0, 60) + '.jpg', { type: 'image/jpeg' }));
    const akt = f.querySelector('[name=is_active]').checked;
    await fetch(f.getAttribute('action') || ('blog.php?a=edit&i=' + ID), { method: 'POST', body: fd });
    await W.rjSpavaj(800);
    const p = await procitaj(ID);
    return { ID, slug2: p.d.querySelector('[name=navig_url]').value, hf: p.raw('html_field') === raw('html_field'),
             pic: (p.t.match(/blog\/[^"' ]*-940-\d+\.webp/) || [])[0], aktivan: p.d.querySelector('[name=is_active]').checked, akt_prije: akt };
  };
  W.rjPaket2 = async function (sha, path, hash, log) {
    const P = JSON.parse(await W.rjIzGita(sha, path, hash));
    for (const [slug, x] of Object.entries(P)) {
      try {
        const r = await W.rjObjavi(slug, x.frag, x.meta);
        let d = null;
        if (x.datum) { await W.rjSpavaj(1200); d = await W.rjDatum(slug, x.datum, x.aktivan); }
        const ok = r.hf_isti && String(r.disp) === '2' && (!d || (d.hf_isti && d.novo === x.datum && d.aktivan === x.aktivan));
        log.objavljeno.push([slug, ok, d && d.novo, d && d.aktivan]);
        if (!ok) log.greske.push(slug + ' ' + JSON.stringify({ r, d }).slice(0, 250));
      } catch (e) { log.greske.push(slug + ': ' + e); }
      await W.rjSpavaj(2500);
    }
  };
  W.__red = W.__red || []; W.__log = W.__log || { objavljeno: [], slike: [], greske: [], nasl: [], radi: false };
  W.rjRed = async function () {
    if (W.__log.radi) return; W.__log.radi = true;
    try {
      while (W.__red.length) {
        const k = W.__red.shift(); W.__log.trenutno = (k.slike || k.pak || k.nasl || ['?', '?'])[1];
        if (k.slike) await W.rjSlike(JSON.parse(await W.rjIzGita(...k.slike)), W.__log);
        if (k.pak) await W.rjPaket2(...k.pak, W.__log);
        if (k.nasl) {
          const N = JSON.parse(await W.rjIzGita(...k.nasl));
          for (const [s, x] of Object.entries(N)) {
            try { const r = await W.rjNaslovna(s, x); const ok = r.slug2 === s && r.hf && !!r.pic && r.aktivan === r.akt_prije; W.__log.nasl.push([s, ok]); if (!ok) W.__log.greske.push('naslovna ' + s + ' ' + JSON.stringify(r)); }
            catch (e) { W.__log.greske.push('naslovna ' + s + ': ' + e); }
            await W.rjSpavaj(1500);
          }
        }
      }
    } finally { W.__log.radi = false; W.__log.trenutno = null; }
  };
  return 'alati ok';
})();
