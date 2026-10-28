/* ===== Calm space ===== */
const audio = () => $('#mantra');
let breathT = null, breathEnd = 0, breathTick = null;
function stopBreath() { clearTimeout(breathT); clearInterval(breathTick); breathT = null; breathTick = null; }
const PHASES = [
  { w: 'Deep breath in', s: 0.86, d: 3000 },
  { w: 'And in again', s: 1, d: 1300 },
  { w: 'Slowly out', s: 0.55, d: 6700 },
];
function runBreath(k) {
  const c = $('.breath .c'), w = $('.breath .w'), rp = $('.breath .rp');
  if (!c) return stopBreath();
  if (Date.now() >= breathEnd && k === 0) { stopBreath(); w.textContent = 'Well done'; c.style.transitionDuration = '1.5s'; c.style.transform = 'scale(.55)'; const b = $('#breathBtn'); if (b) b.textContent = 'Another round'; const t = $('#breathLeft'); if (t) t.textContent = 'You took a moment for yourself. That counts.'; return; }
  const p = PHASES[k];
  c.style.transitionDuration = p.d + 'ms'; c.style.transform = 'scale(' + p.s + ')'; w.textContent = p.w;
  if (k === 2 && rp) { rp.classList.remove('go'); void rp.offsetWidth; rp.classList.add('go'); }
  breathT = setTimeout(() => runBreath((k + 1) % 3), p.d);
}
A.breath = () => {
  if (breathT) { stopBreath(); const c = $('.breath .c'); c.style.transitionDuration = '1.2s'; c.style.transform = 'scale(.55)'; $('.breath .w').textContent = 'Paused'; $('#breathBtn').textContent = 'Start again'; return; }
  breathEnd = Date.now() + 5 * 60 * 1000; $('#breathBtn').textContent = 'Stop';
  const upd = () => { const l = Math.max(0, breathEnd - Date.now()), t = $('#breathLeft'); if (t && breathT) t.textContent = Math.floor(l / 60000) + ':' + pad(Math.floor(l / 1000) % 60) + ' left'; };
  upd(); breathTick = setInterval(upd, 1000); runBreath(0);
  const dd = day(); dd.calm = (dd.calm || []).concat(['breathe']); save('days/' + TODAY);
};
let calmMsg = '', calmName = '';
V.calm = () => {
  const q = C.calm.map(i => C.thoughts[i]);
  const trusted = S.safety.people[0];
  return '<main class="wrap nonav" style="gap:22px">'
    + '<div class="between"><span class="pill">Calm space</span>' + closeBtn() + '</div>'
    + '<div class="col" style="gap:6px"><h1 class="h1" style="font-size:clamp(32px,9vw,40px)">Pause. Maharaj &amp; Swami are with you in this moment.</h1><p class="sub">Pick one thing.</p></div>'
    + '<section class="calmTop"><span class="eyebrow" style="color:var(--peachT)">Breathe</span><div class="breath" aria-live="polite"><div class="rp"></div><div class="c"></div><div class="w">Ready when you are</div></div>'
    + '<span style="font-size:13px;color:#CDBBA8">Double breath in through the nose, long sigh out · 5 minutes</span><span id="breathLeft" style="font-size:14px;color:#F7F1E8;min-height:20px"></span>'
    + '<button id="breathBtn" class="btn" style="height:50px" data-a="breath">Start</button></section>'
    + malaBanner()
    + kindCard()
    + '<section class="card player"><div class="seg" role="group" aria-label="Choose a recording" style="grid-template-columns:repeat(2,minmax(0,1fr))">' + TRACKS.map((tr, i) => '<button class="' + (trackIdx() === i ? 'on' : '') + '" style="height:auto;min-height:40px;padding:6px 8px;font-size:13px;line-height:1.2" data-a="pickTrack" data-i="' + i + '" aria-pressed="' + (trackIdx() === i) + '">' + tr.short + '</button>').join('') + '</div>'
    + '<div class="row"><img src="' + IMG(curTrack().img) + '" alt="' + curTrack().sub + '"><div class="col" style="gap:2px;flex:1;min-width:0"><span class="serif" style="font-size:21px;line-height:1.1">' + curTrack().title + '</span><span class="small">' + curTrack().sub + '</span></div>'
    + '<button class="iconbtn" id="playBtn" style="width:54px;height:54px;border-radius:27px;background:var(--sa);color:#fff" data-a="play" aria-label="Play">' + I.play + '</button></div>'
    + '<input type="range" id="seek" min="0" max="' + curTrack().len + '" step="1" value="0" aria-label="Position in the recording" data-in="seek">'
    + '<div class="between small"><span id="tCur">0:00</span><div class="row" style="gap:8px"><button class="chip" data-a="skip" data-s="-15" aria-label="Back 15 seconds">−15</button><button class="chip" data-a="skip" data-s="15" aria-label="Forward 15 seconds">+15</button></div><span id="tDur">20:15</span></div></section>'
    + '<section class="col" style="gap:10px"><h2 class="h2">People</h2>'
    + (trusted ? '<div class="card between"><div class="col"><span style="font-weight:600;font-size:16px">Call ' + esc(trusted.name) + '</span><span class="small" style="user-select:all">' + esc(trusted.phone) + '</span></div><a class="iconbtn" style="background:var(--sa);color:#fff" href="tel:' + esc(trusted.phone.replace(/\s/g, '')) + '" aria-label="Call ' + esc(trusted.name) + '">' + I.phone + '</a></div>'
      : '<button class="card between" style="border:none;text-align:left" data-a="go" data-v="safety"><span class="col"><span style="font-weight:600;font-size:16px">Call someone I trust</span><span class="small">Add them in your safety plan</span></span>' + I.right + '</button>')
    + '<button class="btn soft" data-a="go" data-v="safety">My safety plan</button></section>'
    + '<button class="card between" style="border:none;text-align:left;width:100%" data-a="calmMore"><span class="col" style="gap:2px"><span class="serif" style="font-size:20px">Words to hold on to</span><span class="small">Mind, not me · words from the gurus</span></span><span class="chev" style="' + (calmMore ? 'transform:rotate(180deg)' : '') + '">' + I.down + '</span></button>'
    + (calmMore ? ''
    + '<section class="card" style="display:flex;flex-direction:column;gap:12px;background:var(--tint)"><span class="eyebrow">Mind, not me</span><p class="serif" style="font-size:22px;line-height:1.3">I am atma. This heaviness is passing through my mind. It is real, and it will pass. It is not who I am.</p>'
    + '<label for="calmName" class="small" style="color:var(--muted)">My mind is telling me that…</label><input id="calmName" class="field it" placeholder="Type it, or skip" data-in="calmName" data-enter="calmNamed" value="' + esc(calmName) + '">'
    + (calmMsg ? '<p class="fade" style="font-size:15px;color:var(--saT)">' + calmMsg + '</p>' : '')
    + '<button class="link" style="align-self:flex-start" data-a="openTeach" data-t="Body and soul">Read “Body and soul”</button></section>'
    + '<section class="col" style="gap:12px"><h2 class="h2">Words from the gurus</h2><div class="carousel">' + q.map(x => '<div class="card" style="width:min(82%,340px);display:flex;flex-direction:column;gap:10px;justify-content:space-between"><p class="quote" style="font-size:20px">“' + esc(x.t) + '”</p><div class="col" style="gap:2px"><span class="by">' + esc(x.by) + '</span><span class="small">' + esc(x.src) + '</span></div></div>').join('') + '</div></section>'
    : '')
    + '<section class="col" style="gap:10px;align-items:center;text-align:center;padding-top:6px"><span class="serif it" style="font-size:20px">How do you feel now?</span><div class="chips" style="justify-content:center">' + ['A bit lighter', 'The same', 'Heavier'].map(t => '<button class="chip" data-a="calmAfter" data-t="' + t + '">' + t + '</button>').join('') + '</div><p id="calmAfterMsg" class="small" style="min-height:20px"></p></section>'
    + '</main>';
};
let calmMore = false;
A.calmMore = () => { calmMore = !calmMore; render(true); };
V.calm_after = () => bindPlayer();
INP.calmName = el => { calmName = el.value; };
A.calmNamed = () => { if (calmName.trim().length < 2) return; calmMsg = 'That\'s the mind talking, not you. You are atma, watching the thought pass.'; render(true); };
A.calmAfter = el => { const t = el.dataset.t; const dd = day(); dd.calm = (dd.calm || []).concat(['after:' + t]); save('days/' + TODAY); const m = $('#calmAfterMsg'); if (m) m.textContent = t === 'Heavier' ? 'Thank you for being honest. Reach for one of your people above, or your safety plan.' : 'You took a moment for yourself. That counts.'; };
const TRACKS = [
  { id: 'psm', src: 'audio/mantra.mp3', title: 'Swaminarayan Mantra', short: 'Swaminarayan Mantra', sub: 'Pramukh Swami Maharaj', img: '06', len: 1215 },
  { id: 'msm', src: 'audio/aksharam.mp3', title: 'Aksharam Aham Purushottam Dasosmi', short: 'Aksharam Aham…', sub: 'Mahant Swami Maharaj', img: '37', len: 1203 },
];
try { localStorage.removeItem('mantraPos'); } catch (e) {}
function trackIdx() { let i = 0; try { i = +localStorage.getItem('chhaya-track') || 0; } catch (e) {} return TRACKS[i] ? i : 0; }
function curTrack() { return TRACKS[trackIdx()]; }
function posKey() { return 'mantraPos_' + curTrack().id; }
function mDur() { const a = audio(), d = a && a.duration, L = curTrack().len; return (isFinite(d) && Math.abs(d - L) < 30) ? d : L; }
A.pickTrack = el => { const i = +el.dataset.i; if (i === trackIdx()) return; const a = audio(); try { localStorage.setItem(posKey(), String(a.currentTime || 0)); } catch (e) {} a.pause(); try { localStorage.setItem('chhaya-track', String(i)); } catch (e) {} a.setAttribute('src', TRACKS[i].src); a.load(); delete a.dataset.resume; render(true); if (breathT) { const b = $('#breathBtn'); if (b) b.textContent = 'Stop'; } };
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + pad(s % 60); };
function bindPlayer() {
  const a = audio(), seek = $('#seek'); if (!a || !seek) return;
  const sync = () => { const s = $('#seek'); if (!s) return; const d = mDur(); s.max = Math.floor(d); if (!s.matches(':active')) s.value = Math.floor(a.currentTime); s.style.setProperty('--p', (a.currentTime / d * 100) + '%'); $('#tCur').textContent = fmt(a.currentTime); $('#tDur').textContent = fmt(d); const b = $('#playBtn'); if (b) { b.innerHTML = a.paused ? I.play : I.pause; b.setAttribute('aria-label', a.paused ? 'Play' : 'Pause'); } };
  if (!a.dataset.bound) { a.dataset.bound = 1; ['timeupdate', 'play', 'pause', 'loadedmetadata'].forEach(ev => a.addEventListener(ev, () => { sync(); if (ev === 'timeupdate') { try { localStorage.setItem(posKey(), String(a.currentTime)); } catch (e) {} } })); a.addEventListener('ended', () => { try { localStorage.setItem(posKey(), '0'); } catch (e) {} }); }
  if (a.getAttribute('src') !== curTrack().src) { a.setAttribute('src', curTrack().src); }
  if (!a.currentTime) { let p = 0; try { p = +localStorage.getItem(posKey()) || 0; if (p > curTrack().len - 15) p = 0; } catch (e) {} if (p) { a.dataset.resume = p; seek.value = p; $('#tCur').textContent = fmt(p); seek.style.setProperty('--p', (p / curTrack().len * 100) + '%'); } }
  sync();
}
A.play = () => { const a = audio(); if (a.getAttribute('src') !== curTrack().src) { a.setAttribute('src', curTrack().src); } if (a.ended || (a.duration && a.currentTime > a.duration - 2)) { try { a.currentTime = 0; } catch (e) {} } if (a.paused) { if (a.dataset.resume) { const p = +a.dataset.resume; delete a.dataset.resume; const set = () => { try { a.currentTime = p; } catch (e) {} }; if (a.readyState > 0) set(); else a.addEventListener('loadedmetadata', set, { once: true }); } a.play().catch(err => { logErr('audio', (err && (err.name + ' ' + err.message)) + ' src=' + a.getAttribute('src') + ' net=' + a.networkState + ' ready=' + a.readyState + ' mediaErr=' + (a.error ? a.error.code : '-')); toast('Couldn\'t start the recording. Tap play once more.'); try { a.load(); } catch (x) {} }); const dd = day(); dd.calm = (dd.calm || []).concat([curTrack().id === 'psm' ? 'mantra' : 'aksharam']); save('days/' + TODAY); } else a.pause(); };
A.skip = el => { const a = audio(); a.currentTime = Math.max(0, Math.min(mDur(), a.currentTime + +el.dataset.s)); };
INP.seek = el => { const a = audio(); a.currentTime = +el.value; el.style.setProperty('--p', (el.value / mDur() * 100) + '%'); $('#tCur').textContent = fmt(+el.value); };

/* ===== Darshan feed ===== */
let FEED = null, feedHidden = false, tapStart = null;
function ownList() { return Object.values(S.mydarshan || {}).filter(x => x && x.photo && !x.deleted).sort((a, b) => (a.added || '') < (b.added || '') ? 1 : -1); }
function buildFeed() {
  const ms = shuffle(C.murtis), ts = shuffle(C.thoughts.map((_, i) => i));
  FEED = ts.map((ti, k) => ({ m: ms[k % ms.length], ti }));
  shuffle(ownList()).forEach((o, j) => { const at = Math.min(FEED.length, 1 + Math.floor(Math.random() * Math.min(FEED.length, 12 + j * 6))); FEED.splice(at, 0, { own: o.id, ti: ts[j % ts.length] }); });
}
function pairView(f) {
  if (f.own) { const o = S.mydarshan[f.own]; if (o) { const hasQ = o.quote && o.quote.trim(); return { photo: o.photo, t: hasQ ? o.quote.trim() : C.thoughts[f.ti].t, by: hasQ ? (o.by || 'Added by you') : C.thoughts[f.ti].by, mine: true }; } }
  const q = C.thoughts[f.ti]; return { src: IMG(f.m || '37'), t: q.t, by: q.by };
}
const imgTag = (v, alt, extra) => v.photo ? '<img ' + (photoSrc(v.photo) ? 'src="' + photoSrc(v.photo) + '"' : 'data-photo="' + esc(v.photo) + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="') + ' alt="' + alt + '" ' + (extra || '') + '>' : '<img src="' + v.src + '" alt="' + alt + '" ' + (extra || '') + '>';
V.feed = p => {
  feedHidden = false;
  buildFeed();
  if (p && p.start) FEED.unshift(p.start);
  return '<div class="feed" role="region" aria-label="Darshan feed"><div class="top"><span class="pill" style="background:rgba(255,255,255,.18);color:#fff;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)">Darshan</span><span class="row" style="gap:8px"><button class="glass" data-a="go" data-v="mydarshan" aria-label="Add my own darshan">' + I.plus + '</button><button class="glass" data-a="feedClose" aria-label="Close">' + I.close + '</button></span></div>'
    + '<div class="side"><button class="glass heart" id="heart" data-a="feedSave" aria-label="Save this darshan">' + I.heart(false) + '</button><button class="glass" data-a="feedShare" aria-label="Share this darshan">' + I.share + '</button></div>'
    + '<div class="sc' + (feedHidden ? ' hidden' : '') + '" id="feedSc">' + FEED.map((f, k) => { const v = pairView(f); return '<div class="it" data-k="' + k + '">' + imgTag(v, v.mine ? 'My darshan photo' : 'Darshan murti', (k > 2 && !v.photo ? 'loading="lazy" ' : '') + 'decoding="async"') + '<button class="tap" aria-label="Show or hide the words"></button><div class="q">' + (v.mine ? '<span class="pill" style="height:24px;font-size:11px;background:rgba(255,255,255,.2);color:#fff;margin-bottom:10px">My darshan</span>' : '') + '<p>“' + esc(v.t) + '”</p><div class="by" style="color:var(--peachT)">' + esc(v.by) + '</div></div></div>'; }).join('') + '</div></div>';
};
function feedIdx() { const sc = $('#feedSc'); return sc ? Math.round(sc.scrollTop / sc.clientHeight) : 0; }
function feedKey(k) { const f = FEED[k]; return f.own ? 'own|' + f.own : f.m + '|' + f.ti; }
function syncHeart() { const h = $('#heart'); if (!h) return; const on = S.saved.darshan.includes(feedKey(feedIdx())); h.classList.toggle('on', on); h.innerHTML = I.heart(on); h.setAttribute('aria-pressed', on); }
V.feed_after = () => { const sc = $('#feedSc'); fillPhotos(sc);
  let moved = false, lastIdx = 0;
  sc.addEventListener('scroll', () => { moved = true; clearTimeout(sc._t); sc._t = setTimeout(() => { syncHeart(); const k = feedIdx(); if (k !== lastIdx) { lastIdx = k; if (feedHidden) { feedHidden = false; sc.classList.remove('hidden'); } } }, 80); }, { passive: true });
  sc.addEventListener('pointerdown', e => { tapStart = { x: e.clientX, y: e.clientY, t: Date.now(), top: sc.scrollTop }; moved = false; });
  sc.addEventListener('pointerup', e => { if (!tapStart || !e.target.closest('.tap')) return; const d = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y); if (d < 10 && Date.now() - tapStart.t < 350 && Math.abs(sc.scrollTop - tapStart.top) < 4) { feedHidden = !feedHidden; sc.classList.toggle('hidden', feedHidden); } tapStart = null; });
  sc.addEventListener('pointercancel', () => { tapStart = null; }); syncHeart(); const dd = day(); if (!dd.feed) { dd.feed = true; save('days/' + TODAY); } };
A.feedClose = () => { stack = []; go('today', null, { replace: true }); };
A.feedTap = () => { feedHidden = !feedHidden; $('#feedSc').classList.toggle('hidden', feedHidden); };
A.feedMove = el => { const sc = $('#feedSc'); sc.scrollTo({ top: (feedIdx() + +el.dataset.d) * sc.clientHeight, behavior: 'smooth' }); };
A.feedSave = el => { const k = feedKey(feedIdx()), a = S.saved.darshan, i = a.indexOf(k); if (i > -1) a.splice(i, 1); else { a.unshift(k); const b = document.createElement('span'); b.className = 'burst'; el.appendChild(b); setTimeout(() => b.remove(), 650); if (navigator.vibrate) try { navigator.vibrate(15); } catch (e) {} } save('saved'); syncHeart(); };

/* ===== Grow ===== */
const GUIDES = [
  { k: 'motivation', n: 'When motivation is gone', bg: '#B8400E' },
  { k: 'lowmood', n: 'Low mood days', bg: '#3E5A86' },
  { k: 'anxiety', n: 'Anxiety in the body', bg: '#2E7556' },
  { k: 'overthinking', n: 'Overthinking', bg: '#6B4A8C' },
  { k: 'sleep', n: 'Sleep', bg: '#2F4468' },
  { k: 'job', n: 'Job-search stress', bg: '#96610C' },
  { k: 'rtms', n: 'Getting through rTMS', bg: '#A23B4F' },
  { k: 'satsang', n: 'Why satsang helps the mind', bg: '#1F6F78' },
];
const TEACH_MURTI = ['39', '06', '37', '26', '22', '24', '12', '28', '05', '41'];
const KIRTANS = [{ id: 'k1', t: 'Jeevan Janun Chhun – Praptino Vichar', ch: 'BAPS Kirtan Channel', row: 'Prapti and joy', url: 'https://www.youtube.com/watch?v=f6fRq6w_KWg' }];
const ROWS = ['Prapti and joy', 'Calm and peace', 'Strength on hard days', 'Katha'];
let listenRow = 'All', addOpen = false, addRow = 'Prapti and joy';
function mediaAll() { return KIRTANS.concat((S.media.items || []).map(x => Object.assign({ own: true }, x))); }
function hostOf(u) { try { const h = new URL(u).hostname.replace(/^www\.|^m\./, ''); return /youtu/.test(h) ? 'YouTube' : h; } catch (e) { return 'Link'; } }
function listenHTML() {
  const all = mediaAll(), shown = listenRow === 'All' ? all : all.filter(k => k.row === listenRow);
  return '<section class="col" style="gap:12px"><div class="between"><h2 class="h2">Listen &amp; watch</h2><button class="link" data-a="mediaOpen">' + (addOpen ? 'Cancel' : '+ Add a link') + '</button></div>'
    + (addOpen ? '<div class="card col fade" style="gap:10px"><label for="mUrl" class="small">Paste a YouTube (or any) link</label><input id="mUrl" class="field" style="font-family:var(--sans);font-size:16px" type="url" inputmode="url" placeholder="https://youtube.com/…" aria-label="Link">'
      + '<label for="mTitle" class="small">What is it?</label><input id="mTitle" class="field" style="font-size:19px" placeholder="e.g. Swami ni vato katha" aria-label="Title" data-enter="mediaAdd">'
      + '<div class="chips">' + rowsAll().map(r => '<button class="chip' + (addRow === r ? ' on' : '') + '" data-a="mediaRow" data-r="' + esc(r) + '">' + esc(r) + '</button>').join('') + (tagNew ? '<span class="row" style="gap:6px"><input id="mTag" class="inp" style="height:38px;width:150px;font-size:15px" placeholder="e.g. Arti" data-enter="mediaTagAdd"><button class="chip on" data-a="mediaTagAdd">Add</button></span>' : '<button class="chip" style="background:transparent;border:1.5px dashed var(--rule)" data-a="mediaTagNew">+ New tag</button>') + '</div>'
      + '<button class="btn sm" style="align-self:flex-start" data-a="mediaAdd">Save</button></div>' : '')
    + '<div class="chips">' + ['All'].concat(rowsAll()).map(r => '<button class="chip' + (listenRow === r ? ' on' : '') + '" data-a="listenRow" data-r="' + esc(r) + '">' + esc(r) + '</button>').join('') + '</div>'
    + (shown.length ? shown.map(k => '<div class="card between" style="padding:14px"><button class="row" data-a="playVideo" data-u="' + esc(k.url) + '" data-t="' + esc(k.t) + '" style="border:none;background:none;padding:0;text-align:left;flex:1;min-width:0"><span style="width:52px;height:52px;border-radius:14px;background:var(--sa);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + I.play + '</span><span class="col" style="min-width:0"><span style="font-weight:600;font-size:16px;overflow-wrap:anywhere">' + esc(k.t) + '</span><span class="small">' + esc(k.row) + ' · ' + esc(k.ch || hostOf(k.url)) + '</span></span></button>'
      + (k.own ? '<button class="chip" style="min-height:32px;padding:4px 12px;font-size:12px;flex-shrink:0" data-a="mediaRetag" data-id="' + esc(k.id) + '">Tag</button><button class="xbtn" style="margin-left:4px" data-a="mediaRm" data-id="' + esc(k.id) + '" aria-label="Remove ' + esc(k.t) + '">' + I.close + '</button>' : '<span style="color:var(--hint);flex-shrink:0">' + I.ext + '</span>') + '</div>').join('')
      : '<p class="sub">Nothing here yet. Tap “+ Add a link” to add one.</p>')
    + '</section>';
}
A.listenRow = el => { listenRow = el.dataset.r; render(true); };
A.mediaOpen = () => { addOpen = !addOpen; render(true); if (addOpen) setTimeout(() => $('#mUrl') && $('#mUrl').focus(), 30); };
A.mediaRow = el => { addRow = el.dataset.r; keepAdd(() => render(true)); };
let tagNew = false;
function rowsAll() { return ROWS.concat((S.media.tags || []).filter(t => !ROWS.includes(t))); }
function keepAdd(fn) { const u = ($('#mUrl') || {}).value || '', t = ($('#mTitle') || {}).value || ''; fn(); if ($('#mUrl')) $('#mUrl').value = u; if ($('#mTitle')) $('#mTitle').value = t; }
A.mediaTagNew = () => { tagNew = true; keepAdd(() => render(true)); setTimeout(() => $('#mTag') && $('#mTag').focus(), 30); };
A.mediaTagAdd = () => { const v = (($('#mTag') || {}).value || '').trim(); tagNew = false; if (v) { S.media.tags = (S.media.tags || []).filter(x => x !== v).concat([v]); addRow = v; save('media'); } keepAdd(() => render(true)); };
A.mediaRetag = el => { const id = el.dataset.id; sheet('<div class="between"><span class="h2">Tag</span>' + closeBtn('closeSheet') + '</div><div class="chips">' + rowsAll().map(r => '<button class="chip" data-a="mediaRetagSet" data-id="' + esc(id) + '" data-r="' + esc(r) + '">' + esc(r) + '</button>').join('') + '</div>'); };
A.mediaRetagSet = el => { const it = (S.media.items || []).find(x => x.id === el.dataset.id); if (it) { it.row = el.dataset.r; save('media'); } closeSheet(); render(true); };
A.mediaAdd = () => {
  let u = $('#mUrl').value.trim(), t = $('#mTitle').value.trim();
  const m = u.match(/https?:\/\/\S+/); if (!m) return toast('Paste a link that starts with https://');
  u = m[0]; try { new URL(u); } catch (e) { return toast('That link doesn\'t look right'); }
  S.media.items = (S.media.items || []).concat([{ id: uid(), t: t || (hostOf(u) === 'YouTube' ? 'YouTube video' : 'Link'), url: u, row: addRow, added: TODAY }]);
  save('media'); addOpen = false; listenRow = addRow; render(true); toast('Added');
};
A.mediaRm = el => { S.media.items = (S.media.items || []).filter(x => x.id !== el.dataset.id); save('media'); render(true); };
V.grow = () => {
  const read = S.settings.read || {};
  return '<main class="wrap">'
    + skyHead('<h1 class="hello">Grow</h1><p class="skysub">Satsang to sit with, and small tools for hard moments.</p>')
    + '<section class="col" style="gap:12px"><div class="between"><h2 class="h2">Teachings</h2><span class="small">5 minutes each</span></div><div class="carousel">'
    + teachOrder().map(i => { const t = C.teachings[i], rn = readN(i); return '<button class="arch" data-a="teach" data-i="' + i + '"><img src="' + IMG(TEACH_MURTI[i % TEACH_MURTI.length]) + '" alt=""><span class="b"><span class="eyebrow">' + (rn ? 'Read ' + (rn === 1 ? 'once' : rn + ' times') : i < 3 ? 'Start here' : 'New') + '</span><span class="serif" style="font-size:22px;line-height:1.1">' + esc(t.title) + '</span><span class="small">' + esc(t.take) + '</span></span></button>'; }).join('')
    + '</div></section>'
    + (hidden('rtms') ? '' : '<button class="darkcard" data-a="go" data-v="rtms" style="border:none;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;background:#A23B4F"><span class="col" style="gap:4px"><span class="eyebrow" style="color:#FFD3DC">rTMS · from 19 October</span><span class="serif" style="font-size:24px;line-height:1.1">' + (S.rtms.sessions.length ? 'Session ' + S.rtms.sessions.length + '. Keep going.' : 'Feel prepared before you start') + '</span></span>' + I.right.replace('#B3A393', '#fff') + '</button>')
    + '<section class="col" style="gap:12px"><h2 class="h2">Guides</h2><div class="tiles">' + GUIDES.filter(g => !(g.k === 'job' && hidden('job')) && !(g.k === 'rtms' && hidden('rtms'))).map(g => '<button class="tile" style="background:' + g.bg + '" data-a="guide" data-k="' + g.k + '">' + gicon(g.k) + '<span class="n">' + g.n + '</span></button>').join('') + '</div></section>'
    + listenHTML()


    + '</main>';
};
A.teach = el => go('teaching', { i: +el.dataset.i, s: 0 });
A.openTeach = el => { const i = C.teachings.findIndex(t => t.title === el.dataset.t); if (i > -1) go('teaching', { i, s: 0 }); };
A.guide = el => { if (el.dataset.k === 'rtms') return go('rtms'); go('guide', { k: el.dataset.k, s: 0 }); };

/* ===== Teaching ===== */
let teachAns = '';
V.teaching = p => {
  const t = C.teachings[p.i], parts = (t.scan ? ['__scan__'] : []).concat(t.parts), total = parts.length + 3, s = p.s;
  const dots = '<div class="dots" aria-label="Step ' + (s + 1) + ' of ' + total + '">' + Array.from({ length: total }, (_, k) => '<span class="' + (k === s ? 'on' : k < s ? 'past' : '') + '"></span>').join('') + '</div>';
  let body;
  if (s === 0) body = '<div class="grow1 fade" style="justify-content:flex-start"><div style="border-radius:160px 160px 26px 26px;overflow:hidden;height:clamp(260px,42vh,360px)"><img src="' + IMG(TEACH_MURTI[p.i % TEACH_MURTI.length]) + '" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center 22%"></div><span class="eyebrow">' + esc(t.by) + ' · ' + t.mins + ' minutes</span><h1 class="h1" style="font-size:clamp(34px,9.6vw,42px)">' + esc(t.title) + '</h1><p class="sub"><b style="color:var(--ink)">In short:</b> ' + esc(t.take) + '</p></div>';
  else if (s <= parts.length) {
    const part = parts[s - 1];
    body = part === '__scan__' ? '<div class="grow1 fade" style="justify-content:flex-start"><span class="eyebrow">In his own handwriting</span><img src="' + t.scan + '" alt="Handwritten letter by Mahant Swami Maharaj" style="width:100%;border-radius:18px;background:#fff"><p class="small">Swipe on to read it typed.</p></div>'
      : '<div class="grow1 fade"><span class="eyebrow">' + (s - (t.scan ? 1 : 0)) + ' of ' + t.parts.length + '</span><div class="col" style="gap:14px">' + part.split('\n').map(x => '<p class="serif" style="font-size:clamp(21px,6vw,24px);line-height:1.38">' + esc(x) + '</p>').join('') + '</div>' + (s === parts.length ? '<p class="small">' + esc(t.src) + (t.url ? ' · <a href="' + esc(t.url) + '" target="_blank" rel="noopener">baps.org</a>' : '') + '</p>' : '') + '</div>';
  } else if (s === parts.length + 1) body = '<div class="grow1 fade"><span class="eyebrow">Reflect</span><h2 class="h1" style="font-size:clamp(28px,8vw,36px)">' + esc(reflectQ(p.i)) + '</h2><textarea id="teachAns" class="ruled" style="height:136px" placeholder="Write a line or two…" data-in="teachAns">' + esc(teachAns) + '</textarea><p class="small">Saved to your prapti journal.</p></div>';
  else body = '<div class="grow1 fade" style="text-align:center;align-items:center"><span class="eyebrow">Carry it today</span><p class="serif it" style="font-size:clamp(26px,7.4vw,32px);line-height:1.25">' + esc(t.take) + '</p><p class="small">Our summary, not the guru\'s words.</p><button class="btn" style="max-width:320px" data-a="pinTake" data-i="' + p.i + '">' + (day().pin === t.take ? 'Pinned to Today' : 'Pin to Today') + '</button></div>';
  return '<main class="stage"><div class="between">' + dots + closeBtn('teachClose') + '</div>' + body
    + '<div class="navbtns">' + (s > 0 ? '<button class="back" data-a="teachStep" data-d="-1" aria-label="Back">' + I.back + '</button>' : '') + '<button class="btn" style="background:var(--dark)" data-a="teachStep" data-d="1">' + (s === 0 ? 'Begin' : s === total - 1 ? 'Finish' : 'Continue') + '</button></div></main>';
};
INP.teachAns = el => { teachAns = el.value; };
function saveReflection(p) { if (!teachAns.trim()) return; const t = C.teachings[p.i], dd = day(); dd.notes = (dd.notes || []).filter(n => n.src !== t.title).concat([{ src: t.title, q: reflectQ(p.i), a: teachAns.trim() }]); save('days/' + TODAY); }
A.teachStep = el => { const p = route.p, t = C.teachings[p.i], total = t.parts.length + (t.scan ? 1 : 0) + 3; if (p.s === total - 3 + 1) saveReflection(p); const n = p.s + +el.dataset.d; if (n >= total) { S.settings.read = Object.assign(S.settings.read || {}, { ['t' + p.i]: TODAY }); S.settings.readN = Object.assign({}, S.settings.readN, { ['t' + p.i]: readN(p.i) + 1 }); save('settings'); teachAns = ''; return back('grow'); } p.s = Math.max(0, n); render(); window.scrollTo(0, 0); };
A.teachClose = () => { saveReflection(route.p); teachAns = ''; back('grow'); };
A.pinTake = el => { day().pin = C.teachings[+el.dataset.i].take; save('days/' + TODAY); toast('Pinned to Today'); render(true); };

function readN(i) { const n = (S.settings.readN || {})['t' + i]; return n || ((S.settings.read || {})['t' + i] ? 1 : 0); }
function reflectQ(i) { const t = C.teachings[i], L = t.reflects && t.reflects.length ? t.reflects : [t.reflect]; return L[readN(i) % L.length]; }
function teachOrder() { const rd = S.settings.read || {}; return C.teachings.map((t, i) => i).sort((a, b) => (readN(a) - readN(b)) || String(rd['t' + a] || '').localeCompare(String(rd['t' + b] || '')) || a - b); }
