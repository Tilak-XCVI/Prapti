/* ===== Prapti v1.1: teachings library, full history, What's new, health report PDF, Tilak's dashboard ===== */
const APP_VERSION = '1.2';
/* Her-facing update log. Tilak's admin changes are deliberately left out. Newest first. */
const CHANGELOG = [
  { v: '1.2', date: '', items: [
    'Check in as often as you like: every check-in through the day is now kept, and tapping a day shows how you felt from morning to night.',
    'Backups in Me: a copy of everything is saved every night, and you can keep one in Google Drive.',
  ] },
  { v: '1.1', date: '2026-09-29', items: [
    'A teachings library: 178 teachings in 9 themes, with search, picks for how you\'re feeling, and a Completed shelf so new ones come first.',
    'Your week in Prapti: a short story of your week, ready every Sunday evening.',
    'Me now keeps your whole journey: every month since you began, all-time totals and every week.',
    'Tap any day on your calendar to see its full story.',
    '"What lifted you today?" in the evening, one tap.',
    'Be kind to yourself, in Calm: a short, hands-on pause for when you\'re being hard on yourself.',
    'Two short anxiety questions in the weekly check-in.',
    '"What seems to help": gentle patterns, once you\'ve checked in on 10 days.',
    'Your health report is now a PDF you can send to your GP or clinic.',
    'See what\'s happened to the ideas you send Tilak.',
  ] },
  { v: '1.0', date: '2026-09-29', items: ['Prapti begins: Today, Darshan, Calm, Grow and Me.'] },
];

/* ---------- small helpers ---------- */
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const fold = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
function monAdd(mm, k) { let y = +mm.slice(0, 4), m = +mm.slice(5, 7) - 1 + k; y += Math.floor(m / 12); m = ((m % 12) + 12) % 12; return y + '-' + String(m + 1).padStart(2, '0'); }
const monLabel = mm => parse(mm + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
function firstDay() { return Object.keys(S.days).filter(d => showedUp(d) || dayCheck(d) || (S.days[d].opens || []).length).sort()[0] || null; }
const BOOKMARK = on => '<svg width="20" height="20" viewBox="0 0 24 24" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
const SEARCHI = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
const TICKI = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>';
I.admin = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7.5" height="9" rx="2"/><rect x="13.5" y="3" width="7.5" height="5.5" rx="2"/><rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2"/><rect x="3" y="15" width="7.5" height="6" rx="2"/></svg>';

/* ===================== Teachings library ===================== */
const THEMES = C.themes || [];
const themeName = k => (THEMES.find(t => t[0] === k) || ['', 'Teachings'])[1];
const NEEDS = [['calm', 'Calm'], ['strength', 'Strength'], ['hope', 'Hope'], ['story', 'A story'], ['learn', 'Something to learn']];
// The first 20 teachings keep their original keys (t0 to t19) so her reading history carries over; the rest use stable ids.
const tkey = i => i < 20 ? 't' + i : 't:' + C.teachings[i].id;
function readN(i) { const k = tkey(i), n = (S.settings.readN || {})[k]; return n || ((S.settings.read || {})[k] ? 1 : 0); }
const lastRead = i => (S.settings.read || {})[tkey(i)] || '';
function reflectQ(i) { const t = C.teachings[i], L = t.reflects && t.reflects.length ? t.reflects : [t.reflect]; return L[readN(i) % L.length]; }
function teachOrder() { return C.teachings.map((t, i) => i).sort((a, b) => (readN(a) - readN(b)) || lastRead(a).localeCompare(lastRead(b)) || a - b); }
const tSaved = () => S.settings.tsaved || [];
const isSaved = i => tSaved().includes(C.teachings[i].id);
const doneList = () => C.teachings.map((t, i) => i).filter(i => readN(i) > 0).sort((a, b) => lastRead(b).localeCompare(lastRead(a)));
let tNeed = '';
function pickFor(need, n) {
  n = n || 6;
  const all = C.teachings.map((t, i) => i), fits = i => !need || (C.teachings[i].needs || []).includes(need);
  let c = all.filter(i => !readN(i) && fits(i));
  if (!need) { const ck = dayCheck(TODAY); if (ck && !PLEASANT(ck.q)) { const soft = c.filter(i => { const t = C.teachings[i]; return t.theme === 'heavy' || (t.needs || []).some(x => x === 'calm' || x === 'hope'); }); if (soft.length >= n) c = soft; } }
  c.sort((a, b) => hashStr(TODAY + C.teachings[a].id) - hashStr(TODAY + C.teachings[b].id));
  if (!doneList().length && !need) c = [0, 1, 2].concat(c.filter(i => i > 2));
  if (c.length < n) c = c.concat(all.filter(i => !c.includes(i) && fits(i)).sort((a, b) => readN(a) - readN(b)));
  return c.slice(0, n);
}
function archCard(i) {
  const t = C.teachings[i], rn = readN(i);
  return '<button class="arch" data-a="teach" data-i="' + i + '"><img src="' + IMG(TEACH_MURTI[i % TEACH_MURTI.length]) + '" alt=""><span class="b"><span class="eyebrow">' + (rn ? 'Read ' + (rn === 1 ? 'once' : rn + ' times') : esc(themeName(t.theme))) + '</span><span class="serif" style="font-size:22px;line-height:1.1">' + esc(t.title) + '</span><span class="small">' + esc(t.take) + '</span></span></button>';
}
const needChips = (act) => '<div class="hscroll" role="group" aria-label="What do you need today?">' + NEEDS.map(n => '<button class="chip' + (tNeed === n[0] ? ' on' : '') + '" data-a="' + act + '" data-k="' + n[0] + '" aria-pressed="' + (tNeed === n[0]) + '">' + n[1] + '</button>').join('') + '</div>';
function growTeach() {
  const read = doneList().length;
  return '<section class="col" style="gap:12px"><div class="between"><h2 class="h2">Teachings</h2><button class="link" data-a="libOpen">Library</button></div>'
    + '<span class="small">What do you need today?</span>' + needChips('tNeed')
    + '<div class="carousel">' + pickFor(tNeed).map(archCard).join('') + '</div>'
    + '<button class="libbtn" data-a="libOpen"><span class="col" style="gap:2px"><span style="font-size:16px;font-weight:600">Browse all ' + C.teachings.length + ' teachings</span><span class="small">' + THEMES.length + ' themes' + (read ? ' · ' + read + ' completed' : '') + '</span></span>' + I.right + '</button></section>';
}
A.libOpen = () => { tNeed = ''; libQ = ''; go('library'); };
A.tNeed = el => { tNeed = tNeed === el.dataset.k ? '' : el.dataset.k; render(true); };
V.grow = () => '<main class="wrap">'
  + skyHead('<h1 class="hello">Grow</h1><p class="skysub">Satsang to sit with, and small tools for hard moments.</p>')
  + growTeach()
  + (hidden('rtms') ? '' : '<button class="darkcard" data-a="go" data-v="rtms" style="border:none;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px;background:#A23B4F"><span class="col" style="gap:4px"><span class="eyebrow" style="color:#FFD3DC">rTMS · from 19 October</span><span class="serif" style="font-size:24px;line-height:1.1">' + (S.rtms.sessions.length ? 'Session ' + S.rtms.sessions.length + '. Keep going.' : 'Feel prepared before you start') + '</span></span>' + I.right.replace('#B3A393', '#fff') + '</button>')
  + '<section class="col" style="gap:12px"><h2 class="h2">Guides</h2><div class="tiles">' + GUIDES.filter(g => !(g.k === 'job' && hidden('job')) && !(g.k === 'rtms' && hidden('rtms'))).map(g => '<button class="tile" style="background:' + g.bg + '" data-a="guide" data-k="' + g.k + '">' + gicon(g.k) + '<span class="n">' + g.n + '</span></button>').join('') + '</div></section>'
  + listenHTML() + '</main>';

function trow(i) {
  const t = C.teachings[i], rn = readN(i);
  return '<button class="trow" data-a="teach" data-i="' + i + '"><img src="' + IMG(TEACH_MURTI[i % TEACH_MURTI.length]) + '" alt="" loading="lazy"><span class="col" style="gap:3px;flex:1;min-width:0"><span class="serif" style="font-size:19px;line-height:1.15">' + esc(t.title) + '</span><span class="small">' + esc(themeName(t.theme)) + ' · ' + (t.mins || 3) + ' min · ' + esc(t.by) + '</span></span>' + (rn ? '<span class="tdone" aria-label="Read">' + TICKI + '</span>' : '') + '</button>';
}
let libQ = '';
const searchText = i => { const t = C.teachings[i]; return t._s || (t._s = fold([t.title, t.by, t.take, t.src, t.ch, themeName(t.theme), (t.needs || []).join(' '), t.quote, (t.parts || []).join(' ')].join(' '))); };
function libResults() {
  const q = fold(libQ).trim();
  if (q) {
    const words = q.split(/\s+/), hits = C.teachings.map((t, i) => i).filter(i => (!tNeed || (C.teachings[i].needs || []).includes(tNeed)) && words.every(w => searchText(i).includes(w)));
    hits.sort((a, b) => (fold(C.teachings[b].title).includes(q) - fold(C.teachings[a].title).includes(q)) || readN(a) - readN(b));
    return hits.length ? '<span class="small">' + hits.length + (hits.length === 1 ? ' teaching' : ' teachings') + '</span><div class="tlist">' + hits.slice(0, 60).map(trow).join('') + '</div>' : '<p class="sub">Nothing found for “' + esc(libQ.trim()) + '”. Try a simpler word, like patience, seva or Yogiji.</p>';
  }
  if (tNeed) {
    const L = C.teachings.map((t, i) => i).filter(i => (C.teachings[i].needs || []).includes(tNeed)).sort((a, b) => readN(a) - readN(b) || a - b);
    return '<span class="small">' + L.length + ' for ' + esc(NEEDS.find(n => n[0] === tNeed)[1].toLowerCase()) + ', new ones first</span><div class="tlist">' + L.map(trow).join('') + '</div>';
  }
  const shelf = (k, name, n, rd, sub) => '<button class="shelfrow" data-a="go" data-v="shelf" data-p=\'{"th":"' + k + '"}\'><span class="col" style="gap:5px;flex:1"><span style="font-size:16px;font-weight:600">' + name + '</span>' + (sub != null ? '<span class="small">' + sub + '</span>' : '<span class="prog"><i style="width:' + (n ? Math.round(rd / n * 100) : 0) + '%"></i></span>') + '</span><span class="small" style="flex-shrink:0">' + (sub != null ? '' : rd ? rd + ' of ' + n : n) + '</span>' + I.right + '</button>';
  const saved = tSaved().length, done = doneList().length;
  return (saved ? '<div class="card" style="padding:2px 18px">' + shelf('saved', 'Saved', saved, 0, saved + (saved === 1 ? ' teaching' : ' teachings') + ' kept for later') + '</div>' : '')
    + '<div class="card" style="padding:2px 18px"><span class="eyebrow" style="display:block;padding-top:14px">Themes</span>' + THEMES.map(th => { const L = C.teachings.filter(t => t.theme === th[0]).length, R = C.teachings.map((t, i) => i).filter(i => C.teachings[i].theme === th[0] && readN(i)).length; return shelf(th[0], th[1], L, R); }).join('') + '</div>'
    + '<div class="card" style="padding:2px 18px">' + shelf('done', 'Completed', done, 0, done ? done + ' read. Tap to read one again.' : 'Teachings you finish move here') + '</div>';
}
V.library = () => '<main class="wrap nonav"><div class="between"><span class="pill">Teachings</span>' + closeBtn() + '</div>'
  + '<div class="col" style="gap:6px"><h1 class="h1">Library</h1><p class="sub">' + C.teachings.length + ' teachings from the gurus, the shastras and BAPS writings, summarised gently.</p></div>'
  + '<label class="search">' + SEARCHI + '<input id="libQ" type="search" placeholder="Search: patience, seva, Yogiji…" value="' + esc(libQ) + '" data-in="libQ" autocomplete="off" enterkeyhint="search"></label>'
  + needChips('libNeed') + '<div id="libRes" class="col" style="gap:14px">' + libResults() + '</div></main>';
INP.libQ = el => { libQ = el.value; const r = $('#libRes'); if (r) r.innerHTML = libResults(); };
A.libNeed = el => { tNeed = tNeed === el.dataset.k ? '' : el.dataset.k; render(true); };
V.shelf = p => {
  const th = p.th; let L, title, sub;
  if (th === 'done') { L = doneList(); title = 'Completed'; sub = 'Everything you\'ve read, most recent first. Read one again any time: the reflection question changes each time.'; }
  else if (th === 'saved') { L = C.teachings.map((t, i) => i).filter(isSaved); title = 'Saved'; sub = 'Kept for later.'; }
  else { const all = C.teachings.map((t, i) => i).filter(i => C.teachings[i].theme === th); L = all.filter(i => !readN(i)); title = themeName(th); sub = all.length + ' teachings' + (all.length - L.length ? ', ' + (all.length - L.length) + ' read' : ''); p.doneIn = all.filter(i => readN(i)); }
  return '<main class="wrap nonav"><div class="between"><span class="pill">Library</span>' + closeBtn() + '</div><div class="col" style="gap:6px"><h1 class="h1">' + esc(title) + '</h1><p class="sub">' + sub + '</p></div>'
    + (L.length ? '<div class="tlist">' + L.map(i => th === 'done' ? trow(i).replace('</span></span>', '</span><span class="small" style="color:var(--saT)">Read ' + (readN(i) === 1 ? 'once' : readN(i) + ' times') + ' · ' + shortDate(lastRead(i)) + '</span></span>') : trow(i)).join('') + '</div>' : '<p class="sub">' + (th === 'done' ? 'Nothing yet. Finish a teaching and it lands here.' : th === 'saved' ? 'Tap the bookmark on a teaching to keep it here.' : 'You\'ve read every one here. Beautiful.') + '</p>')
    + (p.doneIn && p.doneIn.length ? '<section class="col" style="gap:8px"><h2 class="h2">Completed</h2><div class="tlist">' + p.doneIn.map(trow).join('') + '</div></section>' : '')
    + '</main>';
};

/* ---------- a single teaching ---------- */
V.teaching = p => {
  const t = C.teachings[p.i], parts = (t.scan ? ['__scan__'] : []).concat(t.parts), total = parts.length + 3, s = p.s;
  const dots = '<div class="dots" aria-label="Step ' + (s + 1) + ' of ' + total + '">' + Array.from({ length: total }, (_, k) => '<span class="' + (k === s ? 'on' : k < s ? 'past' : '') + '"></span>').join('') + '</div>';
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'source'; } };
  let body;
  if (s === 0) body = '<div class="grow1 fade" style="justify-content:flex-start"><div style="border-radius:160px 160px 26px 26px;overflow:hidden;height:clamp(240px,40vh,340px)"><img src="' + IMG(TEACH_MURTI[p.i % TEACH_MURTI.length]) + '" alt="" style="width:100%;height:100%;object-fit:cover;object-position:center 22%"></div><div class="between" style="align-items:center"><span class="eyebrow">' + esc(themeName(t.theme)) + ' · ' + (t.mins || 3) + ' minutes</span><button class="iconbtn bm' + (isSaved(p.i) ? ' on' : '') + '" data-a="tSave" data-i="' + p.i + '" aria-pressed="' + isSaved(p.i) + '" aria-label="' + (isSaved(p.i) ? 'Saved' : 'Save for later') + '">' + BOOKMARK(isSaved(p.i)) + '</button></div><h1 class="h1" style="font-size:clamp(32px,9vw,40px)">' + esc(t.title) + '</h1><p class="small" style="margin-top:-6px">' + esc(t.by) + '</p><p class="sub"><b style="color:var(--ink)">In short:</b> ' + esc(t.take) + '</p></div>';
  else if (s <= parts.length) {
    const part = parts[s - 1], last = s === parts.length;
    body = part === '__scan__' ? '<div class="grow1 fade" style="justify-content:flex-start"><span class="eyebrow">In his own handwriting</span><img src="' + t.scan + '" alt="Handwritten letter by Mahant Swami Maharaj" style="width:100%;border-radius:18px;background:#fff"><p class="small">Swipe on to read it typed.</p></div>'
      : '<div class="grow1 fade"><span class="eyebrow">' + (s - (t.scan ? 1 : 0)) + ' of ' + t.parts.length + '</span><div class="col" style="gap:14px">' + part.split('\n').map(x => '<p class="serif" style="font-size:clamp(21px,6vw,24px);line-height:1.38">' + esc(x) + '</p>').join('') + '</div>'
        + (last && t.quote ? '<blockquote class="tquote">“' + esc(t.quote.replace(/^[a-z]/, c => c.toUpperCase()).replace(/[,;:]$/, '')) + '”</blockquote>' : '')
        + (last ? '<p class="small">' + esc(t.src) + (t.ch ? ' · ' + esc(t.ch) : '') + (t.url ? ' · <a href="' + esc(t.url) + '" target="_blank" rel="noopener">Read it on ' + esc(host(t.url)) + '</a>' : '') + '</p>' : '') + '</div>';
  } else if (s === parts.length + 1) body = '<div class="grow1 fade"><span class="eyebrow">Reflect</span><h2 class="h1" style="font-size:clamp(28px,8vw,36px)">' + esc(reflectQ(p.i)) + '</h2><textarea id="teachAns" class="ruled" style="height:136px" placeholder="Write a line or two…" data-in="teachAns">' + esc(teachAns) + '</textarea><p class="small">Saved to your prapti journal.</p></div>';
  else body = '<div class="grow1 fade" style="text-align:center;align-items:center"><span class="eyebrow">Carry it today</span><p class="serif it" style="font-size:clamp(26px,7.4vw,32px);line-height:1.25">' + esc(t.take) + '</p><p class="small">Our summary, not the guru\'s words.</p><button class="btn" style="max-width:320px" data-a="pinTake" data-i="' + p.i + '">' + (day().pin === t.take ? 'Pinned to Today' : 'Pin to Today') + '</button></div>';
  return '<main class="stage"><div class="between">' + dots + closeBtn('teachClose') + '</div>' + body
    + '<div class="navbtns">' + (s > 0 ? '<button class="back" data-a="teachStep" data-d="-1" aria-label="Back">' + I.back + '</button>' : '') + '<button class="btn" style="background:var(--dark)" data-a="teachStep" data-d="1">' + (s === 0 ? 'Begin' : s === total - 1 ? 'Finish' : 'Continue') + '</button></div></main>';
};
INP.teachAns = el => { teachAns = el.value; };
function saveReflection(p) { if (!teachAns.trim()) return; const t = C.teachings[p.i], dd = day(); dd.notes = (dd.notes || []).filter(n => n.src !== t.title).concat([{ src: t.title, q: reflectQ(p.i), a: teachAns.trim() }]); save('days/' + TODAY); }
A.teachStep = el => {
  const p = route.p, t = C.teachings[p.i], total = t.parts.length + (t.scan ? 1 : 0) + 3;
  if (p.s === total - 2) saveReflection(p);
  const n = p.s + +el.dataset.d;
  if (n >= total) {
    const k = tkey(p.i), n0 = readN(p.i), first = !n0;
    S.settings.read = Object.assign({}, S.settings.read, { [k]: TODAY }); S.settings.readN = Object.assign({}, S.settings.readN, { [k]: n0 + 1 }); save('settings');
    teachAns = ''; if (first) toast('Added to Completed'); return back('grow');
  }
  p.s = Math.max(0, n); render(); window.scrollTo(0, 0);
};
A.teachClose = () => { saveReflection(route.p); teachAns = ''; back('grow'); };
A.tSave = el => { const id = C.teachings[+el.dataset.i].id, L = tSaved(); S.settings.tsaved = L.includes(id) ? L.filter(x => x !== id) : L.concat([id]); save('settings'); hap(); toast(L.includes(id) ? 'Removed from Saved' : 'Saved for later'); render(true); };

/* ===================== Me: the whole journey ===================== */
let meMon = null;
function feelingsSection() {
  const cur = TODAY.slice(0, 7), first = firstDay(), firstMon = first ? first.slice(0, 7) : cur;
  if (!meMon || meMon > cur) meMon = cur; if (meMon < firstMon) meMon = firstMon;
  const d1 = meMon + '-01', nd = new Date(+meMon.slice(0, 4), +meMon.slice(5, 7), 0).getDate(), lead = (dow(d1) + 6) % 7;
  const days = Array.from({ length: nd }, (_, i) => meMon + '-' + String(i + 1).padStart(2, '0'));
  const cs = days.filter(d => d <= TODAY).map(dayCheck).filter(Boolean);
  const mix = {}; cs.forEach(c => mix[c.q] = (mix[c.q] || 0) + 1);
  const words = {}; cs.forEach(c => words[c.w] = (words[c.w] || 0) + 1); const top = Object.keys(words).sort((a, b) => words[b] - words[a]).slice(0, 3);
  const cell = d => { const c = dayCheck(d), fut = d > TODAY, isT = d === TODAY, had = S.days[d] && (S.days[d].begun || (S.days[d].opens || []).length);
    return '<button class="fcell' + (isT ? ' today' : '') + '" ' + (fut ? 'disabled' : 'data-a="go" data-v="daystory" data-p=\'{"d":"' + d + '"}\'') + ' aria-label="' + shortDate(d) + (c ? ', ' + esc(c.w) : '') + '" style="' + (c ? 'background:' + QUADS[c.q].bg + ';color:#fff' : fut ? 'opacity:.35' : had ? 'background:var(--pill)' : '') + '">' + (+d.slice(8)) + '</button>'; };
  const arrow = (k, off, lab) => '<button class="iconbtn mnav" data-a="meMon" data-d="' + k + '"' + (off ? ' disabled' : '') + ' aria-label="' + lab + '">' + (k < 0 ? I.back : I.back.replace('<path', '<path transform="rotate(180 12 12)"')) + '</button>';
  return '<section class="card col" style="gap:14px"><div class="between"><span class="serif" style="font-size:22px">How I\'ve been feeling</span><span class="small">Tap a day</span></div>'
    + '<div class="between" style="align-items:center">' + arrow(-1, meMon <= firstMon, 'Previous month') + '<span style="font-size:15px;font-weight:600">' + monLabel(meMon) + '</span>' + arrow(1, meMon >= cur, 'Next month') + '</div>'
    + '<div class="fgrid">' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => '<span class="small" style="text-align:center">' + x + '</span>').join('') + '<span></span>'.repeat(lead) + days.map(cell).join('') + '</div>'
    + (cs.length ? '<div class="col" style="gap:8px"><div class="mixbar">' + ['lp', 'hp', 'lu', 'hu'].filter(k => mix[k]).map(k => '<span style="flex:' + mix[k] + ';background:' + QUADS[k].bg + '"></span>').join('') + '</div>'
      + '<div class="chips" style="gap:12px">' + ['lp', 'hp', 'lu', 'hu'].filter(k => mix[k]).map(k => '<span class="small row" style="gap:5px"><span style="width:10px;height:10px;border-radius:5px;background:' + QUADS[k].bg + '"></span>' + moodName(k) + ' · ' + mix[k] + '</span>').join('') + '</div>'
      + '<span class="small">Most often: <b style="color:var(--ink)">' + top.map(esc).join(', ') + '</b></span></div>'
      : '<p class="sub">' + (meMon === cur ? 'Check in once a day and your month fills with colour.' : 'No check-ins this month.') + '</p>') + '</section>';
}
A.meMon = el => { meMon = monAdd(meMon, +el.dataset.d); render(true); };
function allTimeCard() {
  const first = firstDay(); if (!first) return '';
  const ds = Object.keys(S.days), D = ds.map(d => S.days[d]);
  const stats = [
    [ds.filter(showedUp).length, 'days you showed up'],
    [ds.filter(d => dayCheck(d)).length, 'check-ins'],
    [Object.keys(S.settings.readN || {}).filter(k => S.settings.readN[k] > 0).length || Object.keys(S.settings.read || {}).length, 'teachings read'],
    [D.reduce((n, x) => n + ((x.mala && x.mala.done) || 0), 0), 'malas'],
    [D.filter(x => x.done && x.done.sabha).length, 'sabhas'],
    [D.filter(x => x.sleep && x.sleep.bed).length, 'nights logged'],
  ];
  return '<section class="card col" style="gap:14px"><div class="between"><span class="serif" style="font-size:22px">Since you began</span><span class="small">' + shortDate(first) + '</span></div><div class="grid3">' + stats.map(s => '<div class="stat"><b>' + s[0] + '</b><span class="small">' + s[1] + '</span></div>').join('') + '</div></section>';
}
function weeksCard() {
  const first = Object.keys(S.days).filter(d => showedUp(d)).sort()[0]; if (!first) return '';
  const cur = latestRoundup(), L = []; for (let wk = cur; wk >= weekStart(first); wk = addDays(wk, -7)) if (hasWeek(wk)) L.push(wk);
  if (!L.length) return '';
  return '<section class="col" style="gap:10px"><div class="between"><h2 class="h2">Your weeks</h2><span class="small">' + L.length + (L.length === 1 ? ' week' : ' weeks') + '</span></div><div class="carousel" style="gap:10px">' + L.map((wk, i) => { const st = weekStats(wk); return '<button class="weekchip" data-a="go" data-v="wrapped" data-p=\'{"wk":"' + wk + '"}\' style="background:' + ['linear-gradient(160deg,#E07A2E,#A23B4F)', 'linear-gradient(160deg,#4F6E9E,#2E7556)', 'linear-gradient(160deg,#D8651C,#96610C)', 'linear-gradient(160deg,#2F4468,#3E5A86)'][i % 4] + '"><span class="small" style="color:rgba(255,255,255,.85)">' + rangeLabel(wk, addDays(wk, 6)) + '</span><b class="serif">' + st.shown + '<small> days</small></b><span style="font-size:12px;opacity:.9">' + st.done + ' done' + (st.topWord ? ' · ' + esc(st.topWord) : '') + '</span>' + ((S.settings.wrapSeen || {})[wk] ? '' : '<i class="newdot"></i>') + '</button>'; }).join('') + '</div></section>';
}

/* ===================== What's new ===================== */
function whatsNewCard() {
  const v = CHANGELOG[0].v; if (!S.settings.setupDone || S.settings.seenVer === v) return '';
  return '<button class="card newcard fade" data-a="go" data-v="whatsnew"><span class="col" style="gap:4px;flex:1;text-align:left"><span class="eyebrow">New in Prapti ' + v + '</span><span class="serif" style="font-size:22px;line-height:1.15">' + esc(CHANGELOG[0].items[0].split(':')[0]) + ', and more</span><span class="small">Tap to see what\'s changed</span></span>' + I.right + '</button>';
}
V.whatsnew = () => {
  if (S.settings.seenVer !== CHANGELOG[0].v && !viewOnly()) { S.settings.seenVer = CHANGELOG[0].v; save('settings'); }
  return '<main class="wrap nonav"><div class="between"><span class="pill">What\'s new</span>' + closeBtn() + '</div><div class="col" style="gap:6px"><h1 class="h1">What\'s new</h1><p class="sub">Every change to Prapti, newest first.</p></div>'
    + CHANGELOG.map((c, k) => '<section class="card col" style="gap:10px"><div class="between"><span class="serif" style="font-size:24px">Version ' + c.v + '</span><span class="small">' + (c.date ? shortDate(c.date) : k === 0 ? 'Latest' : '') + '</span></div><ul class="clog">' + c.items.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></section>').join('') + '</main>';
};
function noteCard() {
  const nc = whatsNewCard();
  if (OWNER && !viewOnly()) return nc;
  const n = notesList().find(x => !x.seen && noteLive(x));
  return (n ? '<div class="card notecard fade"><span class="eyebrow">A note for you</span><p class="serif" style="font-size:22px;line-height:1.35;white-space:pre-wrap">' + esc(n.text) + '</p><button class="heartbtn" data-a="noteSeen" data-id="' + n.id + '" aria-label="Seen, with love">' + I.heart(true) + '</button></div>' : '') + nc;
}

/* ===================== Surprise notes, now with timing ===================== */
const localWhen = (iso, dateOnly) => { const d = new Date(iso); if (isNaN(d)) return ''; return shortDate(ymd(d)) + (dateOnly ? '' : ', ' + mins(d.getHours() * 60 + d.getMinutes())); };
const noteLive = n => !n.showAt || new Date(n.showAt) <= new Date();
let NT = null;
A.noteNew = () => { NT = { when: 'now', at: '', push: true, text: '' }; noteSheet(); };
function noteSheet() {
  const sent = notesList();
  sheet('<div class="between"><span class="h2">A surprise note</span>' + closeBtn('closeSheet') + '</div><textarea id="noteT" class="ruled" style="height:130px;font-style:normal" placeholder="Write something kind…" data-in="noteT">' + esc(NT.text) + '</textarea>'
    + '<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))">' + [['now', 'Now'], ['later', 'At a time']].map(x => '<button class="' + (NT.when === x[0] ? 'on' : '') + '" data-a="ntWhen" data-w="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>'
    + (NT.when === 'later' ? '<input id="noteAt" type="datetime-local" class="field" value="' + esc(NT.at) + '" data-in="noteAt">' : '')
    + '<div class="setrow ic" style="cursor:default;padding:4px 0"><span class="col" style="gap:2px;flex:1"><span style="font-size:15px;font-weight:600">Let her know</span><span class="small">A notification: "A note from Tilak"</span></span><button class="tg' + (NT.push ? '' : ' off') + '" role="switch" aria-checked="' + NT.push + '" aria-label="Let her know" data-a="ntPush"></button></div>'
    + '<button class="btn" data-a="noteSend">' + (NT.when === 'later' ? 'Schedule the note' : 'Leave the note') + '</button>'
    + (sent.length ? '<div class="col" style="gap:6px;margin-top:6px"><span class="eyebrow">Sent</span>' + sent.slice(0, 8).map(n => '<div class="between divrow" style="padding:8px 0;gap:10px"><span class="clamp3" style="font-size:14px">' + esc(n.text) + '</span><span class="small" style="flex-shrink:0;text-align:right">' + (n.seen ? 'Seen ♥' + (n.seenAt ? '<br>' + localWhen(n.seenAt) : '') : !noteLive(n) ? 'Scheduled<br>' + localWhen(n.showAt) : 'Not yet') + '</span></div>').join('') + '</div>' : ''));
}
INP.noteT = el => { NT.text = el.value; };
INP.noteAt = el => { NT.at = el.value; };
A.ntWhen = el => { NT.when = el.dataset.w; if (NT.when === 'later' && !NT.at) { const d = new Date(Date.now() + 36e5); d.setMinutes(0); NT.at = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + 'T' + String(d.getHours()).padStart(2, '0') + ':00'; } noteSheet(); };
A.ntPush = () => { NT.push = !NT.push; const b = $('.sheet [data-a=ntPush]'); if (b) { b.classList.toggle('off', !NT.push); b.setAttribute('aria-checked', NT.push); } };
A.noteSend = () => {
  const v = (NT.text || '').trim(); if (!v) return toast('Write something first');
  let showAt = ''; if (NT.when === 'later') { const d = new Date(NT.at); if (!NT.at || isNaN(d)) return toast('Pick a date and time'); if (d < new Date()) return toast('Pick a time in the future'); showAt = d.toISOString(); }
  const id = 'n' + Date.now().toString(36) + uid();
  S.notes[id] = { id, from: 'Tilak', to: 'Chhaya', text: v, at: new Date().toISOString(), showAt, push: NT.push, seen: false }; save('notes/' + id);
  NT = null; closeSheet(); toast(showAt ? 'Scheduled' : 'Note left for her'); if (route.v === 'admin') render(true);
};
V.notes = () => '<main class="wrap nonav"><div class="between"><span class="pill">Notes</span>' + closeBtn() + '</div><h1 class="h1">Notes</h1>' + notesList().filter(n => OWNER || noteLive(n)).map(n => '<div class="card col" style="gap:8px"><span class="eyebrow">' + (n.showAt || n.at ? localWhen(n.showAt || n.at, true) : shortDate(TODAY)) + '</span><p class="serif" style="font-size:20px;line-height:1.35;white-space:pre-wrap">' + esc(n.text) + '</p></div>').join('') + '</main>';

/* ===================== Suggestions: status she can see ===================== */
const FBST = { new: ['Sent', 'New'], planned: ['Tilak\'s on it', 'Planned'], done: ['Done', 'Done'] };
const fbStatus = x => x.status || (x.done ? 'done' : 'new');
function fbOpen() { return fbList().filter(x => fbStatus(x) === 'new').length; }
function fbSheet() {
  const mine = fbList().slice(0, 5);
  sheet('<div class="between"><span class="h2">Send feedback</span>' + closeBtn('closeSheet') + '</div>'
    + '<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))">' + [['idea', 'An idea'], ['bug', 'Something\'s wrong']].map(x => '<button class="' + (FB.type === x[0] ? 'on' : '') + '" data-a="fbType" data-t="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>'
    + '<textarea id="fbText" class="ruled" style="height:136px" placeholder="' + (FB.type === 'bug' ? 'What happened, and where in the app?' : 'What would make Prapti better for you?') + '" data-in="fbText">' + esc(FB.text) + '</textarea>'
    + (FB.photo ? '<div class="row" style="gap:10px"><img src="' + (photoSrc(FB.photo) || '') + '" alt="" style="width:56px;height:56px;border-radius:12px;object-fit:cover"><span class="small" style="flex:1">Screenshot added</span><button class="link" data-a="fbNoPhoto">Remove</button></div>'
      : '<label class="chip" for="fbShot" style="align-self:flex-start;cursor:pointer">+ Add a screenshot</label><input id="fbShot" type="file" accept="image/*" hidden data-in="fbShot">')
    + '<button class="btn" data-a="fbSend">Send</button>'
    + (mine.length && (!OWNER || viewOnly()) ? '<div class="col" style="gap:4px;margin-top:6px"><span class="eyebrow">What you\'ve sent</span>' + mine.map(x => '<div class="between divrow" style="padding:8px 0;gap:10px"><span class="clamp3" style="font-size:14px">' + esc(x.text || 'Screenshot') + '</span><span class="fbst ' + fbStatus(x) + '">' + FBST[fbStatus(x)][0] + '</span></div>').join('') + '</div>' : ''));
  setTimeout(() => { const t = $('#fbText'); if (t && !mine.length) t.focus(); }, 60);
}
V.feedback = () => {
  const L = fbList();
  return '<main class="wrap nonav"><div class="between"><span class="pill">Suggestions</span>' + closeBtn() + '</div><div class="col" style="gap:6px"><h1 class="h1">From Chhaya</h1><p class="sub">She sees each one\'s status: Sent, Tilak\'s on it, or Done.</p></div>'
    + (L.length ? L.map(x => { const st = fbStatus(x); return '<section class="card col" style="gap:8px' + (st === 'done' ? ';opacity:.65' : '') + '"><div class="between"><span class="eyebrow" style="color:' + (x.type === 'bug' ? '#B8400E' : 'var(--saT)') + '">' + (x.type === 'bug' ? 'Something\'s wrong' : 'Idea') + ' · ' + shortDate(x.date) + '</span><span class="fbst ' + st + '">' + FBST[st][1] + '</span></div>'
      + (x.text ? '<p style="font-size:16px;line-height:1.5;white-space:pre-wrap">' + esc(x.text) + '</p>' : '')
      + (x.photo ? '<img data-photo="' + esc(x.photo) + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Screenshot" style="width:100%;border-radius:14px;background:var(--pill)">' : '')
      + '<span class="small">Sent from ' + esc(x.from || '?') + (x.standalone ? ' · home-screen app' : ' · browser') + '</span>'
      + '<div class="seg" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + ['new', 'planned', 'done'].map(k => '<button class="' + (st === k ? 'on' : '') + '" data-a="fbSet" data-id="' + x.id + '" data-s="' + k + '">' + FBST[k][1] + '</button>').join('') + '</div></section>'; }).join('')
      : '<p class="sub">Nothing yet.</p>')
    + '</main>';
};
A.fbSet = el => { const x = S.feedback[el.dataset.id]; if (!x) return; x.status = el.dataset.s; x.done = x.status === 'done'; x.statusAt = new Date().toISOString(); save('feedback/' + x.id); render(true); };

/* ===================== Health report (PDF) ===================== */
let RP = { per: '4w' };
const PERIODS = [['4w', '4 weeks'], ['3m', '3 months'], ['all', 'Everything']];
// Chhaya's real data, for Tilak's dashboard and report, loaded straight from the database whichever mode he's in
let ADM = null;
async function pageAll(build) { const out = []; for (let from = 0; ; from += 1000) { const r = await build().range(from, from + 999); if (r.error) return r; out.push(...(r.data || [])); if ((r.data || []).length < 1000) return { data: out, error: null }; } }
async function loadHer() {
  const since = 'logs/' + (Date.now() - 7 * 864e5).toString(36);
  const [d, w, st, rt, lg] = await Promise.all([
    pageAll(() => sb.from('docs').select('id,data').eq('col', 'days').order('id')),
    sb.from('docs').select('id,data').eq('col', 'weekly'),
    sb.from('docs').select('data').eq('id', 'app/settings').maybeSingle(),
    sb.from('docs').select('data').eq('id', 'app/rtms').maybeSingle(),
    sb.from('docs').select('id,data').eq('col', 'logs').gte('id', since),
  ]);
  if (d.error) throw d.error;
  const days = {}; (d.data || []).forEach(r => days[r.id.slice(5)] = Object.assign(DAYDEF(r.id.slice(5)), r.data || {}));
  const weekly = {}; (w.data || []).forEach(r => weekly[r.id.slice(7)] = r.data || {});
  ADM = { days, weekly, settings: Object.assign(DEF().settings, (st.data && st.data.data) || {}), rtms: Object.assign(DEF().rtms, (rt.data && rt.data.data) || {}), logs: (lg.data || []).map(r => r.data).filter(x => x && (x.user || '').toLowerCase() !== OWNER_EMAIL).sort((a, b) => (b.at || '') < (a.at || '') ? -1 : 1), at: Date.now() };
  if (route && ['admin', 'report', 'me'].includes(route.v)) render(true);
}
function withHer(fn) {
  if (!ADM) return null;
  const o = { days: S.days, weekly: S.weekly, settings: S.settings, rtms: S.rtms };
  S.days = ADM.days; S.weekly = ADM.weekly; S.settings = ADM.settings; S.rtms = ADM.rtms;
  try { return fn(); } finally { Object.assign(S, o); }
}
function reportData(per) {
  const first = firstDay() || TODAY, from = per === '4w' ? addDays(TODAY, -27) : per === '3m' ? addDays(TODAY, -90) : first;
  const start = from < first ? first : from, ds = []; for (let d = start; d <= TODAY; d = addDays(d, 1)) ds.push(d);
  const rows = ds.map(d => { const x = S.days[d] || {}, c = dayCheck(d), sl = x.sleep || {}; const ws = (x.checkins || []).map(k => k.w).filter(Boolean); return { d, c: c ? { w: ws.length > 1 ? ws.join(', ') : c.w, q: c.q, mood: moodName(c.q) + (ws.length > 1 ? ' (latest)' : ''), tags: c.tags || [] } : null, done: doneNames(d).length, sleep: sleepHours(sl), bed: sl.bed || '', wake: sl.wake || '', wakes: sl.wakes != null ? sl.wakes : (sl.night || []).length || (sl.bed ? 0 : null), up: showedUp(d) }; });
  const wk = Object.keys(S.weekly).sort().filter(k => k >= addDays(start, -6)).map(k => ({ d: k, score: S.weekly[k].score, gad: S.weekly[k].gad, q9: (S.weekly[k].answers || [])[8] }));
  return { from: start, to: TODAY, rows, wk, rtms: S.rtms.sessions.filter(s => s >= start).length, name: 'Chhaya' };
}
function reportSummary(R) {
  const cs = R.rows.filter(r => r.c), sl = R.rows.filter(r => r.sleep != null), pl = cs.filter(r => PLEASANT(r.c.q)).length;
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const med = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const bedM = med(sl.map(r => { let m = toMins(r.bed); if (m < 720) m += 1440; return m; })), wakeM = med(sl.map(r => toMins(r.wake)));
  return { checkins: cs.length, days: R.rows.length, pleasant: pl, sleepN: sl.length, sleepAvg: avg(sl.map(r => r.sleep)), wakesAvg: avg(sl.map(r => r.wakes || 0)), bed: bedM != null ? mins(bedM % 1440) : '', wake: wakeM != null ? mins(wakeM) : '', last: R.wk[R.wk.length - 1] || null };
}
const PHQBAND = s => s == null ? '' : s <= 4 ? 'Minimal' : s <= 9 ? 'Mild' : s <= 14 ? 'Moderate' : s <= 19 ? 'Moderately severe' : 'Severe';
V.report = p => {
  const hers = OWNER && p && p.hers;
  if (hers && !ADM) { loadHer().catch(() => toast('Couldn\'t load her data')); return '<main class="wrap nonav"><div class="between"><span class="pill">Health report</span>' + closeBtn() + '</div><p class="sub">Loading…</p></main>'; }
  const R = hers ? withHer(() => reportData(RP.per)) : reportData(RP.per), M = reportSummary(R);
  return '<main class="wrap nonav"><div class="between"><span class="pill">Health report</span>' + closeBtn() + '</div>'
    + '<div class="col" style="gap:6px"><h1 class="h1">Health report</h1><p class="sub">' + (hers ? 'Chhaya\'s real data. ' : '') + 'A PDF for your GP, psychiatrist or rTMS clinic: how you\'ve been feeling, your weekly scores and your sleep.</p></div>'
    + '<div class="seg" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + PERIODS.map(x => '<button class="' + (RP.per === x[0] ? 'on' : '') + '" data-a="rpPer" data-k="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>'
    + '<section class="card col" style="gap:12px"><span class="eyebrow">' + rangeLabel(R.from, R.to) + '</span><div class="grid2">'
    + '<div class="stat"><b>' + M.checkins + '</b><span class="small">daily check-ins</span></div>'
    + '<div class="stat"><b>' + (M.last ? M.last.score + '<small style="font-size:14px"> / 27</small>' : '–') + '</b><span class="small">latest PHQ-9' + (M.last ? ' · ' + PHQBAND(M.last.score).toLowerCase() : '') + '</span></div>'
    + '<div class="stat"><b>' + (M.last && M.last.gad != null ? M.last.gad + '<small style="font-size:14px"> / 6</small>' : '–') + '</b><span class="small">latest GAD-2</span></div>'
    + '<div class="stat"><b>' + (M.sleepAvg != null ? fmtH(M.sleepAvg) : '–') + '</b><span class="small">average sleep' + (M.sleepN ? ', ' + M.sleepN + ' nights' : '') + '</span></div>'
    + '</div><span class="small">The PDF adds a trend chart, a sleep chart and a day-by-day table.</span></section>'
    + '<button class="btn" data-a="reportPdf"' + (hers ? ' data-hers="1"' : '') + '>Create the PDF</button><p class="small">It opens your share sheet: send it to your GP, or choose Save to Files.</p>'
    + (!hers && (S.rtms.sessions.length || S.rtms.questions.length) ? '<section class="card col" style="gap:8px"><span class="eyebrow">For your rTMS appointments</span><p style="font-size:16px">' + S.rtms.sessions.length + (S.rtms.total ? ' of ' + S.rtms.total : '') + ' sessions attended.</p>' + (S.rtms.questions.length ? '<span class="small">Your questions</span><ul style="margin:0;padding-left:18px;line-height:1.7">' + S.rtms.questions.map(q => '<li>' + esc(q) + '</li>').join('') + '</ul>' : '') + '</section>' : '')
    + '</main>';
};
V.report_after = () => { loadJsPDF().catch(() => {}); };
A.rpPer = el => { RP.per = el.dataset.k; render(true); };
let jsPdfP = null;
function loadJsPDF() {
  if (window.jspdf) return Promise.resolve();
  return jsPdfP || (jsPdfP = new Promise((res, rej) => { const s = document.createElement('script'); s.src = (BUILD === 'beta' ? '../' : '') + 'vendor/jspdf.umd.min.js'; s.onload = res; s.onerror = () => { jsPdfP = null; rej(new Error('pdf')); }; document.head.appendChild(s); }));
}
let lastPdf = null;
A.reportPdf = async el => {
  const hers = !!el.dataset.hers;
  if (!window.jspdf) { toast('Preparing…'); try { await loadJsPDF(); } catch (e) { return toast('Couldn\'t prepare the PDF. Check your connection.'); } }
  let file;
  try { const R = hers ? withHer(() => reportData(RP.per)) : reportData(RP.per); file = makePDF(R); }
  catch (e) { logErr('pdf', e.message || e); return toast('Couldn\'t create the PDF'); }
  lastPdf = file; deliverPdf(file);
};
async function deliverPdf(file) {
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: file.name.replace(/\.[a-z]+$/, '') }); return; } }
  catch (e) { if (e && e.name === 'AbortError') return; sheet('<div class="between"><span class="h2">Your PDF is ready</span>' + closeBtn('closeSheet') + '</div><button class="btn" data-a="pdfAgain">Share the PDF</button>'); return; }
  const u = URL.createObjectURL(file), a = document.createElement('a'); a.href = u; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000); toast('PDF saved');
}
A.pdfAgain = () => { closeSheet(); if (lastPdf) deliverPdf(lastPdf); };
const pdfTxt = s => String(s == null ? '' : s).normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7E -ÿ–—‘’“”•…]/g, '');
function makePDF(R) {
  const { jsPDF } = window.jspdf, doc = new jsPDF({ unit: 'mm', format: 'a4' }), W = 210, H = 297, M = 16, CW = W - 2 * M;
  const INK = [42, 26, 18], MUT = [122, 106, 94], ACC = [184, 64, 14], BLU = [62, 90, 134], LINE = [230, 220, 208];
  const sd = d => parse(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), S2 = reportSummary(R), long = d => parse(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const col = c => doc.setTextColor(c[0], c[1], c[2]);
  let y = M;
  const text = (s, x, yy, o) => doc.text(pdfTxt(s), x, yy, o);
  const need = h => { if (y + h > H - 18) { doc.addPage(); y = M; } };
  const heading = s => { need(16); y += 4; doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5); col(INK); text(s, M, y); y += 2.5; doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.3); doc.line(M, y, W - M, y); y += 6; };
  const para = (s, sz) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(sz || 9.5); col(MUT); const L = doc.splitTextToSize(pdfTxt(s), CW); need(L.length * 4.2); doc.text(L, M, y); y += L.length * 4.2 + 1.5; };
  // header
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); col(ACC); text('PRAPTI', M, y + 2); y += 10;
  doc.setFontSize(22); col(INK); text('Health report', M, y); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); col(MUT); text(R.name + '  ·  ' + long(R.from) + ' to ' + long(R.to), M, y); y += 5;
  doc.setFontSize(8.5); text('Self-reported in the Prapti app. Prepared ' + long(TODAY) + '.', M, y); y += 8;
  // summary tiles
  const tiles = [[String(S2.checkins) + ' of ' + S2.days, 'days checked in'], [S2.checkins ? Math.round(S2.pleasant / S2.checkins * 100) + '%' : '-', 'pleasant check-ins'], [S2.last ? S2.last.score + ' / 27' : '-', 'latest PHQ-9' + (S2.last ? ' (' + PHQBAND(S2.last.score).toLowerCase() + ')' : '')], [S2.last && S2.last.gad != null ? S2.last.gad + ' / 6' : '-', 'latest GAD-2'], [S2.sleepAvg != null ? fmtH(S2.sleepAvg) : '-', 'average sleep']];
  const tw = (CW - 4 * 3) / 5;
  tiles.forEach((t, i) => { const x = M + i * (tw + 3); doc.setFillColor(248, 243, 236); doc.roundedRect(x, y, tw, 19, 2, 2, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(12.5); col(INK); text(t[0], x + 3, y + 8); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); col(MUT); doc.text(doc.splitTextToSize(pdfTxt(t[1]), tw - 5), x + 3, y + 13); });
  y += 25;
  if (R.rtms) { para('rTMS sessions attended in this period: ' + R.rtms + '.'); }

  // 1. Weekly scores chart
  heading('Mood and anxiety: weekly scores');
  if (R.wk.length) {
    need(70); const cx = M + 10, cy = y, cw = CW - 20, ch = 52, n = R.wk.length;
    const bands = [[0, 4, [240, 247, 240]], [5, 9, [250, 247, 232]], [10, 14, [252, 240, 225]], [15, 19, [250, 230, 222]], [20, 27, [246, 222, 222]]];
    const Y = v => cy + ch - v / 27 * ch;
    bands.forEach(b => { doc.setFillColor(b[2][0], b[2][1], b[2][2]); doc.rect(cx, Y(b[1] + (b[1] === 27 ? 0 : 1)), cw, Y(b[0]) - Y(b[1] + (b[1] === 27 ? 0 : 1)), 'F'); });
    doc.setFontSize(7); col(MUT); [0, 5, 10, 15, 20, 27].forEach(v => text(String(v), cx - 2, Y(v) + 1, { align: 'right' })); [0, 2, 4, 6].forEach(v => text(String(v), cx + cw + 2, Y(v / 6 * 27) + 1));
    const X = i => n === 1 ? cx + cw / 2 : cx + 4 + i * (cw - 8) / (n - 1);
    const line = (vals, c, sc) => { doc.setDrawColor(c[0], c[1], c[2]); doc.setFillColor(c[0], c[1], c[2]); doc.setLineWidth(0.7); let prev = null; vals.forEach((v, i) => { if (v == null) { prev = null; return; } const p = [X(i), Y(v * sc)]; if (prev) doc.line(prev[0], prev[1], p[0], p[1]); doc.circle(p[0], p[1], 0.9, 'F'); prev = p; }); };
    line(R.wk.map(w => w.score), ACC, 1); line(R.wk.map(w => w.gad), BLU, 27 / 6);
    doc.setFontSize(6.5); col(MUT); const step = Math.ceil(n / 8); R.wk.forEach((w, i) => { if (i % step === 0 || i === n - 1) text(sd(w.d), X(i), cy + ch + 4, { align: 'center' }); });
    y = cy + ch + 9;
    doc.setFillColor(ACC[0], ACC[1], ACC[2]); doc.rect(M, y - 2, 4, 1.2, 'F'); doc.setFontSize(8); col(INK); text('PHQ-9 (left axis, 0 to 27)', M + 6, y - 0.8);
    doc.setFillColor(BLU[0], BLU[1], BLU[2]); doc.rect(M + 60, y - 2, 4, 1.2, 'F'); text('GAD-2 (right axis, 0 to 6)', M + 66, y - 0.8); y += 5;
    para('Higher scores mean more symptoms. PHQ-9 shading: 0 to 4 minimal, 5 to 9 mild, 10 to 14 moderate, 15 to 19 moderately severe, 20 to 27 severe. A GAD-2 of 3 or more suggests further assessment.', 8);
    // weekly table
    const cols = [['Week of', 30], ['PHQ-9', 18], ['Severity', 38], ['GAD-2', 18], ['PHQ-9 item 9', 30]];
    tableHead(cols); R.wk.forEach(w => tableRow(cols, [long(w.d), w.score, PHQBAND(w.score), w.gad != null ? w.gad : '-', w.q9 != null ? ['0 Not at all', '1 Several days', '2 More than half', '3 Nearly every day'][w.q9] : '-']));
    y += 3;
  } else para('No weekly check-ins in this period.');

  // 2. Sleep
  heading('Sleep');
  if (S2.sleepN) {
    need(58); para(S2.sleepN + ' nights logged. Average ' + fmtH(S2.sleepAvg) + ' asleep, ' + n1(S2.wakesAvg) + ' wake-ups a night. Typical bedtime ' + S2.bed + ', typical wake time ' + S2.wake + '.', 9.5);
    const cx = M + 10, cy = y + 2, cw = CW - 12, ch = 34, rows = R.rows, n = rows.length, bw = Math.max(0.6, cw / n * 0.7), Yh = h => cy + ch - Math.min(12, h) / 12 * ch;
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.2); [0, 4, 8, 12].forEach(h => { doc.line(cx, Yh(h), cx + cw, Yh(h)); doc.setFontSize(7); col(MUT); text(h + 'h', cx - 2, Yh(h) + 1, { align: 'right' }); });
    doc.setDrawColor(ACC[0], ACC[1], ACC[2]); doc.setLineDashPattern([1, 1], 0); doc.line(cx, Yh(7), cx + cw, Yh(7)); doc.setLineDashPattern([], 0); doc.setFontSize(6.5); col(ACC); text('7h', cx + cw + 1, Yh(7) + 1);
    rows.forEach((r, i) => { if (r.sleep == null) return; const x = cx + (i + 0.5) * cw / n - bw / 2; const c = r.sleep >= 7 ? BLU : [143, 163, 199]; doc.setFillColor(c[0], c[1], c[2]); doc.rect(x, Yh(r.sleep), bw, Yh(0) - Yh(r.sleep), 'F'); });
    doc.setFontSize(6.5); col(MUT); text(sd(R.from), cx, cy + ch + 4); text(sd(R.to), cx + cw, cy + ch + 4, { align: 'right' });
    y = cy + ch + 9;
  } else para('No sleep logged in this period.');

  // 3. Daily table
  heading('Day by day');
  const dc = [['Date', 30], ['Feeling', 42], ['Mood area', 32], ['Tasks done', 20], ['Sleep', 18], ['Wake-ups', 16], ['About', 20]];
  tableHead(dc);
  R.rows.slice().reverse().forEach(r => tableRow(dc, [parse(r.d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }), r.c ? r.c.w : '-', r.c ? r.c.mood : '', r.up ? r.done : '-', r.sleep != null ? fmtH(r.sleep) : '-', r.wakes != null ? r.wakes : '-', r.c ? (r.c.tags || []).slice(0, 2).join(', ') : '']));
  function tableHead(cols) { need(12); doc.setFillColor(248, 243, 236); doc.rect(M, y - 4, CW, 6.5, 'F'); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); col(INK); let x = M + 2; cols.forEach(c => { text(c[0], x, y); x += c[1] * CW / cols.reduce((a, b) => a + b[1], 0); }); y += 6; }
  function tableRow(cols, vals) { if (y + 6 > H - 18) { doc.addPage(); y = M + 4; tableHead(cols); } doc.setFont('helvetica', 'normal'); doc.setFontSize(8); col(INK); let x = M + 2; const tot = cols.reduce((a, b) => a + b[1], 0); cols.forEach((c, i) => { const w = c[1] * CW / tot - 2; let s = pdfTxt(vals[i]); while (s.length > 1 && doc.getTextWidth(s) > w) s = s.slice(0, -2) + '…'; doc.text(s, x, y); x += c[1] * CW / tot; }); doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.15); doc.line(M, y + 2, W - M, y + 2); y += 5.6; }
  // footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); col(MUT); text('Prapti health report  ·  ' + R.name + '  ·  self-reported, not a clinical record', M, H - 9); text('Page ' + i + ' of ' + pages, W - M, H - 9, { align: 'right' }); }
  const blob = doc.output('blob');
  return new File([blob], 'Prapti health report ' + TODAY + '.pdf', { type: 'application/pdf' });
}

/* ===================== Tilak's dashboard ===================== */
function computeFlags() {
  const F = [], first = firstDay(); if (!first) return F;
  const act = d => { const x = S.days[d]; return !!x && ((x.opens || []).length > 0 || showedUp(d)); };
  const ks = Object.keys(S.weekly).sort(), w = ks.map(k => S.weekly[k]), lw = w[w.length - 1];
  if (lw && (lw.answers || [])[8] > 0 && ks[ks.length - 1] >= addDays(TODAY, -7)) F.push({ k: 'q9', urgent: true, t: 'Her weekly check-in mentioned thoughts of self-harm', s: 'On ' + shortDate(ks[ks.length - 1]) + ' she answered "' + PHQA[lw.answers[8]] + '" to the question about being better off dead or hurting herself.', tip: 'Talk to her today. If you\'re worried about her safety right now, call 999. For urgent mental health help, call NHS 111 and choose option 2.' });
  if (first <= addDays(TODAY, -3) && ![0, -1, -2].some(k => act(addDays(TODAY, k)))) { const last = Object.keys(S.days).filter(act).sort().pop(); F.push({ k: 'quiet', t: 'She hasn\'t opened Prapti for 3 days', s: last ? 'Last opened ' + shortDate(last) + '.' : '', tip: 'A gentle message with no pressure is usually enough.' }); }
  let run = 0; for (let k = 0; k < 21; k++) { const c = dayCheck(addDays(TODAY, -k)); if (!c) { if (k === 0) continue; break; } if (PLEASANT(c.q)) break; run++; }
  if (run >= 3) F.push({ k: 'hard', t: run + ' hard days in a row', s: 'Her last ' + run + ' check-ins were unpleasant.', tip: 'Time together, or a small plan for tomorrow, often helps.' });
  if (w.length >= 3) { const [a, b, c] = w.slice(-3); if ([a, b, c].every(x => x.gad != null) && c.gad > b.gad && b.gad > a.gad) F.push({ k: 'anx', t: 'Anxiety score up two weeks running', s: 'GAD-2 went ' + a.gad + ', ' + b.gad + ', ' + c.gad + ' (out of 6).', tip: 'Worth mentioning at her next appointment.' }); if (c.score > b.score && b.score > a.score) F.push({ k: 'mood', t: 'Mood score up two weeks running', s: 'PHQ-9 went ' + a.score + ', ' + b.score + ', ' + c.score + ' (out of 27; higher is heavier).', tip: 'Worth mentioning at her next appointment.' }); }
  return F;
}
let VER = null;
function loadVersions() {
  VER = VER || {};
  const get = u => fetch(u, { cache: 'no-store' }).then(r => r.ok ? r.json() : null).catch(() => null);
  Promise.all([get(BUILD === 'beta' ? '../version.json' : 'version.json'), get(BUILD === 'beta' ? 'version.json' : 'beta/version.json')]).then(([live, test]) => { VER = { live, test, at: Date.now() }; if (route && route.v === 'admin') render(true); });
}
V.admin = () => {
  if (!OWNER) return V.today();
  if (!ADM || Date.now() - ADM.at > 120000) loadHer().catch(e => { logErr('admin', e.message || e); toast('Couldn\'t load her data'); });
  if (!VER) loadVersions();
  const glance = ADM ? withHer(() => {
    const ws = weekStart(TODAY), wd = wkDays(ws).filter(d => d <= TODAY);
    const opened = Object.keys(S.days).filter(d => (S.days[d].opens || []).length || showedUp(d)).sort(), last = opened[opened.length - 1];
    const lastT = last && (S.days[last].opens || []).length ? mins(toMins(S.days[last].opens.slice(-1)[0])) : '';
    const cs = wd.map(dayCheck).filter(Boolean), mix = {}; cs.forEach(c => mix[c.q] = (mix[c.q] || 0) + 1);
    const sl = Array.from({ length: 7 }, (_, i) => sleepHours((S.days[addDays(TODAY, -i)] || {}).sleep)).filter(h => h != null);
    const ks = Object.keys(S.weekly).sort(), lw = ks.length ? S.weekly[ks[ks.length - 1]] : null, pw = ks.length > 1 ? S.weekly[ks[ks.length - 2]] : null;
    return { flags: computeFlags(), last, lastT, week: wd.filter(d => opened.includes(d)).length, wdN: wd.length, cs, mix, sleep: sl.length ? sl.reduce((a, b) => a + b, 0) / sl.length : null, sleepN: sl.length, lw, pw, rt: S.rtms.sessions.length, rtT: S.rtms.total };
  }) : null;
  const tile = (b, s) => '<div class="stat"><b>' + b + '</b><span class="small">' + s + '</span></div>';
  const act = (a, t, s, v) => '<button class="qa" data-a="' + a + '"' + (v ? ' data-v="' + v + '"' : '') + '><span style="font-size:15px;font-weight:600">' + t + '</span><span class="small">' + s + '</span></button>';
  const fb = fbList(), notes = notesList();
  let h = '<main class="wrap nonav">' + skyHead('<div class="between" style="margin-bottom:14px"><span class="pill">Only you see this</span>' + closeBtn() + '</div><div class="between" style="align-items:flex-end"><div class="col" style="gap:8px"><h1 class="hello">Dashboard</h1><p class="skysub">' + (viewOnly() ? 'Viewing Chhaya\'s app, read only.' : 'You\'re in your test space.') + '</p></div><button class="modebtn" data-a="ownerMode">' + (viewOnly() ? 'Back to mine' : 'View her app') + '</button></div>');
  if (!glance) h += '<p class="sub">Loading Chhaya\'s data…</p>';
  else {
    const g = glance;
    if (g.flags.length) h += '<section class="card col flagcard" style="gap:12px"><span class="eyebrow">Worth a gentle check-in</span>' + g.flags.map(f => '<div class="col" style="gap:3px' + (f.urgent ? ';padding:10px 12px;border-radius:14px;background:var(--flagBg)' : '') + '"><span style="font-size:16px;font-weight:700">' + esc(f.t) + '</span>' + (f.s ? '<span class="small" style="color:var(--ink2)">' + esc(f.s) + '</span>' : '') + (f.tip ? '<span class="small">' + esc(f.tip) + '</span>' : '') + '</div>').join('') + '</section>';
    const arrow = (a, b) => a == null || b == null || a === b ? '' : a < b ? ' <span style="color:#2E7556">↓</span>' : ' <span style="color:#B8400E">↑</span>';
    h += '<section class="card col" style="gap:14px"><div class="between"><span class="serif" style="font-size:22px">At a glance</span><button class="link" data-a="admRefresh">Refresh</button></div><div class="grid2">'
      + tile(g.last ? (g.last === TODAY ? 'Today' : g.last === addDays(TODAY, -1) ? 'Yesterday' : shortDate(g.last)) : 'Not yet', 'last opened' + (g.lastT ? ' · ' + g.lastT : ''))
      + tile(g.week + '<small style="font-size:14px"> / ' + g.wdN + '</small>', 'days opened this week')
      + tile(g.sleep != null ? fmtH(g.sleep) : '–', 'average sleep, last 7 nights' + (g.sleepN ? ' (' + g.sleepN + ' logged)' : ''))
      + tile(g.rt + (g.rtT ? '<small style="font-size:14px"> / ' + g.rtT + '</small>' : ''), 'rTMS sessions')
      + tile(g.lw ? g.lw.score + arrow(g.lw.score, g.pw && g.pw.score) : '–', 'latest PHQ-9 (0 to 27, lower is lighter)')
      + tile(g.lw && g.lw.gad != null ? g.lw.gad + arrow(g.lw.gad, g.pw && g.pw.gad) : '–', 'latest GAD-2 (0 to 6)')
      + '</div>' + (g.cs.length ? '<div class="col" style="gap:8px"><span class="small">This week\'s check-ins</span><div class="mixbar">' + ['lp', 'hp', 'lu', 'hu'].filter(k => g.mix[k]).map(k => '<span style="flex:' + g.mix[k] + ';background:' + QUADS[k].bg + '"></span>').join('') + '</div><span class="small">' + g.cs.map(c => esc(c.w)).join(', ') + '</span></div>' : '<span class="small">No check-ins yet this week.</span>') + '</section>';
  }
  h += '<div class="qagrid">' + act('noteNew', 'Leave a note', 'Now or at a set time') + act('pushSheet', 'Send a notification', 'Straight to her phone') + '<button class="qa" data-a="go" data-v="report" data-p=\'{"hers":1}\'><span style="font-size:15px;font-weight:600">Her health report</span><span class="small">PDF for her clinic</span></button>' + act('go', 'Her activity', 'Last 14 days', 'activity') + '</div>';
  h += '<section class="card col" style="gap:6px"><div class="between"><span class="serif" style="font-size:22px">Suggestions</span><button class="link" data-a="go" data-v="feedback">All ' + (fb.length || '') + '</button></div>'
    + (fb.length ? fb.slice(0, 3).map(x => '<button class="between divrow" style="padding:10px 0;gap:10px;border:none;background:none;text-align:left;width:100%" data-a="go" data-v="feedback"><span class="clamp3" style="font-size:15px">' + esc(x.text || 'Screenshot') + '</span><span class="fbst ' + fbStatus(x) + '">' + FBST[fbStatus(x)][1] + '</span></button>').join('') : '<span class="small">Nothing from her yet.</span>') + '</section>';
  h += '<section class="card col" style="gap:6px"><div class="between"><span class="serif" style="font-size:22px">Notes</span><button class="link" data-a="noteNew">New</button></div>'
    + (notes.length ? notes.slice(0, 3).map(n => '<div class="between divrow" style="padding:10px 0;gap:10px"><span class="clamp3" style="font-size:15px">' + esc(n.text) + '</span><span class="small" style="flex-shrink:0">' + (n.seen ? 'Seen ♥' : !noteLive(n) ? 'Scheduled' : 'Not yet') + '</span></div>').join('') : '<span class="small">None yet.</span>') + '</section>';
  const vl = VER && VER.live, vt = VER && VER.test;
  h += '<section class="card col" style="gap:10px"><div class="between"><span class="serif" style="font-size:22px">Releases</span><button class="link" data-a="go" data-v="whatsnew">Her update log</button></div><div class="grid2">'
    + tile(vl ? 'v' + esc(vl.version) : '–', 'live for Chhaya' + (vl && vl.at ? ' · ' + shortDate(vl.at.slice(0, 10)) : '')) + tile(vt ? 'v' + esc(vt.version) : '–', 'test version' + (vt && vt.at ? ' · ' + shortDate(vt.at.slice(0, 10)) : '')) + '</div>'
    + '<span class="small">' + (vl && vt && vl.build === vt.build ? 'Both match: nothing waiting.' : 'Test on your Prapti Beta, then tell Claude "release".') + '</span></section>';
  const bk = BK && BK.latest;
  if (!BK) loadBackups();
  h += '<section class="card col" style="gap:10px"><div class="between"><span class="serif" style="font-size:22px">Backups</span><span class="small">' + (bk ? 'Last night: ' + shortDate(bk.date) : BK && BK.ready === false ? 'Not set up yet' : 'Checking…') + '</span></div>'
    + '<span class="small">A full copy of everything she enters is saved every night. Tap to keep a copy in Google Drive: choose Drive, then Prapti App, then 1. Daily backups.</span>'
    + '<div class="qagrid">' + (bk ? '<button class="qa" data-a="bkLatest"><span style="font-size:15px;font-weight:600">Save last night\'s</span><span class="small">' + shortDate(bk.date) + '</span></button>' : '') + '<button class="qa" data-a="bkNow"><span style="font-size:15px;font-weight:600">Back up now</span><span class="small">Everything, as of this minute</span></button></div></section>';
  const logs = ADM ? ADM.logs : [];
  h += '<section class="card col" style="gap:8px"><div class="between"><span class="serif" style="font-size:22px">App health</span><span class="small">' + (logs.length ? logs.length + (logs.length === 1 ? ' error' : ' errors') + ' this week' : 'No errors this week') + '</span></div>'
    + logs.slice(0, 4).map(e => '<div class="col divrow" style="gap:2px;padding:8px 0"><span class="small">' + esc((e.at || '').slice(0, 16).replace('T', ' ')) + ' · ' + esc(e.kind) + ' · ' + esc(e.route || '') + '</span><span style="font-size:13px;word-break:break-word">' + esc(String(e.detail || '').slice(0, 160)) + '</span></div>').join('')
    + '<span class="small">Everything she enters is saved permanently in the database, one record per day.</span></section>';
  return h + '</main>';
};
A.goAdmin = () => go('admin');
function adminEntry() {
  if (!OWNER || viewOnly()) return '';
  if (!ADM) loadHer().catch(() => {});
  const n = ADM ? withHer(() => computeFlags()).length : 0;
  return '<button class="admcard" data-a="goAdmin"><span class="admic">' + I.admin + '</span><span class="col" style="gap:2px;flex:1;min-width:0"><span style="font-size:16px;font-weight:700">Your dashboard</span><span class="small">' + (n ? n + (n === 1 ? ' thing' : ' things') + ' worth a gentle check-in' : 'Chhaya at a glance, notes, suggestions, releases') + '</span></span>' + (n ? '<span class="admbadge">' + n + '</span>' : '') + I.right + '</button>';
}
A.admRefresh = () => { ADM = null; VER = null; render(true); };
A.pushSheet = () => sheet('<div class="between"><span class="h2">Send a notification</span>' + closeBtn('closeSheet') + '</div><p class="sub">Arrives on her phone straight away, from "Prapti".</p><input id="pushT" class="field" maxlength="60" placeholder="Title, e.g. Thinking of you" value="From Tilak"><textarea id="pushB" class="ruled" style="height:110px;font-style:normal" maxlength="160" placeholder="Short message…"></textarea><button class="btn" data-a="pushSend">Send</button>');
A.pushSend = async () => {
  const t = ($('#pushT').value || '').trim() || 'From Tilak', b = ($('#pushB').value || '').trim(); if (!b) return toast('Write a message first');
  toast('Sending…');
  try { const { data } = await sb.auth.getSession(); const r = await fetch(SB_URL + '/functions/v1/notify', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + data.session.access_token }, body: JSON.stringify({ custom: { title: t, body: b } }) }); const j = await r.json().catch(() => ({})); closeSheet(); toast(r.ok ? (j.sent ? 'Sent to her phone' : 'Her phone isn\'t registered for reminders yet') : 'The notification service needs updating first'); }
  catch (e) { toast('Couldn\'t reach the notification service'); }
};
function navHTML(on) {
  const b = (k, l, a) => '<button class="' + (on === k ? 'on' : '') + '" data-a="' + a + '"' + (on === k ? ' aria-current="page"' : '') + '>' + I[k] + l + '</button>';
  return '<div class="in">' + b('today', 'Today', 'goToday') + b('darshan', 'Darshan', 'goFeed') + '<button class="lotus" data-a="goCalm" aria-label="Calm space">' + iconLotus(false) + '</button>' + b('grow', 'Grow', 'goGrow') + b('me', 'Me', 'goMe') + '</div>';
}

/* view-only guards: Tilak can look at her screen exactly as she sees it, but his taps never send or mark things as her */
{ const f = A.fbSend; A.fbSend = (el, e) => { if (viewOnly()) { closeSheet(); return toast('View only: this is her screen'); } return f(el, e); }; }
{ const f = A.noteSeen; A.noteSeen = (el, e) => { if (viewOnly()) return toast('View only: she hasn\'t seen it yet'); return f(el, e); }; }

/* ===================== Be kind to yourself (self-compassion break, interactive) ===================== */
const KFEEL = [['failing', 'Like I\'m failing'], ['hard', 'Hard on myself'], ['behind', 'Behind everyone else'], ['mistake', 'I made a mistake'], ['burden', 'Like a burden'], ['other', 'Something else']];
const KWORD = ['Hurt', 'Stress', 'Sadness', 'Fear', 'Shame', 'Tiredness', 'Loneliness', 'Worry'];
const KPHRASE = {
  failing: ['I\'m doing my best with what I have today.', 'Struggling is not the same as failing.', 'I can start again, as many times as I need.'],
  hard: ['I wouldn\'t speak to a friend this way. I deserve the same kindness.', 'I\'m allowed to be a work in progress.', 'I can be gentle with myself right now.'],
  behind: ['My path is my own, and it is unfolding.', 'I am enough as I am today.', 'Maharaj\'s timing, not the world\'s.'],
  mistake: ['Everyone makes mistakes. I can learn and let go.', 'One mistake doesn\'t define me.', 'I can put it right, gently.'],
  burden: ['I am loved, not tolerated.', 'The people who love me want to help.', 'Letting others care for me is a gift to them too.'],
  other: ['May I be kind to myself.', 'May I give myself what I need.', 'This will pass. I\'ll be gentle with myself until it does.'],
};
const KDIYA = ['For you, right now', 'For everyone who feels this today', 'For the people who love you'];
let KD = null;
const HEARTP = 'M12 20.5s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 7.5 2.7c0 5.8-7.5 10.4-7.5 10.4z';
const diyaSVG = on => '<svg width="64" height="74" viewBox="0 0 64 74" aria-hidden="true"><g class="flame' + (on ? ' on' : '') + '"><ellipse cx="32" cy="30" rx="12" ry="16" fill="rgba(255,190,110,.35)"/><path d="M32 12c5 8 8 12 8 17a8 8 0 0 1-16 0c0-5 3-9 8-17z" fill="#FFB347"/><path d="M32 22c2.5 4 4 6 4 8.5a4 4 0 0 1-8 0c0-2.5 1.5-4.5 4-8.5z" fill="#FFF1C9"/></g><path d="M8 46h48c-2 12-12 19-24 19S10 58 8 46z" fill="#C4550F"/><path d="M8 46h48" stroke="#8E3A0A" stroke-width="2" stroke-linecap="round"/><path d="M20 55c8 3 16 3 24 0" stroke="#F6B48A" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/></svg>';
V.kind = p => {
  if (!KD) KD = { feel: '', word: '', lit: 0, phrase: '', own: '', said: 0, held: 0 };
  const s = (p && p.s) || 0, N = 6;
  const dots = '<div class="dots">' + Array.from({ length: N }, (_, i) => '<span class="' + (i === s ? 'on' : i < s ? 'past' : '') + '"></span>').join('') + '</div>';
  let body = '', next = 'Next', ok = true;
  if (s === 0) {
    body = '<span class="eyebrow">Be kind to yourself</span><h1 class="h1 kh">What\'s weighing on you?</h1><p class="sub">Pick what\'s closest. It shapes the kind words at the end.</p><div class="kchips">' + KFEEL.map(f => '<button class="kchip' + (KD.feel === f[0] ? ' on' : '') + '" data-a="kFeel" data-k="' + f[0] + '">' + f[1] + '</button>').join('') + '</div>';
    next = KD.feel ? 'Next' : 'Skip this'; }
  else if (s === 1) {
    body = '<span class="eyebrow">Soothing touch</span><h1 class="h1 kh">Place a hand on your heart.</h1><p class="sub">Now press and hold the heart below for three slow breaths. Feel the warmth of your hand.</p>'
      + '<button class="khold' + (KD.held >= 1 ? ' done' : '') + '" id="khold" aria-label="Press and hold for three breaths"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" class="kr0"/><circle cx="100" cy="100" r="86" class="kr1" id="kring" style="stroke-dashoffset:' + (540 * (1 - KD.held)) + '"/></svg><span class="kheart"><svg width="84" height="84" viewBox="0 0 24 24"><path d="' + HEARTP + '" fill="currentColor"/></svg></span><span class="kbreath" id="kbreath">' + (KD.held >= 1 ? 'Well done' : 'Press and hold') + '</span></button>';
    next = KD.held >= 1 ? 'Next' : 'Skip'; }
  else if (s === 2) {
    body = '<span class="eyebrow">Notice it</span><h1 class="h1 kh">' + (KD.word ? 'This is a moment of ' + KD.word.toLowerCase() + '.' : 'Name what you feel.') + '</h1><p class="sub">' + (KD.word ? 'It\'s real, and it\'s allowed. Like every feeling, it will pass.' : 'Naming a feeling softens it. Tap the closest word.') + '</p><div class="kchips">' + KWORD.map(w => '<button class="kchip' + (KD.word === w ? ' on' : '') + '" data-a="kWord" data-w="' + w + '">' + w + '</button>').join('') + '</div>';
    next = KD.word ? 'Next' : 'Skip'; }
  else if (s === 3) {
    body = '<span class="eyebrow">You\'re not alone</span><h1 class="h1 kh">Light a diya.</h1><p class="sub">Swipe up on each one. Maharaj &amp; Swami are with you in this moment.</p>' + diyaScene()
      + '<p class="serif it kline' + (KD.lit >= 3 ? '' : ' hide') + '" id="kline">Right now, many people feel exactly as you do. You are held.</p>'
      + '<button class="link ktap" data-a="kLight"' + (KD.lit >= 3 ? ' style="visibility:hidden"' : '') + '>Can\'t swipe? Tap to light them</button>';
    next = KD.lit >= 3 ? 'Next' : 'Skip'; }
  else if (s === 4) {
    const L = KPHRASE[KD.feel || 'other'];
    body = '<span class="eyebrow">Kind words</span><h1 class="h1 kh">What would you say to a friend feeling this?</h1><p class="sub">Choose words for yourself, or write your own.</p><div class="col" style="gap:10px;width:100%">' + L.map(x => '<button class="kopt' + (KD.phrase === x ? ' on' : '') + '" data-a="kPhrase" data-t="' + esc(x) + '">' + esc(x) + '</button>').join('')
      + '<textarea id="kOwn" class="ruled kown" style="height:74px" placeholder="Or in your own words…" data-in="kOwn">' + esc(KD.own) + '</textarea></div>';
    ok = !!(KD.phrase || KD.own.trim()); next = 'Next'; }
  else {
    const ph = KD.own.trim() || KD.phrase;
    body = '<span class="eyebrow">Say it slowly</span><div class="ksay"><p class="serif it">“' + esc(ph) + '”</p></div><p class="sub">Say it to yourself three times, softly. Tap after each one.</p>'
      + '<button class="ksaybtn" data-a="kSaid" aria-label="Said it">' + [0, 1, 2].map(i => '<i class="' + (i < KD.said ? 'on' : '') + '"></i>').join('') + '<span>' + (KD.said >= 3 ? 'Beautiful' : KD.said ? (3 - KD.said) + ' more' : 'I said it') + '</span></button>'
      + (KD.said >= 3 && KD.feel === 'burden' ? '<p class="small" style="max-width:320px">If feeling like a burden is strong or keeps coming back, please tell someone you trust today. You matter to them.</p>' : '');
    next = 'Done'; }
  return '<div class="kindpage"><main class="stage" style="--ctabg:transparent"><div class="between">' + dots + closeBtn('kindClose') + '</div>'
    + '<div class="grow1 fade kbody">' + body + '</div>'
    + '<div class="navbtns">' + (s ? '<button class="back" data-a="kindStep" data-d="-1" aria-label="Back">' + I.back + '</button>' : '') + '<button class="btn" style="background:#A23B4F' + (ok ? '' : ';opacity:.45') + '" data-a="kindStep" data-d="1">' + next + '</button></div></main></div>';
};
V.kind_after = p => {
  diyaDrag();
  const b = $('#khold'); if (!b || KD.held >= 1) return;
  let raf = 0, t0 = 0, base = KD.held; const DUR = 15000;
  const tick = t => { if (!t0) t0 = t; KD.held = Math.min(1, base + (t - t0) / DUR); const r = $('#kring'); if (r) r.style.strokeDashoffset = 540 * (1 - KD.held);
    const ph = ((t - t0 + base * DUR) % 5000) / 5000, w = $('#kbreath'); if (w) w.textContent = ph < 0.45 ? 'Breathe in…' : '…and out';
    b.style.setProperty('--ks', 1 + 0.08 * Math.sin(Math.PI * Math.min(1, ph / 0.45)) * (ph < 0.45 ? 1 : 0) + (ph >= 0.45 ? 0.08 * (1 - (ph - 0.45) / 0.55) : 0));
    if (KD.held >= 1) { hap(); render(true); return; } raf = requestAnimationFrame(tick); };
  const start = e => { e.preventDefault(); base = KD.held; t0 = 0; b.classList.add('holding'); hap(); raf = requestAnimationFrame(tick); };
  const stop = () => { cancelAnimationFrame(raf); b.classList.remove('holding'); const w = $('#kbreath'); if (w && KD.held < 1) w.textContent = KD.held > 0 ? 'Hold to continue' : 'Press and hold'; };
  b.addEventListener('pointerdown', start); ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, stop)); b.addEventListener('contextmenu', e => e.preventDefault());
};
A.kind = () => { KD = null; go('kind', { s: 0 }); };
A.kFeel = el => { KD.feel = KD.feel === el.dataset.k ? '' : el.dataset.k; KD.phrase = ''; render(true); };
A.kWord = el => { KD.word = KD.word === el.dataset.w ? '' : el.dataset.w; hap(); render(true); };
A.kLight = () => { const el = document.querySelector('.kd[data-i]:not(.on)'); if (el) igniteDiya(el); };
A.kPhrase = el => { KD.phrase = el.dataset.t; KD.own = ''; render(true); };
INP.kOwn = el => { KD.own = el.value; if (KD.own.trim()) { KD.phrase = ''; document.querySelectorAll('.kopt.on').forEach(x => x.classList.remove('on')); } const btn = $('.navbtns .btn'); if (btn) btn.style.opacity = KD.own.trim() ? '' : '.45'; };
A.kSaid = el => { if (KD.said < 3) { KD.said++; hap(); if (KD.said === 3) burstEl(el, 14, ['#A23B4F', '#F2B8C6', '#F6B48A']); render(true); } };
A.kindStep = el => {
  const s = route.p.s + +el.dataset.d;
  if (+el.dataset.d > 0 && route.p.s === 4 && !(KD.phrase || KD.own.trim())) return toast('Choose some words, or write your own');
  if (s >= 6) {
    const ph = KD.own.trim() || KD.phrase, dd = day();
    if (!viewOnly()) { dd.calm = (dd.calm || []).concat(['kind']); dd.kind = (dd.kind || []).concat([{ feel: KD.feel, word: KD.word, phrase: ph, at: new Date().toTimeString().slice(0, 5) }]); save('days/' + TODAY);
      S.settings.kindWords = [ph].concat((S.settings.kindWords || []).filter(x => x !== ph)).slice(0, 12); save('settings'); }
    hap(); KD = null; toast('Kept in your words'); return back('calm');
  }
  go('kind', { s: Math.max(0, s) }, { replace: true }); window.scrollTo(0, 0);
};
A.kindClose = () => { KD = null; back('calm'); };
function kindCard() {
  const last = (S.settings.kindWords || [])[0];
  return '<button class="kbanner" data-a="kind"><span class="kbglow" aria-hidden="true"></span><span class="col" style="gap:6px;position:relative;z-index:1;flex:1;min-width:0"><span class="eyebrow" style="color:#F6C9D3">Self-compassion · 2 min</span><span class="serif" style="font-size:clamp(26px,7.6vw,30px);line-height:1.05">Be kind to yourself</span><span style="font-size:14px;color:#EBC9CF;line-height:1.4">' + (last ? 'Last time: “' + esc(last.length > 60 ? last.slice(0, 58) + '…' : last) + '”' : 'For the moments you\'re hard on yourself') + '</span></span>'
    + '<span class="kbheart" aria-hidden="true"><i></i><i></i><i></i><svg width="46" height="46" viewBox="0 0 24 24"><path d="' + HEARTP + '" fill="#FBE3E8"/></svg></span></button>';
}

/* weekly check-in: a quick double tap must never skip a question (especially the last PHQ-9 item) */
{ const f = A.wkAns; A.wkAns = (el, e) => { if (!WK || WK.busy === WK.s) return; const s0 = WK.s; WK.busy = s0; f(el, e); setTimeout(() => { if (WK && WK.busy === s0) WK.busy = null; }, 320); }; }
/* the check-in page always starts fresh unless it was opened by choosing a feeling */
{ const f = A.go; A.go = (el, e) => { if (el.dataset.v === 'checkin') CI = null; return f(el, e); }; }

/* ---------- Light a diya: swipe up on each one ---------- */
const KDLAB = ['For you', 'For everyone who feels this', 'For those who love you'];
const KDEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'
  + '<linearGradient id="kfl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E0701E"/><stop offset=".55" stop-color="#FFB347"/><stop offset="1" stop-color="#FFE8A8"/></linearGradient>'
  + '<radialGradient id="kgl"><stop offset="0" stop-color="#FFD89A" stop-opacity=".75"/><stop offset="1" stop-color="#FFB347" stop-opacity="0"/></radialGradient>'
  + '<linearGradient id="kbw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9832F"/><stop offset="1" stop-color="#A8400C"/></linearGradient></defs></svg>';
const KFLAME = '<g class="glow"><circle cx="40" cy="34" r="30" fill="url(#kgl)"/></g><g class="flame"><g class="fl"><path d="M40 53 C29 45 30 30 40 12 C50 30 51 45 40 53 Z" fill="url(#kfl)"/><path d="M40 51 C35 46 35.5 38 40 29 C44.5 38 45 46 40 51 Z" fill="#FFF6D6"/></g></g>';
const diyaBowl = () => '<path d="M40 53v5" stroke="#4A2412" stroke-width="2" stroke-linecap="round"/>'
  + '<path d="M12 58 C18 54 62 54 68 58 C65 74 53 82 40 82 C27 82 15 74 12 58 Z" fill="url(#kbw)"/><ellipse cx="40" cy="58" rx="28" ry="4.5" fill="#F6B48A"/><ellipse cx="40" cy="58" rx="21" ry="2.6" fill="#7A2E0A" opacity=".55"/>';
function diyaScene() {
  const lit = KD.litSet || (KD.litSet = []);
  return '<div class="kscene' + (lit.length >= 3 ? ' all' : '') + '" id="kscene">' + KDEFS + '<span class="kbloom" aria-hidden="true"></span>'
    + [0, 1, 2].map(i => '<div class="kd' + (lit.includes(i) ? ' on' : '') + '" data-i="' + i + '"><span class="kring"></span><span class="kup" aria-hidden="true"></span><svg width="80" height="90" viewBox="0 0 80 90" aria-hidden="true">' + KFLAME + diyaBowl() + '</svg><span class="klab">' + KDLAB[i] + '</span></div>').join('') + '</div>';
}
function igniteDiya(el) {
  if (!el || el.classList.contains('on')) return;
  const i = +el.dataset.i, lit = KD.litSet || (KD.litSet = []); if (!lit.includes(i)) lit.push(i); KD.lit = lit.length;
  el.classList.add('on', 'just'); hap();
  for (let k = 0; k < 6; k++) { const s = document.createElement('i'); s.className = 'kspark'; s.style.setProperty('--dx', (Math.random() * 36 - 18).toFixed(0) + 'px'); s.style.setProperty('--dy', (-26 - Math.random() * 34).toFixed(0) + 'px'); s.style.animationDelay = (k * 40) + 'ms'; el.appendChild(s); setTimeout(() => s.remove(), 1400); }
  if (KD.lit >= 3) setTimeout(() => { const sc = $('#kscene'); if (sc) sc.classList.add('all'); const l = $('#kline'); if (l) l.classList.remove('hide'); const t = $('.ktap'); if (t) t.style.visibility = 'hidden'; const nb = $('.navbtns .btn'); if (nb) nb.textContent = 'Next'; }, 600);
}
function diyaDrag() {
  const sc = $('#kscene'); if (!sc || sc.dataset.wired) return; sc.dataset.wired = '1';
  let d = null, y0 = 0;
  sc.addEventListener('pointerdown', e => { const el = e.target.closest('.kd:not(.on)'); if (!el) return; e.preventDefault(); d = el; y0 = e.clientY; el.classList.add('press'); try { sc.setPointerCapture(e.pointerId); } catch (x) {} });
  sc.addEventListener('pointermove', e => { if (!d) return; const up = y0 - e.clientY; d.style.setProperty('--lift', Math.max(0, Math.min(1, up / 40))); if (up > 40) { d.classList.remove('press'); d.style.removeProperty('--lift'); igniteDiya(d); d = null; } });
  const end = () => { if (d) { d.classList.remove('press'); d.style.removeProperty('--lift'); } d = null; };
  ['pointerup', 'pointercancel'].forEach(ev => sc.addEventListener(ev, end));
}

/* ---------- Backups: nightly copies in the private 'backups' bucket, and a one-tap copy to Drive ---------- */
let BK = null;
async function loadBackups() {
  BK = { ready: null };
  try {
    const months = [TODAY.slice(0, 7), addDays(TODAY.slice(0, 7) + '-01', -1).slice(0, 7)];
    for (const m of months) {
      const { data, error } = await sb.storage.from('backups').list(m.replace('-', '/'), { limit: 100, sortBy: { column: 'name', order: 'desc' } });
      if (error) { BK.ready = false; break; }
      const f = (data || []).filter(x => /\.json$/.test(x.name)).sort((a, b) => b.name.localeCompare(a.name))[0];
      if (f) { BK = { ready: true, latest: { path: m.replace('-', '/') + '/' + f.name, date: f.name.match(/(\d{4}-\d{2}-\d{2})/)[1] } }; break; }
      BK.ready = false;
    }
  } catch (e) { BK = { ready: false }; }
  if (route && route.v === 'admin') render(true);
}
A.bkLatest = async () => {
  if (!BK || !BK.latest) return; toast('Fetching backup…');
  try { const { data, error } = await sb.storage.from('backups').download(BK.latest.path); if (error) throw error; lastPdf = new File([data], 'prapti-backup-' + BK.latest.date + '.json', { type: 'application/json' }); deliverPdf(lastPdf); }
  catch (e) { toast('Couldn\'t fetch the backup'); }
};
A.bkNow = async () => {
  toast('Collecting everything…');
  try {
    const r = await pageAll(() => sb.from('docs').select('id,col,data').order('id')); if (r.error) throw r.error;
    const docs = (r.data || []).filter(d => d.col !== 'sandbox' && d.col !== 'logs');
    const body = JSON.stringify({ app: 'Prapti', backup: TODAY, made: new Date().toISOString(), count: docs.length, docs });
    lastPdf = new File([body], 'prapti-backup-' + TODAY + '.json', { type: 'application/json' }); deliverPdf(lastPdf);
  } catch (e) { logErr('backup', e.message || e); toast('Couldn\'t make the backup'); }
};

/* Backups for Chhaya (Me > App > Backups): the same nightly copies, plus back up now */
async function bkSheet() {
  const bk = BK && BK.latest;
  sheet('<div class="between"><span class="h2">Backups</span>' + closeBtn('closeSheet') + '</div>'
    + '<p class="sub">Every night a full copy of everything you enter is saved privately. You can also keep a copy in Google Drive.</p>'
    + (bk ? '<button class="btn" data-a="bkLatest">Save last night\'s backup</button><span class="small" style="text-align:center">From ' + shortDate(bk.date) + '</span>' : BK ? '<p class="small">No nightly backup yet. Use Back up now.</p>' : '<p class="small">Checking for last night\'s backup…</p>')
    + '<button class="btn soft" data-a="bkNow">Back up now</button>'
    + '<p class="small">When your phone asks where to save, choose Google Drive, then Prapti App, then 1. Daily backups.</p>');
}
A.bkSheet = async () => { bkSheet(); if (!BK || !BK.latest) { await loadBackups(); if ($('.sheet')) bkSheet(); } };
