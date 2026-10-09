/* rjfun-b.js (09.10.: odabir veličine preko slike) — posebna ponuda Fun SVE (688): kartice kao na fitness kategorijama (izvor: rjcmp.js v=20261008a), bez usporedbe i fitness blokova. 09.10.2026. */
/* Fitness sprave: kartice proizvoda + usporedba do 3 modela iste vrste (Codex MD 02.10.2026., Ivo odobrio skicu).
   Podaci o znacajkama: rjcmp-kartice.json / rjcmp-spec.json (iz objavljenih stranica artikala). Cijena se cita iz kartice teme. */
(function(){
if(window.__rjcmp)return;window.__rjcmp=1;
/* MD zavrsne ispravke 02.10.: na katalogu bez automatskog pozdravnog oblacica chata (njihov vlastiti kljuc kad kupac zatvori oblacic) */
try{sessionStorage.setItem('aichat_tooltip_dismissed','1')}catch(e){}
var D=document,BASE='/user_files/fun-ponuda/',VER='20261002d',MAX=3,KEY='rjfun_sel';
var K=null,S=null,sel=[],opener=null;
/* rj-mc2 = mobilne kartice v2 (Codex MD v2, 02.10.2026.): veca fotografija, jednostavnija kartica. Povrat: MC2=0 (ili vratiti povrat_v1d/) */
var MC2=1;
function el(t,c,txt){var e=D.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e}
/* broj i jedinica ne smiju se razdvojiti u dva retka */
function nb(v){return String(v).replace(/(\d) (?=[^\d\s])/g,'$1\u00a0')}
function cap(t){return t.charAt(0).toUpperCase()+t.slice(1)}
function fmt(n){var p=n.toFixed(2).split('.');return p[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.')+','+p[1]+' €'}
function cijena(card){var c=card.querySelector('.c-sada');if(!c)return null;var t=c.textContent.replace(/[^\d,]/g,'').replace(',','.');var n=parseFloat(t);return isFinite(n)&&n>0?n:null}
function load(){try{sel=JSON.parse(localStorage.getItem(KEY)||'[]').filter(function(x){return K.a[x]}).slice(0,MAX)}catch(e){sel=[]}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(sel))}catch(e){}}
function tip(id){return K.a[id]?K.a[id][0]:''}
function tipIme(id){return K.tip[tip(id)]||''}
function kartica(id){return D.querySelector('.product_list_cnt .product_cnt[data-productid="'+id+'"]')}
/* Ivo 08.10.2026.: odabrani artikl kojeg nema na ovoj stranici (druga kategorija) dobivao je cijenu PRVE kartice na stranici.
   Sada se cijena, slika i poveznica pamte kad je kartica viđena (localStorage KEY+'_i'), a bez zapisa piše „Nije navedeno”. */
function infoI(){try{return JSON.parse(localStorage.getItem(KEY+'_i')||'{}')}catch(e){return {}}}
function infoSpremi(id,c){var I=infoI(),im=c.querySelector('figure img'),a=c.querySelector('figure a'),b=c.querySelector('.brand'),
  z={s:im&&im.getAttribute('src'),h:a&&a.getAttribute('href'),p:cijena(c),e:c.querySelector('.rjc-ey')?c.querySelector('.rjc-ey').textContent.split(' · ')[0]:(b?b.textContent.trim():'')};
 if(JSON.stringify(I[id])!==JSON.stringify(z)){I[id]=z;try{localStorage.setItem(KEY+'_i',JSON.stringify(I))}catch(e){}}return z}
function info(id){var c=kartica(id);return c?infoSpremi(id,c):(infoI()[id]||{})}
/* Ivo 08.10.2026.: dijeljenje usporedbe — poveznica #usporedi=id-id-id; artikle kojih nema na stranici dohvati pretragom po nazivu (samo kad se otvori dijeljena poveznica) */
function dohvatiInfo(ids,cb){var r=ids.filter(function(id){return !kartica(id)&&!infoI()[id]&&K.a[id]});
 (function nx(){var id=r.shift();if(!id)return cb();fetch('/hr/pretraga/?search='+encodeURIComponent(K.a[id][1])).then(function(x){return x.ok?x.text():''}).then(function(t){
  var c=new DOMParser().parseFromString(t,'text/html').querySelector('.product_cnt[data-productid="'+id+'"]');if(c)infoSpremi(id,c)}).catch(function(){}).then(nx)})()}
function poveznica(){return location.origin+location.pathname+location.search+'#usporedi='+sel.join('-')}
function podijeli(b){var u=poveznica(),L=b.querySelector('span')||b,t=L.textContent;function ok(){L.textContent='Poveznica kopirana ✓';setTimeout(function(){L.textContent=t},2500)}
 function rucno(){var i=el('input');i.value=u;i.setAttribute('readonly','');i.style.cssText='position:fixed;top:-100px';D.body.appendChild(i);i.select();try{D.execCommand('copy');ok()}catch(e){}i.remove()}
 if(navigator.share&&window.matchMedia&&matchMedia('(pointer:coarse)').matches){navigator.share({title:D.title,url:u}).catch(function(){});return}
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(u).then(ok,rucno);else rucno()}
/* Ivo 08.10.2026.: ispis i e-mail. HTML e-mail se iz preglednika ne može poslati (mailto nosi samo tekst),
   pa se oblikovana tablica kopira u međuspremnik (text/html) i otvori e-mail s naslovom i poveznicom — korisnik zalijepi tablicu. */
/* Ivo 08.10.2026.: slike na webu su WebP, a Outlook Classic crta poruku Wordovim pogonom koji WebP ne dekodira
   (izmjereno: udaljeni WebP ostane samo poveznica 135x250, ugradjena data: JPEG slika prodje kao prava slika).
   Zato se slika prije kopiranja pretvori u JPEG i ugradi u sam HTML. Ako pretvorba ne uspije, ostaje stara adresa. */
function uJpeg(img,sir){try{var w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)return '';
 var s=Math.min(1,sir*2/w),c=D.createElement('canvas');c.width=Math.max(1,Math.round(w*s));c.height=Math.max(1,Math.round(h*s));
 var x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
 return c.toDataURL('image/jpeg',0.85)}catch(e){return ''}}
function apsolutno(u){try{return new URL(u,location.href).href}catch(e){return u}}
function mailHtml(){var t=tw.querySelector('table');if(!t)return '';var k=t.cloneNode(true);
 var izv=t.querySelectorAll('img'),kop=k.querySelectorAll('img');
 [].forEach.call(kop,function(i,n){var o=izv[n],d=o?uJpeg(o,180):'';
  i.setAttribute('src',d||apsolutno(i.getAttribute('src')));i.removeAttribute('loading');
  i.setAttribute('width','180');i.setAttribute('height',(o&&o.naturalWidth)?String(Math.round(180*o.naturalHeight/o.naturalWidth)):'135');
  i.style.cssText='display:block;width:180px;height:auto;margin:0 0 6px'});
 [].forEach.call(k.querySelectorAll('a'),function(a){a.href=apsolutno(a.getAttribute('href'));a.style.cssText='color:#111;font-weight:600'});
 [].forEach.call(k.querySelectorAll('th,td'),function(c){c.style.cssText='border-bottom:1px solid #e6e6e6;padding:8px 10px;text-align:left;vertical-align:top;font:14px/20px Arial,sans-serif;color:#111'+(c.tagName==='TH'?';color:#555;background:#f8f8f8;width:160px':'')});
 [].forEach.call(k.querySelectorAll('.rjc-p'),function(c){c.style.cssText='font-weight:700;font-size:16px'});
 k.setAttribute('cellpadding','0');k.setAttribute('cellspacing','0');k.style.cssText='border-collapse:collapse;width:100%;max-width:900px';
 return '<div style="font-family:Arial,sans-serif;color:#111"><h2 style="font:700 20px/26px Arial,sans-serif;margin:0 0 12px">'+dlg.querySelector('h2').textContent+'</h2>'+k.outerHTML
  +'<p style="font:14px/20px Arial,sans-serif;margin:14px 0 0"><a href="'+poveznica()+'" style="color:#111;font-weight:600">Otvori usporedbu na rog-joma.hr</a></p></div>'}
function posalji(b){var h=mailHtml(),u=poveznica(),n=dlg.querySelector('h2').textContent,L=b.querySelector('span')||b,t=L.textContent;
 function otvoriMail(){L.textContent='Tablica kopirana – zalijepi je u e-mail (Ctrl+V)';setTimeout(function(){L.textContent=t},6000);
  location.href='mailto:?subject='+encodeURIComponent(n+' – Rog-Joma')+'&body='+encodeURIComponent(n+'\n'+u+'\n\n')}
 function rucno(){var d=el('div');d.contentEditable='true';d.innerHTML=h;d.style.cssText='position:fixed;left:-9999px;top:0';D.body.appendChild(d);var r=D.createRange();r.selectNodeContents(d);var s=getSelection();s.removeAllRanges();s.addRange(r);try{D.execCommand('copy')}catch(e){}s.removeAllRanges();d.remove();otvoriMail()}
 try{if(navigator.clipboard&&window.ClipboardItem){navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([h],{type:'text/html'}),'text/plain':new Blob([n+'\n'+u],{type:'text/plain'})})]).then(otvoriMail,rucno);return}}catch(e){}rucno()}
function ispis(){var st=D.getElementById('rjc-print');if(!st){st=el('style');st.id='rjc-print';st.textContent='@media print{body>*:not(.rjc-ov){display:none!important}html,body{overflow:visible!important;height:auto!important}.rjc-ov{position:static!important;background:none!important;inset:auto!important;display:block!important}.rjc-dlg{position:static!important;max-height:none!important;height:auto!important;overflow:visible!important;box-shadow:none!important;width:auto!important;max-width:none!important;transform:none!important}.rjc-tw{overflow:visible!important;max-height:none!important}.rjc-close,.rjc-akc,.rjc-hint{display:none!important}.rjc-t img{max-width:160px!important}}';D.head.appendChild(st)}
 window.print()}
function izPoveznice(){var m=(location.hash||'').match(/usporedi=([\d-]+)/);if(!m)return;
 var ids=m[1].split('-').filter(function(x,i,a){return K.a[x]&&a.indexOf(x)===i}).slice(0,MAX);
 try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
 if(ids.length<2)return;sel=ids;save();crtaj();dohvatiInfo(ids,function(){otvori()})}

/* ---------- kartica ---------- */
function uredi(card){
 if(card.__rjc)return;card.__rjc=1;
 var id=card.getAttribute('data-productid'),a=K.a[id],box=card.querySelector('.product_list_text_box');if(!box)return;
 var link=(card.querySelector('figure a')||{}).getAttribute?card.querySelector('figure a').getAttribute('href'):null;
 var br=box.querySelector('.brand'),h2=box.querySelector('h2.ime'),ha=h2&&h2.closest('a');
 var ey=el('div','rjc-ey');ey.appendChild(el('span','rjc-eb',br?br.textContent.trim():''));if(a&&tipIme(id))ey.appendChild(el('span','rjc-et',' · '+tipIme(id)));
 box.insertBefore(ey,box.firstChild);
 if(a&&h2&&a[1]){h2.setAttribute('data-rjc-erp',h2.textContent);h2.textContent=a[1]}
 if(a&&a[2]&&a[2].length){var sp=el('div','rjc-sp');a[2].forEach(function(z){var d=el('div');d.appendChild(el('b',null,nb(z[0])));d.appendChild(el('span',null,cap(z[1])));sp.appendChild(d)});(ha||h2||ey).after(sp);
  /* mobilni prikaz (rj-mc2): jednostavni redovi "Razine otpora: 8" */
  var sm=el('div','rjc-spm');a[2].forEach(function(z){sm.appendChild(el('div',null,cap(z[1])+': '+nb(z[0])))});sp.after(sm)}
 var cij=el('div','rjc-cij');var prvi=box.querySelector('.c-prije')||box.querySelector('.c-sada');
 if(prvi){box.insertBefore(cij,prvi);['.c-prije','.c-sada','.c-najniza','.c-sidro'].forEach(function(s){var x=box.querySelector(s);if(x)cij.appendChild(x)})}else box.appendChild(cij);
 /* cijene: tisuce i znak eura ne smiju se odvojiti od broja (npr. "4 990,00 €" u retku najnize cijene) */
 [].forEach.call(cij.querySelectorAll('.c-prije,.c-sada,.c-najniza,.c-prije s'),function(e){[].forEach.call(e.childNodes,function(t){if(t.nodeType===3)t.textContent=t.textContent.replace(/(\d) (?=\d{3})/g,'$1\u00a0').replace(/ €/g,'\u00a0€')})});
 var n=cijena(card),cs=cij.querySelector('.c-sada');
 /* v7 (05.10.2026.): bez rata; glavni gumb dodaje u postojeću košaricu, bez drugog linka na isti PDP */
 var sku=skuKartice(card);
 /* Ivo 05.10.: naknada „Priprema i isporuka glomaznog artikla” prikazuje se uz cijenu prema stvarnom pravilu košarice (izmjereno 05.10.2026.:
    po komadu 39,90 € za artikle od 139 € naviše, nema je do 129,90 €; između nije izmjereno pa se tu ne prikazuje) */
 /* Ivo 05.10.: redak o glomaznoj isporuci se NE prikazuje („idemo bez dostave”) */
 var NN=(K&&K.nenarucivo)||window.RJCMP_NN||[];
 /* rasprodaja: nosilac veličina (šifra kartice nije artikl iz ponude) -> veličina se bira na stranici artikla */
 var SZ=(K&&K.sz&&K.sz[id])||null;if(SZ&&SZ.length)velicine(card,SZ);
 var VEL=(K&&K.vel)||[];if(sku&&VEL.indexOf(sku)>=0){sku='';if(link){var bv=el('a','rjc-btn','Odaberi veličinu →');bv.href=link;cij.appendChild(bv);link=null}}
 if(sku&&NN.indexOf(sku)>=0){var nb2=el('button','rjc-btn rjc-add rjc-nema','Trenutno nije dostupno');nb2.type='button';nb2.disabled=true;cij.appendChild(nb2);
  if(link){var up=el('a','rjc-upit','Pogledaj artikl i upit →');up.href=link;cij.appendChild(up)}sku=''}
 if(sku){var b=el('button','rjc-btn rjc-add','Dodaj u košaricu');b.type='button';b.setAttribute('data-sku',sku);
  b.setAttribute('aria-label','Dodaj u košaricu: '+((a&&a[1])||(h2&&h2.textContent)||sku));b.addEventListener('click',function(){dodaj(b,card)});cij.appendChild(b)}
 else if(link){var b2=el('a','rjc-btn','Odaberi opcije →');b2.href=link;cij.appendChild(b2)}
 if(a&&a[2]&&a[2].length){var lab=el('label','rjc-cmp'),cb=el('input');cb.type='checkbox';cb.setAttribute('data-rjc',id);cb.checked=sel.indexOf(id)>=0;
  lab.appendChild(cb);lab.appendChild(el('span','rjc-cl','Dodaj za usporedbu'));lab.appendChild(el('span','rjc-cs','Usporedi'));cij.appendChild(lab);
  cb.addEventListener('change',function(){promjena(id,cb)})}
 slikaKartice(card);utori(card);poravnaj();
}
/* Ivo 09.10.: odabir veličine preko slike (kao Gymshark). Veličine i šifre su u K.sz (generator), zaliha se pita tek kad miš zastane na kartici;
   nedostupne veličine svijetlosive i neklikabilne. Klik = isti poziv kao gumb „Stavi u košaricu” (dodaj). Mobitel: prvi dodir na sliku otvara ploču. */
function velicine(card,SZ){var fig=card.querySelector('figure');if(!fig||fig.querySelector('.rjsz'))return;
 var p=el('div','rjsz');p.appendChild(el('p','rjsz-h','Odaberi veličinu'));var g=el('div','rjsz-g');
 SZ.forEach(function(s){var b=el('button','rjsz-b',s[0]);b.type='button';b.setAttribute('data-sku',s[1]);b.setAttribute('aria-label','Dodaj u košaricu, veličina '+s[0]);if(s[2]===0){b.classList.add('rjsz-no');b.setAttribute('aria-disabled','true');b.title='Trenutno nema na zalihi'}
  b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(b.classList.contains('rjsz-no'))return;dodaj(b,card)});g.appendChild(b)});
 p.appendChild(g);p.addEventListener('click',function(e){e.stopPropagation()});fig.appendChild(p);
 var prov=0,t=0;function zaliha(){if(prov)return;prov=1;SZ.forEach(function(s,i){if(s[2]===0)return;
  fetch('/aj_general.php?lang=hr',{method:'POST',credentials:'include',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'a=equipment_availability_by_sku&product_code='+encodeURIComponent(s[1])})
  .then(function(r){return r.json()}).then(function(d){var ok=d&&d.shops&&d.shops.some(function(x){return x.in_stock==='yes'});var b=g.children[i];
   if(!ok&&b){b.classList.add('rjsz-no');b.setAttribute('aria-disabled','true');b.title='Trenutno nema na zalihi'}}).catch(function(){})})}
 card.addEventListener('mouseenter',function(){t=setTimeout(zaliha,250)});card.addEventListener('mouseleave',function(){clearTimeout(t)});
 p.addEventListener('focusin',zaliha);
 var a=fig.querySelector('a');if(a)a.addEventListener('click',function(e){if(window.matchMedia&&matchMedia('(hover: none)').matches&&!card.classList.contains('rjsz-otv')){
  e.preventDefault();[].forEach.call(D.querySelectorAll('.product_cnt.rjsz-otv'),function(c){c.classList.remove('rjsz-otv')});card.classList.add('rjsz-otv');zaliha()}})}
function sve(){[].forEach.call(D.querySelectorAll('.product_list_cnt .product_cnt'),uredi)}

/* ---------- odabir ---------- */
var bar,chips,go,msg;
function poruka(t){msg.textContent=t||''}
function promjena(id,cb){
 if(cb.checked){
  if(sel.length&&tip(sel[0])!==tip(id)){cb.checked=false;poruka('Za usporedbu odaberi modele iste vrste sprave. Trenutno uspoređuješ: '+tipIme(sel[0]).toLowerCase()+'.');crtaj(true);return}
  if(sel.length>=MAX){cb.checked=false;poruka('Možeš usporediti najviše '+MAX+' modela. Ukloni jedan iz odabira pa dodaj novi.');crtaj(true);return}
  sel.push(id);poruka('')
 }else{sel=sel.filter(function(x){return x!==id});poruka('')}
 save();crtaj()
}
function ukloni(id){sel=sel.filter(function(x){return x!==id});save();var c=D.querySelector('input[data-rjc="'+id+'"]');if(c)c.checked=false;poruka('');crtaj()}
function crtaj(zadrzi){
 bar.hidden=!sel.length&&!(zadrzi&&msg.textContent);
 chips.innerHTML='';
 sel.forEach(function(id){var c=el('span','rjc-chip');c.appendChild(el('span',null,(K.a[id]&&K.a[id][1])||id));var x=el('button',null,'×');x.type='button';x.setAttribute('aria-label','Ukloni '+((K.a[id]&&K.a[id][1])||'')+' iz usporedbe');x.addEventListener('click',function(){ukloni(id)});c.appendChild(x);chips.appendChild(c)});
 go.textContent='Usporedi ('+sel.length+')';go.disabled=sel.length<2;
 go.setAttribute('aria-disabled',sel.length<2?'true':'false');
 pomak()
}
function pomak(){var h=bar.hidden?0:bar.getBoundingClientRect().height+16;D.body.style.paddingBottom=h?(h+16)+'px':'';
 var up=D.querySelector('.scrollUpCnt');if(up)up.style.bottom=h?(h+20)+'px':'';  /* temina strelica na vrh iznad trake usporedbe */
 try{if(window.aichatApi&&aichatApi.setBottomOffset)aichatApi.setBottomOffset(h?h+14:null)}catch(e){}}
function traka(){
 bar=el('div','rjc-bar');bar.setAttribute('role','region');bar.setAttribute('aria-label','Usporedba sprava');bar.hidden=true;
 bar.appendChild(el('span','rjc-bar-h','Usporedba:'));chips=el('div','rjc-chips');bar.appendChild(chips);
 go=el('button','rjc-go');go.type='button';go.addEventListener('click',function(){if(sel.length>=2)otvori(go)});bar.appendChild(go);
 var x=el('button','rjc-x','Očisti');x.type='button';x.addEventListener('click',function(){sel.slice().forEach(ukloni);poruka('');crtaj()});bar.appendChild(x);
 msg=el('p','rjc-msg');msg.setAttribute('aria-live','polite');bar.appendChild(msg);
 D.body.appendChild(bar);window.addEventListener('aichat:ready',pomak);window.addEventListener('resize',pomak)
}

/* ---------- dijalog ---------- */
var ov,dlg,tw;
function dijalog(){
 ov=el('div','rjc-ov');ov.hidden=true;dlg=el('div','rjc-dlg');dlg.setAttribute('role','dialog');dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-labelledby','rjc-dlg-n');dlg.tabIndex=-1;
 var h=el('div','rjc-dlg-h'),n=el('h2',null,'Usporedba');n.id='rjc-dlg-n';h.appendChild(n);
 var c=el('button','rjc-close','×');c.type='button';c.setAttribute('aria-label','Zatvori usporedbu');c.addEventListener('click',zatvori);h.appendChild(c);
 tw=el('div','rjc-tw');dlg.appendChild(h);dlg.appendChild(tw);
 var f=el('div','rjc-dlg-f','Podaci sa stranica proizvoda. Cijena je trenutna cijena s kartice proizvoda. ');
 var ak=el('span','rjc-akc'),bs='margin-left:16px;background:none;border:0;padding:0;font:inherit;font-weight:600;color:#111;cursor:pointer;display:inline-flex;align-items:center;gap:6px;vertical-align:middle',
  SV='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">',
  IKO={pov:SV+'<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>',
   mail:SV+'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
   isp:SV+'<path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/></svg>'};
 [['pov','Kopiraj poveznicu',podijeli],['mail','Pošalji e-mailom',posalji],['isp','Ispiši / PDF',function(){ispis()}]].forEach(function(x){var b=el('button','rjc-share');b.type='button';b.style.cssText=bs;b.innerHTML=IKO[x[0]]+'<span style="text-decoration:underline"></span>';b.querySelector('span').textContent=x[1];b.addEventListener('click',function(){x[2](b)});ak.appendChild(b)});
 f.appendChild(ak);dlg.appendChild(f);
 ov.appendChild(dlg);D.body.appendChild(ov);
 ov.addEventListener('click',function(e){if(e.target===ov)zatvori()});
 D.addEventListener('keydown',function(e){if(ov.hidden)return;if(e.key==='Escape'){e.preventDefault();zatvori()}
  if(e.key==='Tab'){var f=[].filter.call(dlg.querySelectorAll('a[href],button,[tabindex="0"]'),function(x){return x.offsetParent!==null});if(!f.length)return;var a=f[0],z=f[f.length-1];
   if(e.shiftKey&&D.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&D.activeElement===z){e.preventDefault();a.focus()}}})
}
function spec(cb){if(S)return cb();if(window.RJCMP_S){S=window.RJCMP_S;return cb()}
 tw.innerHTML='<p style="padding:20px">Učitavanje…</p>';
 fetch(BASE+'rjcmp-spec.json?v='+VER).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){S=j;cb()}).catch(function(){tw.innerHTML='<p style="padding:20px">Podaci za usporedbu trenutno nisu dostupni. Pokušaj ponovno.</p>'})}
function chat(skrij){var h=D.getElementById('aichat-widget-host');if(!h)return;if(skrij){h.__rjd=h.style.display;h.style.display='none'}else h.style.display=h.__rjd||''}
function otvori(btn){opener=btn||D.activeElement;ov.hidden=false;D.documentElement.style.overflow='hidden';chat(true);
 dlg.querySelector('h2').textContent='Usporedba: '+tipIme(sel[0]).toLowerCase()+' ('+sel.length+')';
 spec(tablica);setTimeout(function(){dlg.querySelector('.rjc-close').focus()},0)}
function zatvori(){ov.hidden=true;D.documentElement.style.overflow='';chat(false);if(opener&&opener.focus)opener.focus()}
function tablica(){
 var ids=sel.slice(),red=[],vid={};
 ids.forEach(function(id){(S.a[id]||[]).forEach(function(r){if(!vid[r[0]]){vid[r[0]]=1;red.push(r[0])}})});
 var t=el('table','rjc-t'),th=el('thead'),tr=el('tr');tr.appendChild(el('th',null,'Model'));
 ids.forEach(function(id){var td=el('td'),z=info(id),a=K.a[id];
  /* Ivo 08.10.2026.: bez odgode - najvise 3 slike, sve su odmah vidljive, a nedohvacena slika se ne moze pretvoriti u JPEG za e-mail */
  if(z.s){var i=el('img');i.src=z.s;i.alt=(a&&a[1])||'';i.width=220;i.height=165;td.appendChild(i)}
  td.appendChild(el('div','rjc-m',(z.e?z.e+' ':'')+((a&&a[1])||'')));
  if(z.h){var l=el('a','rjc-l','Pogledaj detalje →');l.href=z.h;td.appendChild(l)}
  tr.appendChild(td)});th.appendChild(tr);t.appendChild(th);
 var tb=el('tbody');
 function row(n,f){var r=el('tr');r.appendChild(el('th',null,n));ids.forEach(function(id){var td=el('td');f(id,td);r.appendChild(td)});tb.appendChild(r)}
 row('Cijena',function(id,td){var n=info(id).p;if(n){td.appendChild(el('div','rjc-p',eurV(n)))}else td.appendChild(el('span','rjc-nn','Nije navedeno'))});
 red.forEach(function(n){row(n,function(id,td){var v=(S.a[id]||[]).filter(function(r){return r[0]===n})[0];if(v)td.textContent=nb(v[1]);else td.appendChild(el('span','rjc-nn','Nije navedeno'))})});
 t.appendChild(tb);tw.innerHTML='';tw.appendChild(t);uputa()
}
/* mobitel: uputa za listanje samo kad tablica stvarno ima visak sirine */
function uputa(){var u=dlg.querySelector('.rjc-hint');if(!u){u=el('p','rjc-hint','Povuci lijevo za ostale modele →');dlg.insertBefore(u,tw)}u.hidden=!(tw.scrollWidth>tw.clientWidth+4)}

/* ---------- start ---------- */
/* filtri: isti nazivi kao na karticama kategorija (samo prikaz; URL-ovi i grupe se ne mijenjaju) */
var NAZ={'ODJEÄ†A':'ODJEĆA','HLAÄŒE':'HLAČE'};
function filtri(){[].forEach.call(D.querySelectorAll('.product_list_filter_column a, #filtersToggle a'),function(a){var t=a.lastChild;if(t&&t.nodeType===3){var k=t.textContent.trim();if(NAZ[k]){t.textContent=' '+NAZ[k];a.title=NAZ[k]}}})}
/* Ivo 02.10.: tekst „prikaži filtere” uz ikonu otvara/zatvara filtre (tema ga ima kao obican div) */
function filtriGumb(){var b=D.querySelector('.product_list_filter_column .navbar-brand'),h=D.querySelector('.product_list_filter_column .filterHamburger');if(!b||!h||b.__rjf)return;b.__rjf=1;
 b.setAttribute('role','button');b.setAttribute('tabindex','0');b.setAttribute('aria-controls','filtersToggle');
 b.addEventListener('click',function(){h.click()});b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();h.click()}})}
/* Ivo 02.10.: filtar cijene na iPhoneu - tema ga primjenjuje samo na mouseup, koji se nakon povlacenja prstom ne salje.
   Na change (salje se kad se prst podigne) poziva se ista funkcija teme. */
function cijenaDodir(){var a=D.getElementById('slider-1'),b=D.getElementById('slider-2');if(!a||!b||a.__rjc)return;a.__rjc=1;
 var p1=a.value,p2=b.value,t=null;function primijeni(){clearTimeout(t);t=setTimeout(function(){if((a.value!==p1||b.value!==p2)&&typeof window.sliderLocationChange==='function'){p1=a.value;p2=b.value;window.sliderLocationChange()}},150)}
 a.addEventListener('change',primijeni);b.addEventListener('change',primijeni);a.addEventListener('touchend',primijeni);b.addEventListener('touchend',primijeni)}
/* ---------- Ivo 03.10.2026.: ujednacena velicina sprave u fotografiji (Codex: isti prostor, centrirano, usporediva popunjenost, bez rezanja) ----------
   Prazninu ugradjenu u datoteku (standard obrade: najdulja stranica sprave 0,64 sirine platna -> siroke sprave ispadnu sitne) mjeri preglednik:
   rubovi sprave na nasoj sivoj podlozi (prag 14), pa slika dobije mjerilo i pomak da sprava zauzme 90 % sirine ili 84 % visine okvira (mobitel 72 %, izmedju oznake popusta i tockica klizaca).
   Cijela sprava ostaje u okviru (mjerilo racunato iz njezinih rubova). Fotografija bez jednolike podloge (bvar>6) se ne dira.
   Kartica koristi veci izvoz -o (920x700) umjesto -lt (365x250 s bijelim rubovima), da povecanje ne bude mutno; bez -o vraca se izvorna. */
var OKV={};
function okvir(img,cb){var s=img.currentSrc||img.src;if(OKV.hasOwnProperty(s))return cb(OKV[s]);
 if(!img.complete||!img.naturalWidth){if(!img.__rjok){img.__rjok=1;img.addEventListener('load',function(){img.__rjok=0;velicina(img)})}return}
 var b=0;try{var W=230,H=Math.max(1,Math.round(W*img.naturalHeight/img.naturalWidth)),c=D.createElement('canvas');c.width=W;c.height=H;
  var x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,W,H);var d=x.getImageData(0,0,W,H).data,rub=[[],[],[]],i,j,p,q;
  function uzmi(xx,yy){q=(yy*W+xx)*4;rub[0].push(d[q]);rub[1].push(d[q+1]);rub[2].push(d[q+2])}
  for(i=0;i<W;i++){uzmi(i,0);uzmi(i,H-1)}for(j=0;j<H;j++){uzmi(0,j);uzmi(W-1,j)}
  var bg=rub.map(function(a){a=a.slice().sort(function(m,n){return m-n});return a[a.length>>1]}),bv=0,n=rub[0].length;
  for(i=0;i<n;i++)bv+=Math.max(Math.abs(rub[0][i]-bg[0]),Math.abs(rub[1][i]-bg[1]),Math.abs(rub[2][i]-bg[2]));bv/=n;
  if(bv<=6){var R=[],C=[];for(j=0;j<H;j++)R.push(0);for(i=0;i<W;i++)C.push(0);
   for(j=0;j<H;j++)for(i=0;i<W;i++){p=(j*W+i)*4;if(Math.max(Math.abs(d[p]-bg[0]),Math.abs(d[p+1]-bg[1]),Math.abs(d[p+2]-bg[2]))>14){R[j]++;C[i]++}}
   var y0=-1,y1=-1,x0=-1,x1=-1;for(j=0;j<H;j++)if(R[j]>=2){if(y0<0)y0=j;y1=j}for(i=0;i<W;i++)if(C[i]>=2){if(x0<0)x0=i;x1=i}
   if(y0>=0&&x0>=0)b=[x0/W,y0/H,(x1+1)/W,(y1+1)/H]}
 }catch(e){b=0}
 OKV[s]=b;cb(b)}
function velicina(img){if(!img.isConnected)return;okvir(img,function(b){var pic=img.isConnected&&(img.closest('picture')||img.parentNode);if(!pic)return;
 img.style.setProperty('object-fit','contain','important');
 if(!b){img.style.setProperty('transform','none','important');return}   /* fotografija bez jednolike podloge: cijela, bez povecanja */
 var fw=pic.clientWidth,fh=pic.clientHeight;if(!fw||!fh)return;var ar=img.naturalWidth/img.naturalHeight,af=fw/fh,mob=window.matchMedia&&matchMedia('(max-width:767px)').matches;
 var cw=ar<af?ar/af:1,ch=ar<af?1:af/ar,pw=(b[2]-b[0])*cw,ph=(b[3]-b[1])*ch,dx=((b[0]+b[2])/2-.5)*cw,dy=((b[1]+b[3])/2-.5)*ch;
 /* okomito: sprava ne smije pod tockice klizaca teme (dno okvira) ni pod oznaku popusta na mobitelu (vrh) */
 var Th=mob?.72:.84,pom=mob?.01:-.04,s=Math.max(.9,Math.min(1.7,Math.min(.9/pw,Th/ph)));
 img.style.setProperty('object-fit','contain','important');img.style.setProperty('transform-origin','50% 50%','important');
 img.style.setProperty('transform','translate('+(-s*dx*100).toFixed(2)+'%,'+((pom-s*dy)*100).toFixed(2)+'%) scale('+s.toFixed(3)+')','important')})}
function slikaKartice(card){var img=card.querySelector('figure img');if(!img||img.__rjv)return;img.__rjv=1;
 var izv=img.getAttribute('src')||'';
 if(/-lt\.webp$/.test(izv)){img.addEventListener('error',function(){if(/-o\.webp$/.test(img.src))img.src=img.src.replace(/-o\.webp$/,'-lt.webp')});
  img.setAttribute('src',izv.replace(/-lt\.webp$/,'-o.webp'));
  [].forEach.call(card.querySelectorAll('[data-hover-slider-image]'),function(e){e.setAttribute('data-hover-slider-image',e.getAttribute('data-hover-slider-image').replace(/-lt\.webp$/,'-o.webp'))})}
 /* klizac slika teme (prijelaz misem) mijenja src ili cijeli <img> - svaka nova slika dobiva svoje mjerilo */
 var fig=card.querySelector('figure');if(fig&&'MutationObserver' in window)new MutationObserver(function(){[].forEach.call(fig.querySelectorAll('img'),velicina)}).observe(fig,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 velicina(img)}

/* ---------- Ivo 03.10.2026.: u istom redu poravnati brend, naziv, specifikacije, cijene, napomenu i „Usporedi” ----------
   Svaki redak kartice je „utor”; gdje kartica nema podatak (npr. nema snizenja), stoji prazan utor iste visine. Visina = najvisi u redu; nista se ne reze. */
var UTOR=[['ey','.rjc-ey'],['ime','h2.ime'],['sp','.rjc-sp'],['spm','.rjc-spm'],['sidro','.c-sidro'],['prije','.c-prije'],['sada','.c-sada'],['naj','.c-najniza']];
function utori(card){var box=card.querySelector('.product_list_text_box');if(!box)return;var cij=box.querySelector('.rjc-cij'),h2=box.querySelector('h2.ime'),ha=h2&&h2.closest('a'),zadnji=null;
 UTOR.forEach(function(u){var e=box.querySelector(u[1]);
  if(!e){e=el('div','rjc-ph');e.setAttribute('aria-hidden','true');
   if(u[0]==='sp'||u[0]==='spm'){var poslije=u[0]==='spm'?box.querySelector('[data-rjs=sp]'):(ha||h2);if(poslije)poslije.after(e);else box.appendChild(e)}
   else if(cij){if(zadnji&&zadnji.parentNode===cij)zadnji.after(e);else cij.insertBefore(e,cij.firstChild)}else return}
  e.setAttribute('data-rjs',u[0]);if(e.parentNode===cij)zadnji=e;if(ROu)ROu.observe(e)})}
/* svaka promjena visine retka (ucitana slova, prelamanje naziva) ponovno poravna red; nase min-height ne mijenja konacnu visinu pa nema petlje */
var ROu='ResizeObserver' in window?new ResizeObserver(function(){poravnaj()}):null;
var tPor=null;
/* prirodna visina utora iz SADRZAJA (redci teksta ili djeca), ne iz okvira: tako ne ovisi o min-height koji smo sami postavili
   (Safari nakon micanja min-height zna vratiti staru visinu - zato se nista ne resetira prije mjerenja) */
function prirodna(e){var cs=getComputedStyle(e),pb=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+parseFloat(cs.borderTopWidth)+parseFloat(cs.borderBottomWidth),t=Infinity,b=-Infinity;
 var kids=[].filter.call(e.children,function(k){var d=getComputedStyle(k).display;return d!=='none'&&d.indexOf('inline')!==0&&d!=='contents'});
 if(kids.length)kids.forEach(function(k){var r=k.getBoundingClientRect(),m=getComputedStyle(k);t=Math.min(t,r.top-parseFloat(m.marginTop));b=Math.max(b,r.bottom+parseFloat(m.marginBottom))});
 else{var rg=D.createRange();rg.selectNodeContents(e);[].forEach.call(rg.getClientRects(),function(r){if(r.height>0&&r.width>0){t=Math.min(t,r.top);b=Math.max(b,r.bottom)}});
  var lh=parseFloat(cs.lineHeight);if(b>t&&lh>0)b=t+Math.max(1,Math.round((b-t)/lh))*lh}
 return (b>t?b-t:0)+pb}
function poravnaj(){clearTimeout(tPor);tPor=setTimeout(function(){
 var cards=[].filter.call(D.querySelectorAll('.product_list_cnt>.product_cnt'),function(c){return c.offsetParent});
 var redovi={};cards.forEach(function(c){var t=Math.round(c.getBoundingClientRect().top+window.pageYOffset);(redovi[t]=redovi[t]||[]).push(c)});
 var post=[];
 Object.keys(redovi).forEach(function(t){var red=redovi[t];
  UTOR.forEach(function(u){var els=red.map(function(c){return c.querySelector('[data-rjs='+u[0]+']')}).filter(function(e){return e&&getComputedStyle(e).display!=='none'});
   if(!els.length)return;var m=els.map(function(e){var cs=getComputedStyle(e),mg=parseFloat(cs.marginTop)+parseFloat(cs.marginBottom);return [e,prirodna(e)+mg,mg]});
   var mx=Math.max.apply(null,m.map(function(z){return z[1]}));m.forEach(function(z){post.push([z[0],Math.max(0,mx-z[2])])})})});
 /* postavlja se samo kad se vrijednost promijeni - bez nepotrebnih preracuna i bez petlje s ResizeObserverom */
 post.forEach(function(z){var v=z[1].toFixed(1)+'px';if(z[0].style.getPropertyValue('min-height')!==v)z[0].style.setProperty('min-height',v,'important')})},60)}
function velicinaSve(){[].forEach.call(D.querySelectorAll('.product_list_cnt figure img'),function(i){if(i.__rjv)velicina(i)})}

/* ================= v7 (Codex MD ZA-CODE-FITNESS-CJELOVITI-UX-I-KUPNJA-v7, 05.10.2026.) =================
   Izravno u postojeću košaricu, sadržajni blokovi među proizvodima, vidljiv H1, oznake filtara, sortiranje čuva filtre.
   Košarica: isti poziv kao gumb „Stavi u košaricu” na stranici artikla (aj_general.php a=add_equipment_to_basket),
   poslužitelj sam provjerava zalihu; uspjeh tek nakon odgovora. Mini-košarica = temin basket_dropdown_contents (cijela košarica). */
var V7 = 1;
var GLOM={iznos:39.90,od:139};   /* izmjereno u košarici 05.10.2026.; točan prag treba potvrditi Jan (vidi STATUS) */
function eurV(x){var n=parseFloat(x);return isFinite(n)?fmt(n).replace(/\./g,' '):''}
function eurT(t){return String(t).replace(/(\d{1,3}(?:[ \u00a0]\d{3})+|\d+)\.(\d{2})(?=\s*€)/g,function(m,a,b){return eurV(a.replace(/[ \u00a0]/g,'')+'.'+b)}).replace(/\s*€\s*€/,' €')}
function skuKartice(card){var w=card.querySelector('[data-productsku]');return w?w.getAttribute('data-productsku'):''}
var kos=null,kosOpener=null;
function kosarica(){if(kos)return kos;
 kos=el('dialog','rjk-dlg');kos.setAttribute('aria-labelledby','rjk-dlg-h');
 kos.innerHTML='<button type="button" class="rjk-x" aria-label="Zatvori">×</button><h2 id="rjk-dlg-h">Dodano u košaricu</h2><p class="rjk-poruka" role="status"></p>'
  +'<div class="rjk-art"><img alt="" width="120" height="91"><div><b class="rjk-ime"></b><span class="rjk-kol"></span><strong class="rjk-cij"></strong></div></div>'
  +'<div class="rjk-sve"><p class="rjk-sve-h">U košarici</p><ul></ul><p class="rjk-uk"></p></div><p class="rjk-glom" hidden></p><p class="rjk-zp" hidden></p>'
  +'<p class="rjk-nap">Način i trošak dostave biraš u košarici, prije potvrde narudžbe.</p>'
  +'<a class="rjk-pay" href="/hr/basket/">Na blagajnu →</a><button type="button" class="rjk-dalje">Nastavi pregledavati</button>';
 D.body.appendChild(kos);
 function zatvori(){if(kos.open)kos.close()}
 kos.querySelector('.rjk-x').onclick=zatvori;kos.querySelector('.rjk-dalje').onclick=zatvori;
 kos.addEventListener('click',function(e){if(e.target===kos)zatvori()});
 kos.addEventListener('close',function(){chat(false);if(kosOpener)try{kosOpener.focus({preventScroll:true})}catch(e){}});
 return kos}
/* stvarna kosarica (/hr/basket/): stavka glomazne isporuke i „Za platiti” - kako ih obracunava sustav */
function kosaricaStvarna(cb){fetch('/hr/basket/',{credentials:'include',cache:'no-store'}).then(function(r){return r.text()}).then(function(h){
  var d=new DOMParser().parseFromString(h,'text/html'),t=(d.body&&d.body.innerText||d.body.textContent||'').replace(/\s+/g,' '),o={};
  var m=t.match(/Priprema i isporuka glomaznog artikla\s*Šifra:\s*UD88\s*(\d+)\s*jedinica:\s*KOM\s*(?:cijena:)?\s*([\d.,\s]+?)\s*€\s*(?:iznos:)?\s*([\d.,\s]+?)\s*€/i);
  var num=function(x){return parseFloat(String(x).replace(/\s/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.'))};
  if(m)o.glom={kol:+m[1],cij:num(m[2]),izn:num(m[3])};
  var z=t.match(/Za platiti:?\s*(PDV uključen u cijenu)?\s*([\d.,\s]+?)\s*€/i);if(z)o.zaPlatiti=num(z[2]);cb(o)}).catch(function(){cb(null)})}
function miniKosarica(cb){
 fetch('/aj_general.php',{method:'POST',body:new URLSearchParams({rj_form:'basket_dropdown_contents'}),credentials:'include'})
  .then(function(r){return r.json()}).then(function(j){if(!j||j.result!=1||!j.basket_html)return cb(null);
   var t=D.createElement('div');t.innerHTML=j.basket_html;
   var st=[].map.call(t.querySelectorAll('li.item'),function(li){return {ime:(li.querySelector('.product_name')||{}).textContent||'',kol:(li.querySelector('.product_qty')||{}).textContent||'',url:(li.querySelector('a')||{}).getAttribute?li.querySelector('a').getAttribute('href'):''}});
   cb({st:st,uk:(t.querySelector('.price-total')||{}).textContent||''})}).catch(function(){cb(null)})}
function dodaj(btn,card){
 if(btn.__busy)return;var sku=btn.getAttribute('data-sku');if(!sku)return;
 btn.__busy=1;btn.disabled=true;btn.setAttribute('aria-busy','true');var txt=btn.textContent;btn.textContent='Dodajem…';
 var gr=card.querySelector('.rjc-err');if(gr)gr.remove();
 var fv=(window.postFormview||(D.querySelector('input[name=form_view]')||{}).value||'');
 fetch('/aj_general.php?lang=hr',{method:'POST',body:new URLSearchParams({a:'add_equipment_to_basket',product_code:sku,quantity:'1',formview:fv}),credentials:'include'})
  .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
  .then(function(d){var o=d&&d.operation_result||{},err=(o.error||[]).filter(Boolean),msg=(o.message||[]).filter(Boolean);
   if(o.result!=1||err.length){var nula=msg.some(function(m){return /dostupno samo:\s*0([.,]0+)?\b/i.test(m)});
    greska(card,btn,nula?'Ovaj artikl trenutno nije dostupan za narudžbu.':(err.join(' ')||'Artikl trenutno nije moguće dodati u košaricu.'),true);return}
   /* isti GA4 dogadjaj kao temin gumb na stranici artikla (temin se ovdje ne pokrece, pa nema duplikata) */
   if(typeof window.gtag==='function')window.gtag('event','add_to_cart',{currency:d.currency,value:d.value,items:d.items});
   if(d.basket&&d.basket.length&&typeof window.updateBasket==='function')window.updateBasket(d.basket);
   var k=kosarica(),it=(d.items||[])[0]||{},u=(d.basket||[]).filter(function(b){return b.sifra===sku})[0];
   var img=card.querySelector('figure img');k.querySelector('.rjk-art img').src=img?(img.currentSrc||img.src):'';
   var ime=((card.querySelector('.rjc-eb')||{}).textContent||'')+' '+((card.querySelector('h2.ime')||{}).textContent||'');
   k.querySelector('.rjk-ime').textContent=ime.trim();k.querySelector('.rjk-art img').alt=ime.trim();
   k.querySelector('.rjk-kol').textContent=u?('U košarici: '+u.kolicina+' kom'):'';
   k.querySelector('.rjk-cij').textContent=it.price?eurV(it.price):'';
   /* poruke posluzitelja (npr. „Trenutno je dostupno samo: 1”) prikazuju se doslovno, bez prve „dodan u košaricu” */
   /* poruke o ogranicenju zalihe prikazuju se doslovno; „dodan” i „količina izmijenjena u” su obicno povecanje (vidi se u retku U košarici) */
   var dod=msg.filter(function(m){return /dostupn|nema|ograni/i.test(m)});k.querySelector('.rjk-poruka').textContent=dod.join(' ');
   k.querySelector('#rjk-dlg-h').textContent=dod.length?'Košarica je ažurirana':'Dodano u košaricu';
   k.querySelector('.rjk-glom').hidden=true;k.querySelector('.rjk-zp').hidden=true;
   var ul=k.querySelector('.rjk-sve ul');ul.innerHTML='';k.querySelector('.rjk-uk').textContent='';k.querySelector('.rjk-sve').hidden=true;
   miniKosarica(function(m){if(!m||!m.st.length)return;k.querySelector('.rjk-sve').hidden=false;
    var pid=card.getAttribute('data-productid'),moj=m.st.filter(function(s){return pid&&s.url&&s.url.indexOf('-'+pid+'/')>0})[0];
    if(moj&&!k.querySelector('.rjk-kol').textContent){var q=(moj.kol.match(/^\s*(\d+)\s*x/)||[])[1];if(q)k.querySelector('.rjk-kol').textContent='U košarici: '+q+' kom'}
    m.st.filter(function(s){return !/glomaznog artikla/i.test(s.ime)}).forEach(function(s){var li=el('li');li.appendChild(el('span',null,s.ime.trim()));li.appendChild(el('b',null,eurT(s.kol.trim())));ul.appendChild(li)});
    /* ukupno mini-kosarice ne prikazujemo: ovisno o trenutku ukljucuje ili ne ukljucuje glomaznu isporuku; vrijedi „Za platiti u košarici” */
    var q=D.querySelectorAll('.shoppingCartQty');[].forEach.call(q,function(e){e.textContent=m.st.length;e.style.display=''})});
   kosaricaStvarna(function(r){var g=k.querySelector('.rjk-glom'),u=k.querySelector('.rjk-zp');if(!r)return;
    g.hidden=true;   /* Ivo 05.10.: bez retka o glomaznoj isporuci */
    if(r.zaPlatiti){u.textContent='Za platiti u košarici: '+eurV(r.zaPlatiti);u.hidden=false}});
   kosOpener=btn;chat(true);if(!k.open)k.showModal();k.querySelector('.rjk-pay').focus({preventScroll:true})})
  .catch(function(){greska(card,btn,'Dodavanje nije uspjelo. Provjeri vezu i pokušaj ponovno.')})
  .then(function(){btn.__busy=0;btn.disabled=false;btn.removeAttribute('aria-busy');btn.textContent=txt})}
function greska(card,btn,t,pdp){var e=el('p','rjc-err',t);e.setAttribute('role','alert');
 var h=(card.querySelector('figure a')||{}).getAttribute?card.querySelector('figure a').getAttribute('href'):'';
 if(pdp&&h){e.appendChild(D.createTextNode(' '));var a=el('a',null,'Pogledaj artikl i upit →');a.href=h;e.appendChild(a)}btn.after(e)}

/* ---- sadrzajni blokovi medju proizvodima (samo bez filtara i sortiranja; na podkategoriji samo tematski) ---- */
var IMG_K='/user_files/fitness-naslovnica/k-hero.jpg',VID=BASE+'reformer-pokret-v3.mp4',POS=BASE+'reformer-pokret-v3.jpg',SPR='/hr/fitness/fitness-sprave/';
function blokPrica(link){var s=el('section','rjx rjx-prica');
 s.innerHTML='<div class="rjx-vis"><img src="'+IMG_K+'" alt="Trčanje na stazi Kettler kod kuće" width="1920" height="850" loading="lazy"><span>KETTLER · TRENING KOD KUĆE</span></div>'
  +'<div class="rjx-txt"><p class="rjx-ey">TVOJ TEMPO. TVOJ PROSTOR.</p><h2>Trči kad tebi odgovara.</h2><p>Hodanje ili trčanje kod kuće — odaberi stazu prema prostoru i načinu treninga.</p>'
  +(link?'<a class="rjx-link" href="'+SPR+'trake-za-trcanje/">Sve staze za trčanje →</a>':'<a class="rjx-link" href="/hr/hodanje-i-trcanje/">Hodanje i trčanje: kako početi →</a>')+'</div>';return s}
function blokVideo(link){var s=el('section','rjx rjx-video');
 s.innerHTML='<div class="rjx-vis"><video data-rjauto muted playsinline loop preload="none" poster="'+POS+'" width="1280" height="720" aria-label="Video: vježba na pilates reformeru Liveness"><source src="'+VID+'" type="video/mp4"></video></div>'
  +'<div class="rjx-txt"><p class="rjx-ey">LIVENESS · REFORMER U POKRETU</p><h2>Pogledaj pokret. Upoznaj reformer.</h2><p>Vidi kako izgleda trening, upoznaj razlike među modelima i pronađi reformer za svoj prostor.</p>'
  +(link?'<a class="rjx-btn" href="'+SPR+'pilates-reformeri/">Usporedi reformere i cijene →</a>':'')+'<a class="rjx-link" href="/hr/vodic-pilates-reformer/">Pročitaj vodič za odabir →</a></div>';
 /* Ivo 05.10.2026.: kao NordicTrack - bez kontrola, sam krene bez zvuka u kadru i vrti se u krug (rjvid.js) */
 if(!window.RJVID&&!D.getElementById('rjvid-js')){var sc=el('script');sc.id='rjvid-js';sc.src=BASE+'rjvid.js?v=20261005b';sc.async=true;D.head.appendChild(sc)}
 return s}
/* Ivo 05.10.: NordicTrack T Series 10 - na Stazama za trcanje zamjenjuje Kettler blok; video sklapanja (C) jer video A prikazuje T16.
   Video krece sam bez zvuka u kadru (rjvid.js), izvan kadra pauzira. */
var NTV=BASE+'nt/';
/* NordicTrack blokovi po podkategoriji (Ivo 05.10.2026.): video točnog modela + odmah ispod njega kartica tog artikla (id) */
var NT={t10:{id:'46064',v:'nt-t10-sklapanje',ey:'NORDICTRACK · T SERIES 10',ime:'T Series 10',aria:'Video: NordicTrack T Series 10 – trčanje i sklapanje staze (bez zvuka)',
  p:'Pogledaj T Series 10 u pokretu. Upoznaj spravu, nagib i način spremanja prije nego što odabereš svoju stazu.',url:'/hr/fitness/fitness-sprave/trake-za-trcanje/staza-za-trcanje-nordictrack-t-series-10-46064/',
  link2:['/hr/hodanje-i-trcanje/','Vodič: hodanje i trčanje →']},
 rw900:{id:'46066',v:'nt-rw900-veslanje-od2',ey:'NORDICTRACK · RW900',ime:'RW900',aria:'Video: veslanje na spravi NordicTrack RW900 (bez zvuka)',
  p:'Pogledaj RW900 u pokretu. Upoznaj spravu, otpor i ručku prije nego što odabereš svoju spravu za veslanje.',url:'/hr/fitness/fitness-sprave/sprave-za-veslanje/sprava-za-veslanje-nordictrack-rw-900-46066/',
  link2:['/hr/trening-na-spravi-za-veslanje/','Vodič: kako pravilno veslati →'],   /* Ivo 05.10.: uz RW900 vodič za veslanje (videi RW900) */
  ifit:'Dostupnost i uvjete iFIT pretplate provjeri uz proizvod. Prikaz sadržaja u videu ne znači da je pretplata uključena.'},
 x16e:{id:'46053',v:'nt-x16e-ventilator',ey:'NORDICTRACK · X16',ime:'X16',aria:'Video: vježbanje na orbitreku NordicTrack X16 i ventilator AutoBreeze (bez zvuka)',
  p:'Pogledaj X16 u pokretu. Upoznaj spravu i ventilator AutoBreeze prije nego što odabereš svoj orbitrek.',url:'/hr/fitness/fitness-sprave/orbitreci/orbi-trek-nordictrack-x16-46053/',
  link2:['/hr/trening-na-orbitreku/','Vodič: trening na orbitreku →']},
 c1250:{id:'46063',v:'nt-1250-nagib',ey:'NORDICTRACK · COMMERCIAL 1250',ime:'Commercial 1250',aria:'Video: nagib i spust staze NordicTrack Commercial 1250 (bez zvuka)',
  p:'Pogledaj Commercial 1250 u pokretu. Upoznaj nagib od −3 % do 12 % prije nego što odabereš svoju stazu.',url:'/hr/fitness/fitness-sprave/trake-za-trcanje/staza-za-trcanje-nordictrack-commercial-1250-46063/',
  link2:['/hr/fitness/fitness-sprave/trake-za-trcanje/','Sve staze za trčanje →']},
 x24:{id:'46055',v:'nt-x24-nagib-od2',ey:'NORDICTRACK · X24',ime:'X24',aria:'Video: nagib bicikla NordicTrack X24 od −10 % do +20 % (bez zvuka)',
  p:'Pogledaj X24 u pokretu. Upoznaj nagib od −10 % do +20 % i otpor prije nego što odabereš svoj sobni bicikl.',url:'/hr/fitness/fitness-sprave/sobni-bicikli/sobni-bicikl-nordictrack-x24-46055/',
  link2:['/hr/trening-na-sobnom-biciklu/','Vodič: trening na sobnom biciklu →'],
  ifit:'Dostupnost i uvjete iFIT pretplate provjeri uz proizvod. Prikaz sadržaja u videu ne znači da je pretplata uključena.'}};
function blokNT(k){var m=NT[k],s=el('section','rjx rjx-video rjx-nt');if(!m.bezPomaka)s.setAttribute('data-nt',m.id);   /* bezPomaka: glavna Fitness sprave - artikl se ne premješta, hibridni poredak ostaje */
 s.innerHTML='<div class="rjx-vis"><video data-rjauto muted playsinline loop preload="none" poster="'+NTV+m.v+'.webp" width="1080" height="1080" aria-label="'+m.aria+'"><source src="'+NTV+m.v+'.mp4" type="video/mp4"></video></div>'
  +'<div class="rjx-txt"><p class="rjx-ey">'+m.ey+'</p><h2>Tvoj trening. U tvom prostoru.</h2><p>'+m.p+'</p>'
  +'<a class="rjx-btn" href="'+m.url+'">Upoznaj '+m.ime+' →</a><a class="rjx-link" href="'+(m.link2?m.link2[0]:'/hr/pocni-vjezbati-kod-kuce/')+'">'+(m.link2?m.link2[1]:'Kako početi vježbati kod kuće →')+'</a>'
  +(m.ifit?'<p class="rjx-nap">'+m.ifit+'</p>':'')+'</div>';
 if(!window.RJVID&&!D.getElementById('rjvid-js')){var sc=el('script');sc.id='rjvid-js';sc.src=BASE+'rjvid.js?v=20261005b';sc.async=true;D.head.appendChild(sc)}
 return s}
function blokVodici(){var s=el('section','rjx rjx-vod');
 var g=[['/hr/trening-na-sobnom-biciklu/','01 / SOBNI BICIKL','Tvoja vožnja kod kuće.','Kako namjestiti bicikl i složiti trening.','Pročitaj vodič →'],
  ['/hr/snaga-kod-kuce/','02 / SNAGA','Snaga počinje kod kuće.','Pet osnovnih pokreta, lakše i naprednije.','Pročitaj vodič →'],
  ['/hr/vodic-reformer-vjezbe/','03 / REFORMER','Od sprave do pokreta.','Vježbe na reformeru korak po korak.','Pogledaj vježbe →']];
 s.innerHTML='<p class="rjx-ey">OD ODABIRA DO PRVOG TRENINGA</p><h2>Pronađi svoju rutinu.</h2><div class="rjx-vg">'+g.map(function(x){return '<a href="'+x[0]+'"><span>'+x[1]+'</span><b>'+x[2]+'</b><em>'+x[3]+'</em><i>'+x[4]+'</i></a>'}).join('')+'</div>';return s}
var BLOK=[];
function filtrirano(){return /[?&](brend|price_from|price_to|groups|group_\d|sort_by|page|filter)/i.test(location.search)}
function blokovi(){var lst=D.querySelector('.product_list_cnt');if(!lst||filtrirano())return;
 var p=location.pathname.replace(/\/+$/,'/');var plan=null;
 if(p===SPR)plan=[[6,6,blokNT('c1250')],   /* Ivo 05.10.: umjesto Kettler slike video staze (Enim ima najviše staza; od NT staza s videom najviše 1250) */
  [9,10,blokVideo(true),'ref'],[15,16,blokVodici(),'iza']];
 else if(p===SPR+'trake-za-trcanje/')plan=[[6,6,blokNT('t10'),'kraj']];
 else if(p===SPR+'sprave-za-veslanje/')plan=[[6,6,blokNT('rw900'),'kraj']];
 else if(p===SPR+'sobni-bicikli/')plan=[[6,6,blokNT('x24'),'kraj']];
 else if(p===SPR+'orbitreci/')plan=[[6,6,blokNT('x16e'),'kraj']];
 else if(p===SPR+'pilates-reformeri/')plan=[[3,4,blokVideo(false)]];
 if(!plan)return;
 /* Ivo 05.10.: ručne zamjene mjesta na zadanom prikazu (bez filtra/sortiranja); poredak u adminu ostaje */
 if(p===SPR&&!window.__rjZam){window.__rjZam=1;[['26PTX-5000G','26PTX-7500MS']].forEach(function(z){
  var a=D.querySelector('.product_list_cnt>.product_cnt[data-productsku="'+z[0]+'"]'),b=D.querySelector('.product_list_cnt>.product_cnt[data-productsku="'+z[1]+'"]');
  if(a&&b){var m=D.createComment('z');a.before(m);b.before(a);m.replaceWith(b)}})}
 BLOK=plan;smjestiBlokove()}
function smjestiBlokove(){if(!BLOK.length)return;var mob=window.matchMedia&&matchMedia('(max-width:767px)').matches;
 var c=[].filter.call(D.querySelectorAll('.product_list_cnt>.product_cnt'),function(x){return x.style.display!=='none'});
 /* Ivo 05.10.: artikl iz NordicTrack videa (Staze: T10, Veslanje: RW900) stoji odmah ispod videa - ne broji se u položaj bloka, premješta se iza njega (samo bez filtra/sortiranja, kad je blok prikazan) */
 var ntb=null,t10=null;BLOK.forEach(function(b){if(b[2].classList.contains('rjx-nt'))ntb=b});
 if(ntb&&ntb[2].getAttribute('data-nt')){var a10=D.querySelector('.product_list_cnt>.product_cnt a[href*="-'+ntb[2].getAttribute('data-nt')+'/"]');t10=a10&&a10.closest('.product_cnt');if(t10){c=c.filter(function(x){return x!==t10});var nn=mob?ntb[1]:ntb[0];if(c.length>=nn)c.splice(nn,0,t10)}}   /* niz c = konačni redoslijed (artikl iz videa odmah iza bloka), da redovi ispod ostanu puni */
 /* Ivo 05.10.: video reformera stoji uz reformere u mrezi - na granici reda (oko najduljeg niza reformera) iza koje slijedi najvise reformera;
    vodici najmanje dva reda iza videa. Bez reformera ostaje fiksni polozaj. */
 var kol=mob?2:3,nv=null,ref=c.map(function(x){return !!x.querySelector('a[href*="/pilates-reformeri/"]')}),bi=-1,bl=0;
 for(var i=0;i<ref.length;i++)if(ref[i]){var j=i;while(j<ref.length&&ref[j])j++;if(j-i>bl){bl=j-i;bi=i}i=j}
 /* Ivo 05.10.: red reformera (najdulji niz) stoji odmah ispod reformer videa - izdvoji ga iz brojanja, vrati iza bloka */
 var refRun=[];if(bi>=0&&BLOK.some(function(b){return b[3]==='ref'})){refRun=c.slice(bi,bi+bl);c=c.filter(function(x){return refRun.indexOf(x)<0})}
 var nRef=Math.max(kol,Math.floor(bi/kol)*kol);if(nRef===(mob?BLOK[0][1]:BLOK[0][0]))nRef+=kol;
 if(refRun.length&&!mob&&location.pathname.replace(/\/+$/,'/')===SPR){   /* desktop: Pacer i Experience u red neposredno ispred reformer videa */
  var pe=['26FTM26-100','26FTM26-350'].map(function(k){return D.querySelector('.product_list_cnt>.product_cnt[data-productsku="'+k+'"]')}).filter(function(x){return x&&c.indexOf(x)>=0});
  if(pe.length===2&&nRef>=2){c=c.filter(function(x){return pe.indexOf(x)<0});var X=c[nRef-2];if(X){X.before(pe[0]);X.before(pe[1]);c.splice(nRef-2,0,pe[0],pe[1])}}}
 BLOK.forEach(function(b){var n=mob?b[1]:b[0];
  if(b[3]==='ref'&&bi>=0){n=nRef;   /* Ivo 05.10.: video dva reda više; na desktopu u redu ispred njega Pacer i Experience */if(n===(mob?BLOK[0][1]:BLOK[0][0]))n+=kol;nv=n}   /* video red ispod početka niza reformera; reformeri odmah ispod videa */
  if(b[3]==='iza'&&nv!==null){n=Math.max(n,nv+2*kol)+kol;var dod=refRun.length%kol;if(dod)n+=kol-dod}   /* Ivo 05.10.: vodiči jedan red niže; reformeri iza videa ne smiju ostaviti krnji red */
  if(c.length>n){var poslije=c[n-1];if(poslije.nextElementSibling!==b[2])poslije.after(b[2])}
  else if(c.length&&b[3]==='kraj'){if(c[c.length-1].nextElementSibling!==b[2])c[c.length-1].after(b[2])}
  else if(b[2].parentNode)b[2].remove()});
 if(ntb&&t10&&ntb[2].parentNode&&ntb[2].nextElementSibling!==t10)ntb[2].after(t10);
 if(refRun.length){var rb=null;BLOK.forEach(function(b){if(b[3]==='ref'&&b[2].parentNode)rb=b[2]});if(rb){var pr=rb;refRun.forEach(function(x){if(pr.nextElementSibling!==x)pr.after(x);pr=x})}}
 if(window.RJVID)window.RJVID.scan()}

/* ---- H1 (MD: jedan vidljiv naslov kategorije) - samo Fitness sprave i podkategorije ---- */
function naslov(){var p=location.pathname;if(p.indexOf(SPR)!==0)return;var h=D.querySelector('.rjk h1.rjk-eb');if(!h)return;
 D.documentElement.classList.add('rjx-h1');if(p.replace(/\/+$/,'/')===SPR)h.textContent='Fitness sprave za tvoj trening.'}

/* ---- oznake odabranih filtara + Očisti filtre (filtri teme ostaju; rade na poslužitelju i čuvaju redoslijed) ---- */
function oznake(){var lst=D.querySelector('.product_list_cnt');if(!lst||D.querySelector('.rjx-chips'))return;
 var u=new URL(location.href),o=[];
 (u.searchParams.get('brend')||'').split(',').filter(Boolean).forEach(function(b){o.push([b.replace(/-/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase()}),'brend',b])});
 var f=u.searchParams.get('price_from'),t=u.searchParams.get('price_to');if(f||t)o.push(['Cijena: '+(f||0)+'–'+(t||'')+' €','cijena','']);
 (u.searchParams.get('group_2')||'').split(',').filter(Boolean).forEach(function(g){var a=D.querySelector('.rjk a.rjk-c[data-g="'+g+'"] b');o.push([a?a.textContent:g,'group_2',g])});
 (u.searchParams.get('groups')||'').split(',').filter(Boolean).forEach(function(g){var a=D.querySelector('.rjk a.rjk-c[href$="/'+g+'/"] b');o.push([a?a.textContent:g,'groups',g])});
 var n=o.length;var lab=D.querySelector('.product_list_filter_column .navbar-brand');
 if(lab){lab.textContent=n?('Filtriraj ('+n+')'):'Filtriraj'}
 if(!n)return;var w=el('div','rjx-chips');w.setAttribute('aria-label','Odabrani filtri');
 o.forEach(function(x){var v=new URL(location.href);
  if(x[1]==='cijena'){v.searchParams.delete('price_from');v.searchParams.delete('price_to')}
  else{var l=(v.searchParams.get(x[1])||'').split(',').filter(function(y){return y&&y!==x[2]});if(l.length)v.searchParams.set(x[1],l.join(','));else v.searchParams.delete(x[1])}
  var a=el('a','rjx-chip');a.href=v.pathname+v.search;a.innerHTML='<span></span><i aria-hidden="true">×</i>';a.querySelector('span').textContent=x[0];a.setAttribute('aria-label','Ukloni filtar: '+x[0]);w.appendChild(a)});
 var c=el('a','rjx-clear','Očisti filtre');c.href=location.pathname;w.appendChild(c);lst.before(w)}
/* sortiranje zadrzava filtre (tema salje samo sort_by) */
function sortZadrzi(){if(D.__rjsort)return;D.__rjsort=1;D.addEventListener('change',function(e){var s=e.target;if(!s||s.id!=='productsSortBy')return;
 e.stopPropagation();e.stopImmediatePropagation();try{var u=new URL(location.href);u.searchParams.set('sort_by',s.value);u.searchParams.delete('page');location.href=u.pathname+u.search}catch(x){}},true)}
/* zaglavlje na fitness stranicama: „Prodaja bicikla…” -> fitness tekst (samo prikaz, tema ostaje ista) */
function zaglavlje(){var w=D.createTreeWalker(D.body,NodeFilter.SHOW_TEXT),n,i=0;while((n=w.nextNode())&&i++<4000){if(/Prodaja bicikla, električnih bicikla/.test(n.nodeValue)){n.nodeValue=n.nodeValue.replace(/Prodaja bicikla, električnih bicikla, opreme i dijelova za bicikle/,'Fitness sprave i oprema za trening kod kuće');break}}}
function natragNaRezultate(){if(!filtrirano()||!(window.matchMedia&&matchMedia('(max-width:767px)').matches))return;
 var c=D.querySelector('.rjx-chips')||D.querySelector('.product_list_cnt');if(!c)return;setTimeout(function(){var y=c.getBoundingClientRect().top+window.pageYOffset-80;window.scrollTo(0,Math.max(0,y))},350)}
function v7start(){if(D.querySelector('.rjk h1.rjk-eb'))D.documentElement.classList.add('rjx-h1');blokovi();oznake();sortZadrzi();natragNaRezultate();
 window.addEventListener('resize',function(){smjestiBlokove()})}

function start(){D.documentElement.classList.add('rjcmp-on');if(MC2)D.documentElement.classList.add('rj-mc2');traka();dijalog();load();sve();crtaj();izPoveznice();filtri();filtriGumb();cijenaDodir();window.addEventListener('resize',function(){if(ov&&!ov.hidden)uputa();velicinaSve();poravnaj()});
 /* poravnanje ponoviti kad se raspored promijeni (slova, slike, sirina) - Safari zna zavrsiti raspored nakon prvog prolaza */
 window.addEventListener('load',poravnaj);if(D.fonts&&D.fonts.ready)D.fonts.ready.then(poravnaj);[400,1200,3000,6000,10000].forEach(function(t){setTimeout(poravnaj,t)});
 [].forEach.call(D.querySelectorAll('link[href*="rjfun.css"]'),function(l){l.addEventListener('load',poravnaj)});
 var lstR=D.querySelector('.product_list_cnt'),rw=0;if(lstR&&'ResizeObserver' in window)new ResizeObserver(function(z){var w=Math.round(z[0].contentRect.width);if(w!==rw){rw=w;poravnaj()}}).observe(lstR);
 var lst=D.querySelector('.product_list_cnt');
 if(lst){if('MutationObserver' in window)new MutationObserver(sve).observe(lst,{childList:true})}
 if(V7)v7start()}
function init(){K=window.RJFUN_K||{a:{},tip:{}};return start();
 fetch(BASE+'rjcmp-kartice.json?v='+VER).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){K=j;start()}).catch(function(){})}
/* skripta stoji u banneru iznad popisa proizvoda; DOMContentLoaded na ovoj temi kasni - ceka se da popis postoji */
var pok=0,kren=0;function spreman(){if(kren)return;if(D.querySelector('.product_list_cnt .product_cnt')||D.readyState==='complete'){kren=1;init()}else if(++pok<200)setTimeout(spreman,100)}
spreman();D.addEventListener('DOMContentLoaded',spreman);
})();
