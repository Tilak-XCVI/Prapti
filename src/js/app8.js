/* ===== Prapti v2: design language, Today, darshan, mala, share, milestones, recaps ===== */
Object.assign(G_ICON, {
  journal: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19l7-7"/>',
  week: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  photo: '<rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/>',
});
const hidden = k => !!((S.settings.hide || {})[k]);

/* ---------- haptics: Android vibrates; iPhone (iOS 18+) gets a light tap via the system switch ---------- */
let hapEl = null;
function hap() {
  try { if (navigator.vibrate && navigator.vibrate(10)) return; } catch (e) {}
  try {
    if (!hapEl) { hapEl = document.createElement('label'); hapEl.setAttribute('aria-hidden', 'true'); hapEl.style.cssText = 'position:fixed;left:-200px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden'; const i = document.createElement('input'); i.type = 'checkbox'; i.setAttribute('switch', ''); i.tabIndex = -1; hapEl.appendChild(i); document.body.appendChild(hapEl); }
    hapEl.click();
  } catch (e) {}
}
function hapPattern(ts) { ts.forEach(t => t ? setTimeout(hap, t) : hap()); }

/* ---------- time of day ---------- */
function greet() { const h = now().getHours(); return h < 4 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function tod() { const h = now().getHours(); return h >= 5 && h < 11 ? 't-morn' : h >= 11 && h < 17 ? 't-day' : h >= 17 && h < 21 ? 't-eve' : 't-night'; }
function skyHead(inner) { return '<header class="sky ' + tod() + '"><div class="skybg" aria-hidden="true"><span class="sun"></span><span class="haze"></span><span class="glow3"></span></div>' + inner + '</header>'; }
function todayView() {
  const { m, ti } = dailyPair(TODAY), own = ownList(), n = dayNum(TODAY), pool = DAILY_MURTIS.length + own.length, slot = ((n % pool) + pool) % pool;
  return slot >= DAILY_MURTIS.length ? pairView({ own: own[slot - DAILY_MURTIS.length].id, ti }) : pairView({ m, ti });
}

/* ---------- lotus progress: one petal per task (up to 9), swaying in a light breeze ---------- */
let lotusPrev = { d: '', f: -1 };
function lotusSVG(n, k) {
  const P = n ? Math.min(n, 9) : 5, fill = !n ? 0 : n <= 9 ? k : Math.round(k / n * 9), full = n > 0 && k >= n;
  const spread = P === 1 ? 0 : Math.min(164, 28 * (P - 1));
  const angs = Array.from({ length: P }, (_, i) => P === 1 ? 0 : -spread / 2 + i * spread / (P - 1));
  const order = angs.map((a, i) => [Math.abs(a) + i * .001, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const on = new Set(order.slice(0, fill)), fresh = lotusPrev.d === TODAY && fill > lotusPrev.f ? new Set(order.slice(Math.max(0, lotusPrev.f), fill)) : new Set();
  lotusPrev = { d: TODAY, f: fill };
  const draw = [...angs.keys()].sort((a, b) => Math.abs(angs[b]) - Math.abs(angs[a])), t = performance.now() / 1000;
  let s = '<svg class="lotusP' + (full ? ' full' : '') + '" viewBox="0 0 120 104" role="img" aria-label="' + (n ? k + ' of ' + n + ' done' : 'Nothing set yet') + '"><defs>'
    + '<linearGradient id="lgOn" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#B84A0B"/><stop offset=".55" stop-color="#D8651C"/><stop offset="1" stop-color="#F08A4B"/></linearGradient>'
    + '<linearGradient id="lgOnB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9E3F0A"/><stop offset="1" stop-color="#E07A38"/></linearGradient>'
    + '<linearGradient id="lgOff" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#EFD2BA"/><stop offset="1" stop-color="#FFFBF6"/></linearGradient>'
    + '<linearGradient id="lgOffB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E6C4A8"/><stop offset="1" stop-color="#FFF7EE"/></linearGradient></defs>'
    + '<ellipse cx="60" cy="96" rx="40" ry="4" fill="rgba(160,80,30,.12)"/>';
  draw.forEach(i => {
    const a = Math.abs(angs[i]), L = 62 - a * .16, W = 15 + a * .03, g = on.has(i) ? (a > 20 ? 'lgOnB' : 'lgOn') : (a > 20 ? 'lgOffB' : 'lgOff');
    const dur = 7 + (i % 3), delay = -((t + i * 1.7) % dur);
    const d = 'M60 92 C ' + (60 - W) + ' ' + (92 - L * .42) + ', ' + (60 - W * .6) + ' ' + (92 - L * .86) + ', 60 ' + (92 - L) + ' C ' + (60 + W * .6) + ' ' + (92 - L * .86) + ', ' + (60 + W) + ' ' + (92 - L * .42) + ', 60 92 Z';
    s += '<g transform="rotate(' + angs[i].toFixed(1) + ' 60 92)"><g class="lp" style="animation-duration:' + dur + 's;animation-delay:' + delay.toFixed(2) + 's">'
      + (fresh.has(i) ? '<path d="' + d + '" fill="url(#' + (a > 20 ? 'lgOffB' : 'lgOff') + ')"/>' : '')
      + '<path class="' + (on.has(i) ? 'on' : 'off') + (fresh.has(i) ? ' new' : '') + '" d="' + d + '" fill="url(#' + g + ')" style="filter:drop-shadow(0 1px 1.5px rgba(150,70,20,.18))"/></g></g>';
  });
  return s + '</svg>';
}

/* ---------- wording that follows the day she picked ---------- */
const NUMW = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
function todaySub(mode, n, k) {
  if (!n) return mode === 'hard' ? 'Nothing set. That\'s allowed.' : 'Nothing on the list yet. Add one thing.';
  if (k >= n) return k + ' of ' + n + ' · all done';
  const h = now().getHours(), N = n <= 10 ? cap1(NUMW[n]) : n;
  if (mode === 'hard') return k ? k + ' of ' + n + '. That already counts.' : 'Just these. One at a time.';
  if (!k) return h >= 13 ? 'Nothing ticked yet. Pick the easiest one and go.' : mode === 'good' ? N + ' on the list. Let\'s get them done.' : N + ' on the list. Start with the first.';
  if (mode === 'good') return k + ' of ' + n + '. Keep the momentum.';
  return k + ' of ' + n + '. Keep going.';
}
const MODE_LINE = {
  good: '<b style="color:var(--ink)">Good day:</b> everything on your list, plus your good-day extras. Make it count.',
  steady: '<b style="color:var(--ink)">Steady:</b> your every-day list. Aim to clear it.',
  hard: '<b style="color:var(--ink)">Hard day:</b> just your minimums, plus anything you add. One thing done on a heavy day counts fully. <button class="link" style="font-size:13px" data-a="goCalm">Calm space</button> ·',
};
function celeLine(n, mode) {
  const L = mode === 'hard'
    ? [['All done'], ['All done, on a hard day'], ['All done. Rest now']]
    : [['All done'], [n > 1 && n <= 10 ? cap1(NUMW[n]) + ' for ' + NUMW[n] : 'All done'], ['Clean sweep'], ['All done'], ['List cleared'], ['Every box ticked']];
  return L[((dayNum(TODAY) % L.length) + L.length) % L.length];
}
function celebrate() {
  hapPattern([0, 110, 220]);
  if (reduced()) return;
  const l = $('.lotusP'); if (l) { const r = l.getBoundingClientRect(), d = document.createElement('div'); d.className = 'lotusRing'; d.style.left = (r.left + r.width / 2) + 'px'; d.style.top = (r.top + r.height / 2) + 'px'; document.body.appendChild(d); setTimeout(() => d.remove(), 1400); }
  softFall(12);
}
function softFall(n) {
  if (reduced()) return; const fx = fxLayer(), cols = ['#F6B48A', '#E9A93A', '#F2B8C6', '#C4550F'];
  for (let i = 0; i < n; i++) { const e = document.createElement('i'), dur = 3.4 + Math.random() * 2; e.className = 'softfall'; e.style.left = (Math.random() * 100) + 'vw'; e.style.background = cols[i % 4]; e.style.setProperty('--sx', (Math.random() * 80 - 40) + 'px'); e.style.setProperty('--r', (Math.random() * 360) + 'deg'); e.style.animationDuration = dur + 's'; e.style.animationDelay = (Math.random() * .9) + 's'; fx.appendChild(e); setTimeout(() => e.remove(), (dur + 1.2) * 1000); }
}

/* ---------- check-in on Today ---------- */
const MOODS = [['hu', 'Stressed'], ['hp', 'Upbeat'], ['lu', 'Low'], ['lp', 'Calm']];
function checkinBlock(dd) {
  const cs = dd.checkins || [], last = cs[cs.length - 1], h = now().getHours();
  const reopen = last && h >= 13 && toMins(last.at) < 13 * 60;
  if (last && !reopen) return '<button class="moodline" data-a="go" data-v="checkin"><span class="dot" style="background:' + QUADS[last.q].bg + '"></span><span style="font-size:15px"><b>' + esc(last.w) + '</b> <span style="color:var(--faint)">· ' + mins(toMins(last.at)) + '</span></span><span class="link" style="margin-left:auto">Check in again</span></button>';
  return '<section class="card col" style="gap:14px"><div class="between" style="align-items:baseline"><span class="serif" style="font-size:clamp(22px,6.4vw,25px);line-height:1.1">' + (reopen ? 'How\'s the afternoon?' : 'How are you right now?') + '</span><span class="small">10 sec</span></div>'
    + '<div class="mood4">' + MOODS.map(([k, l]) => '<button style="background:' + QUADS[k].bg + '" data-a="ciStart" data-k="' + k + '">' + l + '</button>').join('') + '</div></section>';
}
function duoTiles(dd) {
  const cs = dd.checkins || [], last = cs[cs.length - 1], h = now().getHours(), reopen = false, ciDue = !last;
  const sl = dd.sleep, slLogged = sl && sl.bed, slDue = !slLogged && !(sl && sl.skipped) && h < 15 && !OWNER;
  const tile = (a, v, ic, title, sub, due) => '<button class="duo' + (due ? ' due' : '') + '" data-a="' + a + '" data-v="' + v + '"><span class="duoic">' + ic + (due ? '<i class="duedot"></i>' : '') + '</span><span class="col" style="gap:2px;min-width:0"><span class="serif" style="font-size:20px;line-height:1.1">' + title + '</span><span class="small">' + sub + '</span></span></button>';
  const face = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.8 1.6 5.2 1.6 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/></svg>';
  return '<div class="duorow">'
    + tile('go', 'checkin', face, ciDue ? (reopen ? 'How\'s the afternoon?' : 'How are you?') : (last.q === 'hp' || last.q === 'lp' ? esc(last.w) : 'Checked in'), ciDue ? 'Check in' : (cs.length > 1 ? cs.length + ' today · ' : '') + 'Check in again', ciDue)
    + tile('go', slDue ? 'sleeplog' : 'sleep', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + G_ICON.sleep + '</svg>', slLogged ? fmtH(sleepHours(sl)) : 'Sleep', slLogged ? 'last night' : slDue ? 'How did you sleep?' : 'Your nights', slDue)
    + '</div>';
}
A.ciStart = el => { CI = { step: 1, q: el.dataset.k, w: null, tags: [], note: '', extraTags: [] }; go('checkin'); };
A.ciHard = () => { day().mode = 'hard'; save('days/' + TODAY); CI = null; stack = []; go('today', null, { replace: true }); toast('Hard day. Just your minimums.'); };

/* ---------- Today ---------- */
function darshanChip() { const v = todayView(); return '<button class="dchip" data-a="rereadDarshan" aria-label="Open today\'s darshan">' + imgTag(v, '') + 'Today\'s darshan' + I.right.replace('#B3A393', 'currentColor') + '</button>'; }
V.today = () => {
  const dd = day(), items = todayItems(TODAY), done = items.filter(i => dd.done[i.id]).length, all = items.length > 0 && done === items.length, mode = dd.mode || 'steady';
  const task = i => '<div class="row" style="gap:0;position:relative">'
    + '<button class="task' + (dd.done[i.id] ? ' done' : '') + (lastTicked === i.id && dd.done[i.id] ? ' just' : '') + (i.sabha ? ' sabha' : '') + '" data-a="tog" data-id="' + esc(i.id) + '" aria-pressed="' + !!dd.done[i.id] + '"><span class="rip"></span><span class="tick">' + (dd.done[i.id] ? I.tick : '') + '</span><span class="tt">' + esc(i.t) + (i.sabha ? '<span class="small" style="display:block;text-decoration:none">' + (dd.done[i.id] ? 'You went. Jay Swaminarayan.' : 'Tap when you\'ve been') + '</span>' : '') + (i.rtms ? '<span class="small" style="display:block">' + (dd.done[i.id] ? 'Counted. ' + S.rtms.sessions.length + ' sessions so far.' : 'Tap when you\'ve been') + '</span>' : '') + '</span></button>'
    + (i.first ? '<span class="firsttag">First thing</span>' : '') + (i.extra ? '<button class="xbtn" style="position:absolute;right:10px" data-a="rmExtra" data-id="' + i.id + '" aria-label="Remove ' + esc(i.t) + '">' + I.close + '</button>' : '')
    + '</div>';
  const pin = dd.pin ? '<div class="card" style="background:var(--tint);display:flex;flex-direction:column;gap:6px"><div class="between"><span class="eyebrow">Carry it today</span><button class="link" data-a="unpin" aria-label="Remove">' + I.close + '</button></div><p class="serif" style="font-size:20px;line-height:1.3">' + esc(dd.pin) + '</p></div>' : '';
  const sleepCard = (() => { const sl = S.settings.sleep; if (!sl) return ''; const h = now().getHours() * 60 + now().getMinutes(); const dw = ((h - sl.wind) % 1440 + 1440) % 1440; if (!(dw <= 120 || dw >= 1440 - 45)) return ''; return '<div class="darkcard" style="background:#2F4468;display:flex;gap:14px;align-items:center"><span class="itile sm" style="background:rgba(255,255,255,.14)">' + gicon('sleep') + '</span><span class="col" style="gap:4px"><span class="eyebrow" style="color:#C9D4EA">Wind down · ' + mins(sl.wind) + '</span><span style="font-size:15px;line-height:1.4">Dim the lights, phone away, arti or dhun. Wake at ' + mins(sl.wake) + '.</span></span></div>'; })();
  const cl = all ? celeLine(items.length, mode) : null;
  return '<main class="wrap">'
    + skyHead('<div class="between"><span class="pill">' + parse(TODAY).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '') + '</span>' + darshanChip() + '</div>'
      + '<div class="skyrow"><h1 class="hello" style="padding-bottom:6px">' + greet() + ',<br>Chhaya</h1>' + lotusSVG(items.length, done) + '</div>')
    + (OWNER ? '<button class="card" style="border:none;text-align:left;background:var(--pill);font-size:14px;line-height:1.45" data-a="ownerMode">' + (viewOnly() ? '<b>Chhaya\'s app, view only.</b> You\'re seeing her real day. <span class="link" style="font-size:14px">Back to my test space</span>' : '<b>Your test space.</b> Play freely; nothing here reaches Chhaya. <span class="link" style="font-size:14px">View her app</span>') + '</button>' : '')
    + noteCard()
    + pushCard()
    + (welcome ? '<p class="serif fade" style="font-size:21px;color:var(--saT)">' + welcome + '</p>' : '')
    + '<div class="seg" role="group" aria-label="How is today?">' + ['good', 'steady', 'hard'].map(k => '<button class="' + (mode === k ? 'on' : '') + '" data-a="mode" data-k="' + k + '" aria-pressed="' + (mode === k) + '">' + ({ good: 'Good day', steady: 'Steady', hard: 'Hard day' })[k] + '</button>').join('') + '</div>'
    + (showModeLine() ? '<p class="small" style="margin-top:-12px;line-height:1.5">' + MODE_LINE[mode] + ' <button class="link" style="font-size:13px" data-a="go" data-v="setup">Edit</button></p>' : '')
    + duoTiles(dd)
    + pin + sleepCard
    + '<div class="col" style="gap:10px">' + items.map(task).join('')
    + (all ? '<div class="cele' + (justFinished ? ' enter' : '') + '"><h3>' + cl[0] + '</h3></div>' : '')
    + '<div class="addrow"><input id="extra" placeholder="Add something for today" aria-label="Add something for today" data-enter="addExtra"><button class="iconbtn" style="background:var(--sa);color:#fff" data-a="addExtra" aria-label="Add">' + I.plus + '</button></div>'
    + extraChips(dd)
    + (rtmsTimeOn(TODAY) && !dd.noRtms && !dd.done.rtms ? '<button class="link" style="align-self:flex-start;color:var(--faint);font-weight:500" data-a="noRtms">No rTMS session today</button>' : '')
    + '</div>'
    + liftCard()
    + firstTomorrowCard()
    + recapCard()
    + smrutiMonthCard()
    + journalCard()
    + jobCard()
    + weeklyNudge()
    + '</main>';
};
V.today_after = () => { justFinished = false; lastTicked = null; fillPhotos(); };

/* ---------- morning darshan ---------- */
V.darshan = () => {
  const dd = day(), v = todayView(), ti = dailyPair(TODAY).ti;
  const q = { t: v.t, by: v.by, scan: v.mine ? '' : C.thoughts[ti].scan }; dView = v;
  const long = q.t.length > 200;
  return '<main class="wrap nonav dsh">'
    + '<div class="hero">' + imgTag(v, 'Today\'s darshan')
    + '<div class="herotop"><span class="glasspill">' + dayLabel(TODAY) + '</span><span class="row" style="gap:8px"><button class="glassbtn" data-a="shareToday" aria-label="Share today\'s darshan">' + I.share + '</button>' + (dd.begun ? '<button class="glassbtn" data-a="dshClose" aria-label="Close">' + I.close + '</button>' : '') + '</span></div>'
    + '<div class="heroq rise"><p class="quote' + (long ? ' clamp4' : '') + '" style="font-size:' + quoteSize(q.t) + '">“' + esc(q.t) + '”</p>'
    + '<div class="row" style="gap:12px;justify-content:space-between"><span class="by">' + esc(q.by) + '</span>' + (long || q.scan ? '<button class="link" style="color:#FFE2C8;font-size:13px" data-a="' + (v.mine ? 'ownQuote' : 'thought') + '" data-i="' + ti + '">' + (long ? 'Read more' : 'In his handwriting') + '</button>' : '') + '</div></div></div>'
    + '<div class="panel">'
    + '<h1 class="serif rise rise2" style="font-size:clamp(26px,7.6vw,32px);line-height:1.05">Jay Swaminarayan, Chhaya</h1>'
    + onThisDay()
    + '<div class="praptibox rise rise3"><label for="prapti" class="serif" style="font-size:20px;line-height:1.2">What have Maharaj &amp; Swami given me today?</label>'
    + '<textarea id="prapti" class="ruled" rows="2" style="height:68px" placeholder="Write a line…" data-in="prapti">' + esc(dd.prapti) + '</textarea></div>'
    + '<div style="flex:1;min-height:8px"></div><div class="cta"><button class="btn" data-a="begin">' + (dd.begun ? 'Back to today' : 'Begin my day') + '</button></div></div></main>';
};
A.dshClose = () => { stack = []; go('today', null, { replace: true }); };
V.darshan_after = () => { fillPhotos(); setTimeout(() => prepShare(dView), 600); };

/* ---------- share: the darshan page itself, as a 9:16 story ---------- */
let shareCache = { key: '', file: null, url: '' };
function lotusPath(g, x, y, size, color) {
  const sc = size / 24; g.save(); g.translate(x, y); g.scale(sc, sc); g.translate(0, -2.5); g.strokeStyle = color; g.lineWidth = 1.6; g.lineCap = 'round'; g.lineJoin = 'round';
  ['M12 20c-4 0-8-3-8-7 3 0 6 1 8 4 2-3 5-4 8-4 0 4-4 7-8 7z', 'M12 17c-2-2-3-5-3-8 1 0 2 1 3 2 1-1 2-2 3-2 0 3-1 6-3 8z'].forEach(p => g.stroke(new Path2D(p))); g.restore();
}
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r[0], y); g.lineTo(x + w - r[1], y); g.quadraticCurveTo(x + w, y, x + w, y + r[1]); g.lineTo(x + w, y + h - r[2]); g.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h); g.lineTo(x + r[3], y + h); g.quadraticCurveTo(x, y + h, x, y + h - r[3]); g.lineTo(x, y + r[0]); g.quadraticCurveTo(x, y, x + r[0], y); g.closePath(); }
async function buildShare(v) {
  const key = (v.photo || v.src || '') + '|' + v.t;
  if (shareCache.key === key && shareCache.file) return shareCache.file;
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  g.fillStyle = '#F7F1E8'; g.fillRect(0, 0, W, H);
  const img = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = () => rej(new Error('image')); i.src = v.photo ? photoSrc(v.photo) : v.src; });
  const ih = 1060, sc = Math.max(W / img.naturalWidth, ih / img.naturalHeight), dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
  g.drawImage(img, (W - dw) / 2, (ih - dh) * 0.22, dw, dh);
  g.fillStyle = '#F7F1E8'; rrect(g, 0, ih - 64, W, H - ih + 64, [64, 64, 0, 0]); g.fill();
  try { await Promise.all([document.fonts.load('72px "Instrument Serif"'), document.fonts.load('600 34px Figtree'), document.fonts.load('700 30px Figtree')]); } catch (e) {}
  const pad = 84; let y = ih + 30;
  g.font = '600 34px Figtree, sans-serif'; const lab = dayLabel(TODAY), tw = g.measureText(lab).width;
  g.fillStyle = '#EDE2D3'; rrect(g, pad, y, tw + 60, 66, [33, 33, 33, 33]); g.fill(); g.fillStyle = '#6B4A33'; g.fillText(lab, pad + 30, y + 45);
  y += 66 + 110;
  const size = v.t.length <= 80 ? 74 : v.t.length <= 150 ? 62 : v.t.length <= 230 ? 54 : 48, lh = size * 1.18;
  g.fillStyle = '#2A1A12'; g.font = size + 'px "Instrument Serif", Georgia, serif';
  const words = ('“' + v.t + '”').split(' '), lines = []; let line = '';
  words.forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > W - pad * 2) { lines.push(line); line = w; } else line = t; }); lines.push(line);
  const maxL = Math.floor((H - y - 250) / lh), show = lines.slice(0, maxL); if (lines.length > maxL) show[maxL - 1] = show[maxL - 1].replace(/\s+\S*$/, '…');
  show.forEach(l => { g.fillText(l, pad, y); y += lh; });
  g.fillStyle = '#A8470C'; g.font = '700 30px Figtree, sans-serif'; try { g.letterSpacing = '4px'; } catch (e) {} g.fillText(String(v.by || '').toUpperCase(), pad, y + 24); try { g.letterSpacing = '0px'; } catch (e) {}
  const fy = H - 120, grd = g.createLinearGradient(0, fy, 0, fy + 64); grd.addColorStop(0, '#DB6A1E'); grd.addColorStop(1, '#B84A0B');
  g.fillStyle = grd; rrect(g, pad, fy, 64, 64, [16, 16, 16, 16]); g.fill(); lotusPath(g, pad + 8, fy + 8, 48, '#FFF6EC');
  g.fillStyle = '#8A7666'; g.font = '500 30px Figtree, sans-serif'; g.fillText('Today\'s darshan', pad + 88, fy + 43);
  g.textAlign = 'right'; g.fillText('Jay Swaminarayan', W - pad, fy + 43); g.textAlign = 'left';
  const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.9));
  if (shareCache.url) URL.revokeObjectURL(shareCache.url);
  shareCache = { key, file: new File([blob], 'darshan.jpg', { type: 'image/jpeg' }), url: URL.createObjectURL(blob) };
  return shareCache.file;
}
function prepShare(v) { if (v) buildShare(v).catch(e => logErr('share-prep', e.message || e)); }
async function shareFile(file) {
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file] });
    else sheet('<div class="between"><span class="h2">Save the image</span>' + closeBtn('closeSheet') + '</div><p class="sub">Press and hold the picture, then choose Save or Share.</p><img src="' + shareCache.url + '" alt="Today\'s darshan" style="width:100%;border-radius:18px">');
  } catch (e) { if (e && e.name === 'NotAllowedError') sheet('<div class="between"><span class="h2">Ready to share</span>' + closeBtn('closeSheet') + '</div><img src="' + shareCache.url + '" alt="" style="width:62%;align-self:center;border-radius:14px"><button class="btn" data-a="shareNow">Share</button>'); else if (e && e.name !== 'AbortError') { toast('Couldn\'t share that one'); logErr('share', e.message || e); } }
}
async function shareDarshan(v) {
  const key = (v.photo || v.src || '') + '|' + v.t;
  if (shareCache.key === key && shareCache.file) return shareFile(shareCache.file);
  toast('Getting it ready…');
  try { await buildShare(v); } catch (e) { toast('Couldn\'t make the image'); logErr('share', e.message || e); return; }
  sheet('<div class="between"><span class="h2">Ready to share</span>' + closeBtn('closeSheet') + '</div><img src="' + shareCache.url + '" alt="" style="width:62%;align-self:center;border-radius:14px"><button class="btn" data-a="shareNow">Share</button>');
}
A.shareNow = () => { closeSheet(); if (shareCache.file) shareFile(shareCache.file); };
A.shareToday = () => shareDarshan(dView || todayView());

/* ---------- mala: solid tassel, chant along, light that follows the mantra ---------- */
function malaSVG(n, complete) {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  const R = 138, C = 155, gap = 0.11, off = dark ? 'rgba(247,241,232,.16)' : '#E3D6C6', on = '#C4550F';
  let svg = '<svg width="100%" height="100%" viewBox="0 0 310 310" style="position:absolute;inset:0;overflow:visible" aria-hidden="true"><defs><linearGradient id="tassel" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="' + (complete ? '#F08A4B' : '#B84A0B') + '"/><stop offset="1" stop-color="' + (complete ? '#F6B48A' : '#E07A2E') + '"/></linearGradient></defs>';
  for (let k = 0; k < 108; k++) { const a = -Math.PI / 2 + gap / 2 + k * (2 * Math.PI - gap) / 107, x = (C + R * Math.cos(a)).toFixed(2), y = (C + R * Math.sin(a)).toFixed(2), cur = !complete && k === n - 1; if (cur) svg += '<circle cx="' + x + '" cy="' + y + '" r="7.5" fill="rgba(246,180,138,.28)"/>'; svg += '<circle cx="' + x + '" cy="' + y + '" r="3.3" fill="' + (k < n || complete ? (cur ? '#F6B48A' : on) : off) + '"/>'; }
  const sx = C, sy = C - R, col = complete ? '#F6B48A' : '#C4550F';
  svg += '<circle cx="' + sx + '" cy="' + sy + '" r="5.5" fill="' + col + '"/>'
    + '<rect x="' + (sx - 3.5) + '" y="' + (sy - 13) + '" width="7" height="7" rx="2.5" fill="' + (complete ? '#F6B48A' : '#D8651C') + '"/>'
    + '<path d="M' + (sx - 3) + ' ' + (sy - 13) + ' C ' + (sx - 4) + ' ' + (sy - 22) + ', ' + (sx - 11) + ' ' + (sy - 34) + ', ' + (sx - 11) + ' ' + (sy - 44) + ' Q ' + sx + ' ' + (sy - 49) + ' ' + (sx + 11) + ' ' + (sy - 44) + ' C ' + (sx + 11) + ' ' + (sy - 34) + ', ' + (sx + 4) + ' ' + (sy - 22) + ', ' + (sx + 3) + ' ' + (sy - 13) + ' Z" fill="url(#tassel)"/>'
    + '<rect x="' + (sx - 5.5) + '" y="' + (sy - 19) + '" width="11" height="3.5" rx="1.6" fill="' + (complete ? '#FFE2C8' : '#F6B48A') + '"/></svg>';
  return svg;
}
const PLAYI = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>', PAUSEI = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>';
V.mala = () => {
  const m = malaData(), complete = m.n >= 108;
  return '<main class="wrap nonav malawrap' + (malaMantra ? ' playing' : '') + '" style="align-items:center;text-align:center;gap:0">'
    + '<div class="malabg" aria-hidden="true"><i style="width:340px;height:340px;background:#C4550F;top:18%;left:-28%"></i><i style="width:280px;height:280px;background:#A23B4F;top:46%;right:-32%"></i><i style="width:240px;height:240px;background:#D9A441;top:2%;right:-14%"></i></div>'
    + '<div class="between" style="width:100%"><span class="pill">Mala</span>' + closeBtn('malaClose') + '</div>'
    + '<h1 class="serif" style="font-size:clamp(26px,7.6vw,30px);margin-top:18px">' + (complete ? 'Mala complete' : 'Tap anywhere to count') + '</h1><p class="sub" style="font-size:14px">' + (complete ? '108 names. Jay Swaminarayan.' : 'Swaminarayan · one tap for each bead') + '</p>'
    + '<div class="malaring" id="malaRing" style="width:min(300px,38dvh,80vw);height:min(300px,38dvh,80vw)">' + malaSVG(m.n, complete) + '<div class="malac">' + (complete ? '<span style="color:#F6B48A">' + I.lotus.replace('width="28" height="28"', 'width="96" height="96"').replace('stroke-width="1.7"', 'stroke-width="1.1"') + '</span><span class="serif" style="font-size:21px;margin-top:8px">Another mala?</span>' : '<span class="serif malan" id="malaN" style="font-size:clamp(60px,11dvh,96px)">' + m.n + '</span><span style="font-size:14px;opacity:.65;margin-top:4px">of 108</span>') + '</div></div>'
    + '<button class="chant" data-a="malaMantra"><span class="pb">' + (malaMantra ? PAUSEI : PLAYI) + '</span><span class="col" style="gap:2px"><b style="font-size:16px">' + (malaMantra ? 'Chanting along' : 'Chant along') + '</b><span class="small">Swaminarayan mantra</span></span></button>'
    + '<div class="col" style="gap:10px;align-items:center;margin-top:auto;padding-top:16px"><div class="row" style="gap:8px;font-size:14px;opacity:.85">' + (m.done ? Array.from({ length: Math.min(m.done, 9) }, () => '<i class="lg" style="background:var(--sa);border-radius:50%"></i>').join('') + ' ' + m.done + (m.done === 1 ? ' mala' : ' malas') + ' today' : 'No malas yet today') + '</div>'
    + '<div class="row" style="gap:10px"><button class="chip" data-a="malaUndo">Undo</button><button class="chip" data-a="malaReset">Reset</button></div></div></main>';
};
V.mala_after = () => { const w = $('.malawrap'); if (!w) return; w.addEventListener('pointerdown', e => { if (e.target.closest('button,a')) return; e.preventDefault(); malaTap(); }); if (malaMantra) malaLoop(); };
function malaTap() {
  const m = malaData();
  if (m.n >= 108) { m.n = 0; save('days/' + TODAY); render(true); return; }
  m.n++;
  if (m.n >= 108) { m.done = (m.done || 0) + 1; save('days/' + TODAY); hapPattern([0, 110, 220]); render(true); softFall(16); return; }
  if (m.n % 27 === 0) hapPattern([0, 110]); else hap();
  save('days/' + TODAY);
  const ring = $('#malaRing'); if (ring) { ring.querySelector('svg').outerHTML = malaSVG(m.n, false); const n = $('#malaN'); if (n) n.textContent = m.n; }
}
let malaAud = null, malaCtx = null, malaAn = null, malaRAF = 0;
function malaAudio() { if (!malaAud) { malaAud = new Audio(TRACKS[0].src); malaAud.loop = true; malaAud.preload = 'auto'; malaAud.setAttribute('playsinline', ''); } return malaAud; }
A.malaMantra = () => {
  const a = malaAudio(); malaMantra = !malaMantra;
  if (malaMantra) {
    try { const main = audio(); if (main && !main.paused) main.pause(); } catch (e) {}
    try { if (!malaCtx) { const AC = window.AudioContext || window.webkitAudioContext; malaCtx = new AC(); const src = malaCtx.createMediaElementSource(a); malaAn = malaCtx.createAnalyser(); malaAn.fftSize = 256; malaAn.smoothingTimeConstant = .8; src.connect(malaAn); malaAn.connect(malaCtx.destination); } if (malaCtx.state !== 'running') malaCtx.resume(); } catch (e) { malaAn = null; logErr('mala-audio', e.message); }
    a.play().catch(e => { malaMantra = false; logErr('mala-play', e.message); if (route.v === 'mala') render(true); });
  } else a.pause();
  render(true);
};
A.malaClose = () => { if (malaMantra && malaAud) malaAud.pause(); malaMantra = false; cancelAnimationFrame(malaRAF); back('calm'); };
function malaLoop() {
  cancelAnimationFrame(malaRAF); const buf = malaAn ? new Uint8Array(malaAn.frequencyBinCount) : null; let sm = .4;
  const step = t => {
    if (!malaMantra || !route || route.v !== 'mala') return;
    let amp = .45 + .25 * Math.sin(t / 700) * Math.sin(t / 2300);
    if (malaAn) { malaAn.getByteFrequencyData(buf); let s = 0; for (let i = 2; i < 40; i++) s += buf[i]; amp = Math.min(1, s / (38 * 150)); }
    sm = sm * .88 + amp * .12; const ts = t / 1000;
    document.querySelectorAll('.malabg i').forEach((e, i) => { const w = [1, .8, .65][i], ph = i * 1.9; e.style.transform = 'translate(' + (Math.sin(ts * .3 + ph) * 30).toFixed(1) + 'px,' + (Math.cos(ts * .25 + ph) * 24).toFixed(1) + 'px) scale(' + (.8 + sm * w * .5).toFixed(3) + ')'; e.style.opacity = (.12 + sm * w * .45).toFixed(3); });
    malaRAF = requestAnimationFrame(step);
  };
  malaRAF = requestAnimationFrame(step);
}

/* ---------- milestones: got the job, finished rTMS ---------- */
function msSheet(k) {
  const job = k === 'job';
  sheet('<div class="col" style="align-items:center;text-align:center;gap:14px;padding-top:6px"><span class="itile" style="width:64px;height:64px;border-radius:20px;background:' + (job ? 'linear-gradient(135deg,#D8651C,#A23B4F)' : '#2E7556') + '">' + gicon(job ? 'star' : 'leaf') + '</span>'
    + '<h2 class="hello" style="font-size:34px">' + (job ? 'You got the job.' : 'Course complete.') + '</h2>'
    + '<p class="sub">' + (job ? 'Congratulations, Chhaya. All that searching paid off.' : 'Every session done. Your clinic report stays in Me.') + '</p></div>'
    + '<textarea id="msNote" class="ruled" style="height:68px" placeholder="How does it feel? (saved to your journal)"></textarea>'
    + '<button class="btn" data-a="msSave" data-k="' + k + '">' + (job ? 'Save and tuck job search away' : 'Save and tuck rTMS away') + '</button>'
    + '<button class="btn soft" data-a="msSave" data-k="' + k + '" data-keep="1">Save, keep it on for now</button>');
  hapPattern([0, 110, 220]); softFall(14);
}
A.gotJob = () => msSheet('job');
A.rtmsDone = () => msSheet('rtms');
A.msSave = el => {
  const k = el.dataset.k, note = ($('#msNote') || {}).value || '', st = S.settings;
  st.milestones = Object.assign({}, st.milestones, { [k]: TODAY });
  if (!el.dataset.keep) st.hide = Object.assign({}, st.hide, { [k]: true });
  save('settings');
  const text = (k === 'job' ? 'I got the job.' : 'I finished my rTMS course.') + (note.trim() ? ' ' + note.trim() : '');
  const id = 'j' + Date.now().toString(36) + uid(); S.journal[id] = { id, date: TODAY, at: new Date().toTimeString().slice(0, 5), text }; save('journal/' + id);
  closeSheet(); render(true); toast('Saved to your journal');
};
A.featTog = el => { const k = el.dataset.k, st = S.settings; st.hide = Object.assign({}, st.hide, { [k]: !hidden(k) }); save('settings'); render(true); };
function myAppSection() {
  const t = (k, bg, ic, name, sub) => '<div class="setrow ic"><span class="itile sm" style="background:' + bg + '">' + gicon(ic) + '</span><span class="col" style="gap:2px;flex:1"><span style="font-size:16px;font-weight:600">' + name + '</span><span class="small">' + sub + '</span></span><button class="tg' + (hidden(k) ? ' off' : '') + '" role="switch" aria-checked="' + !hidden(k) + '" aria-label="' + name + '" data-a="featTog" data-k="' + k + '"></button></div>';
  const ms = S.settings.milestones || {};
  const mb = (a, bg, ic, name, sub) => '<button class="setrow ic" data-a="' + a + '"><span class="itile sm" style="background:' + bg + '">' + gicon(ic) + '</span><span class="col" style="gap:2px;flex:1"><span style="font-size:16px;font-weight:600">' + name + '</span><span class="small">' + sub + '</span></span>' + I.right + '</button>';
  return '<section class="col"><h2 class="h2" style="margin-bottom:4px">My app</h2>'
    + (OWNER ? '<button class="setrow ic" data-a="ownerMode"><span class="col" style="gap:2px;flex:1"><span style="font-size:16px;font-weight:600">' + (viewOnly() ? 'Showing: Chhaya\'s app (view only)' : 'Showing: my test space') + '</span><span class="small">Tap to switch to ' + (viewOnly() ? 'your test space' : 'her real app, view only') + '</span></span>' + I.right + '</button>' : '')

    + t('job', '#96610C', 'job', 'Job search', 'Weekly steps, the job guide') + t('rtms', '#A23B4F', 'rtms', 'rTMS', 'Sessions, schedule, clinic report')
    + (!ms.job && !hidden('job') ? mb('gotJob', 'linear-gradient(135deg,#D8651C,#A23B4F)', 'star', 'I got the job', 'Mark it, then tuck job search away') : '')
    + (!ms.rtms && !hidden('rtms') && S.rtms.sessions.length ? mb('rtmsDone', '#2E7556', 'leaf', 'I\'ve finished rTMS', 'Keeps your report, hides the rest') : '')
    + '<p class="small" style="padding-top:8px">Switching one off hides it. Nothing is deleted.</p></section>';
}

/* ---------- weekly recap (no streaks) ---------- */
function recapWeek() { const d = dow(TODAY); if (d === 0 && now().getHours() >= 17) return weekStart(TODAY); if (d === 1) return weekStart(addDays(TODAY, -1)); return null; }
function recapCard() {
  const wk = recapWeek(); if (!wk || S.settings.recapSeen === wk) return '';
  if (dow(TODAY) === 0 && !Object.keys(S.weekly).some(k => k >= weekStart(TODAY))) return '';
  const days = Array.from({ length: 7 }, (_, i) => addDays(wk, i)); if (!days.some(showedUp)) return '';
  return '<button class="card row" style="border:none;text-align:left;gap:14px;background:var(--tint)" data-a="go" data-v="recap" data-p=\'{"wk":"' + wk + '"}\'><span class="itile" style="background:#3E5A86">' + gicon('week') + '</span><span class="col" style="gap:2px;flex:1"><span class="eyebrow">Your week</span><span class="serif" style="font-size:21px;line-height:1.15">A look back at the last seven days</span></span>' + I.right + '</button>';
}
V.recap = p => {
  const wk = p.wk || weekStart(TODAY), days = Array.from({ length: 7 }, (_, i) => addDays(wk, i)), D = days.map(d => S.days[d]).filter(Boolean);
  const shown = days.filter(showedUp).length, ticks = D.reduce((n, d) => n + Object.values(d.done || {}).filter(Boolean).length, 0), malas = D.reduce((n, d) => n + ((d.mala && d.mala.done) || 0), 0);
  const sl = D.map(d => sleepHours(d.sleep)).filter(x => x != null), cis = D.flatMap(d => d.checkins || []);
  const freq = {}; cis.forEach(c => freq[c.w] = (freq[c.w] || 0) + 1); const top = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];
  const good = cis.filter(c => c.q === 'hp' || c.q === 'lp').length;
  const line = D.filter(d => d.prapti && d.prapti.trim()).sort((a, b) => a.date < b.date ? 1 : -1)[0];
  const st = (v, l) => '<div class="stat"><b>' + v + '</b><span class="small">' + l + '</span></div>';
  return '<main class="wrap nonav">' + skyHead('<div class="between"><span class="pill">' + rangeLabel(wk, days[6]) + '</span>' + closeBtn('recapClose') + '</div><h1 class="hello">Your week</h1><p class="skysub">' + (shown >= 5 ? 'You showed up most days. That adds up.' : shown ? 'You showed up ' + shown + (shown === 1 ? ' day' : ' days') + '. Every one of them counts.' : 'A quiet week. This one\'s a fresh start.') + '</p>')
    + '<div class="grid2 rise">' + st(shown, shown === 1 ? 'day you showed up' : 'days you showed up') + st(ticks, ticks === 1 ? 'thing ticked off' : 'things ticked off') + st(malas, malas === 1 ? 'mala' : 'malas') + st(sl.length ? fmtH(sl.reduce((a, b) => a + b, 0) / sl.length) : '–', 'average sleep') + '</div>'
    + (top ? '<section class="card col rise rise2" style="gap:6px"><span class="eyebrow">Most often you felt</span><span class="serif" style="font-size:26px">' + esc(top) + '</span>' + (good ? '<span class="small">' + good + ' pleasant check-in' + (good === 1 ? '' : 's') + ' this week.</span>' : '') + '</section>' : '')
    + (line ? '<section class="card col rise rise3" style="gap:8px;background:var(--tint)"><span class="eyebrow">A line you wrote · ' + shortDate(line.date) + '</span><p class="serif" style="font-size:22px;line-height:1.3">' + esc(line.prapti) + '</p></section>' : '')
    + '<div style="flex:1"></div><div class="cta"><button class="btn" data-a="recapClose">Onto the next week</button></div></main>';
};
A.recapClose = () => { const wk = (route.p && route.p.wk) || recapWeek(); if (wk) { S.settings.recapSeen = wk; save('settings'); } stack = []; go('today', null, { replace: true }); };

/* ---------- last month in smruti (first week of each month) ---------- */
function lastMonth() { const d = parse(TODAY); d.setDate(0); return d.toISOString().slice(0, 7); }
function smrutiIn(ym) { return Object.values(S.smruti || {}).filter(x => x && !x.deleted && (x.date || '').slice(0, 7) === ym).sort((a, b) => a.date < b.date ? -1 : 1); }
function smrutiMonthCard() {
  if (+TODAY.slice(8) > 7) return ''; const ym = lastMonth(); if (S.settings.smrutiSeen === ym) return '';
  const L = smrutiIn(ym); if (!L.length) return '';
  const mn = parse(ym + '-01').toLocaleDateString('en-GB', { month: 'long' });
  return '<button class="card row" style="border:none;text-align:left;gap:14px" data-a="go" data-v="smonth" data-p=\'{"ym":"' + ym + '"}\'><span class="itile" style="background:#1F6F78">' + gicon('photo') + '</span><span class="col" style="gap:2px;flex:1"><span class="eyebrow">Smruti · ' + mn + '</span><span class="serif" style="font-size:21px;line-height:1.15">' + L.length + (L.length === 1 ? ' memory' : ' memories') + ' from last month</span></span>' + I.right + '</button>';
}
V.smonth = p => {
  const L = smrutiIn(p.ym), mn = parse(p.ym + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  if (S.settings.smrutiSeen !== p.ym) { S.settings.smrutiSeen = p.ym; save('settings'); }
  return '<main class="wrap nonav"><div class="between"><span class="pill">Smruti</span>' + closeBtn() + '</div><div class="col" style="gap:6px"><h1 class="h1">' + mn + '</h1><p class="sub">Moments you kept last month.</p></div>'
    + L.map((x, i) => '<button class="card col rise" style="border:none;text-align:left;gap:10px;animation-delay:' + (i * .05) + 's" data-a="smOpen" data-id="' + x.id + '">' + (x.photos && x.photos.length ? '<img data-photo="' + esc(x.photos[0]) + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;background:var(--pill)">' : '') + '<span class="eyebrow">' + shortDate(x.date) + '</span>' + (x.title ? '<span class="serif" style="font-size:22px">' + esc(x.title) + '</span>' : '') + (x.text ? '<span class="sub clamp3">' + esc(x.text) + '</span>' : '') + '</button>').join('')
    + '</main>';
};
V.smonth_after = () => fillPhotos();

/* ---------- evening wins: what she ticked goes into her journal ---------- */
function saveWins(d) {
  if (OWNER || !ready) return; const dd = S.days[d]; if (!dd || dd.wins) return;
  const names = todayItemsFor(d).filter(i => dd.done && dd.done[i.id]).map(i => i.t); if (!names.length) return;
  dd.wins = true; save('days/' + d);
  const id = 'j' + Date.now().toString(36) + uid(); S.journal[id] = { id, date: d, at: '21:00', text: 'Today\'s wins: ' + names.join(' · '), auto: true }; save('journal/' + id);
}
function todayItemsFor(d) { try { return todayItems(d); } catch (e) { return []; } }
function winsCheck() { if (!USER || !ready) return; if (now().getHours() >= 21) saveWins(TODAY); saveWins(addDays(TODAY, -1)); }
setInterval(winsCheck, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(winsCheck, 4000); });

function rangeLabel(a, b) { const A = parse(a), B = parse(b), m = d => d.toLocaleDateString('en-GB', { month: 'long' }); return A.getMonth() === B.getMonth() ? A.getDate() + ' to ' + B.getDate() + ' ' + m(B) : A.getDate() + ' ' + m(A) + ' to ' + B.getDate() + ' ' + m(B); }

/* ---------- journal as a book ---------- */
function journalCard() {
  const js = Object.values(S.journal || {}).filter(x => !x.deleted), today = js.filter(j => j.date === TODAY).length;
  return '<button class="book" data-a="openJournal" aria-label="Open your journal"><span class="band" aria-hidden="true"></span><span class="ribbon" aria-hidden="true"></span>'
    + '<span class="col" style="gap:8px;position:relative"><span class="booktitle">Chhaya\'s Journal</span><span class="booksub">' + (today ? today + (today === 1 ? ' entry' : ' entries') + ' today' : js.length ? js.length + ' entries so far' : 'Your own space') + '</span></span></button>';
}
A.openJournal = el => { if (reduced() || !el || !el.classList) return go('journal'); el.classList.add('opening'); hap(); setTimeout(() => go('journal', { opened: 1 }), 380); };

/* ---------- mala banner in Calm space ---------- */
function malaBanner() {
  const m = (day().mala || {}), n = m.n || 0;
  return '<button class="malabanner" data-a="go" data-v="mala"><span class="col" style="gap:6px;position:relative;z-index:1;flex:1;min-width:0"><span class="eyebrow" style="color:var(--peachT)">Mala</span><span class="serif" style="font-size:clamp(26px,7.6vw,30px);line-height:1.05">Count 108 names</span><span style="font-size:14px;color:#CDBBA8">' + (m.done ? m.done + (m.done === 1 ? ' mala' : ' malas') + ' today' : n ? n + ' of 108 so far' : 'Tap to count, chant along') + '</span><span class="minichant">' + PLAYI + ' Chant along</span></span>'
    + '<span class="miniring" aria-hidden="true">' + malaSVG(n, n >= 108) + (n >= 108 ? '<span class="minilotus">' + monoLotus(34) + '</span>' : '<span class="serif">' + n + '</span>') + '</span></button>';
}

/* ---------- mala: light fades in and out with the mantra ---------- */
let malaFade = 0, malaFadeTo = 0;
A.malaMantra = () => {
  const a = malaAudio(); malaMantra = !malaMantra;
  if (malaMantra) {
    try { const main = audio(); if (main && !main.paused) main.pause(); } catch (e) {}
    try { if (!malaCtx) { const AC = window.AudioContext || window.webkitAudioContext; malaCtx = new AC(); const src = malaCtx.createMediaElementSource(a); malaAn = malaCtx.createAnalyser(); malaAn.fftSize = 256; malaAn.smoothingTimeConstant = .8; src.connect(malaAn); malaAn.connect(malaCtx.destination); } if (malaCtx.state !== 'running') malaCtx.resume(); } catch (e) { malaAn = null; logErr('mala-audio', e.message); }
    a.play().catch(e => { malaMantra = false; malaFadeTo = 0; malaBtn(); logErr('mala-play', e.message); });
    malaFadeTo = 1; malaLoop();
  } else { a.pause(); malaFadeTo = 0; }
  malaBtn();
};
function malaBtn() { const b = $('.chant'); if (!b) return; b.querySelector('.pb').innerHTML = malaMantra ? PAUSEI : PLAYI; b.querySelector('b').textContent = malaMantra ? 'Chanting along' : 'Chant along'; $('.malawrap').classList.toggle('playing', malaMantra); }
function malaLoop() {
  cancelAnimationFrame(malaRAF); const buf = malaAn ? new Uint8Array(malaAn.frequencyBinCount) : null; let sm = .4, last = performance.now();
  const step = t => {
    if (!route || route.v !== 'mala') { malaFade = 0; return; }
    const dt = Math.min(.1, (t - last) / 1000); last = t;
    malaFade += (malaFadeTo - malaFade) * Math.min(1, dt * 1.6);
    let amp = .45 + .25 * Math.sin(t / 700) * Math.sin(t / 2300);
    if (malaAn && malaMantra) { malaAn.getByteFrequencyData(buf); let s = 0; for (let i = 2; i < 40; i++) s += buf[i]; amp = Math.min(1, s / (38 * 150)); }
    sm = sm * .9 + amp * .1; const ts = t / 1000;
    document.querySelectorAll('.malabg i').forEach((e, i) => { const w = [1, .8, .65][i], ph = i * 1.9; e.style.transform = 'translate(' + (Math.sin(ts * .3 + ph) * 30).toFixed(1) + 'px,' + (Math.cos(ts * .25 + ph) * 24).toFixed(1) + 'px) scale(' + (.8 + sm * w * .5).toFixed(3) + ')'; e.style.opacity = ((.12 + sm * w * .45) * malaFade).toFixed(3); });
    if (!malaMantra && malaFade < .01) { document.querySelectorAll('.malabg i').forEach(e => e.style.opacity = 0); return; }
    malaRAF = requestAnimationFrame(step);
  };
  malaRAF = requestAnimationFrame(step);
}

/* ---------- view-only account: taps that would change her day just explain themselves ---------- */
['tog', 'mode', 'addExtra', 'extraChip', 'rmExtra', 'ciSave', 'sleepSave', 'setupDone', 'jSave', 'smSave', 'malaReset', 'jobAdd', 'jobTog', 'featTog', 'msSave'].forEach(k => { const f = A[k]; if (!f) return; A[k] = (el, e) => { if (viewOnly()) return toast('View only on your account'); return f(el, e); }; });

A.viewOnlyTog = () => { try { localStorage.setItem('prapti-viewonly', viewOnly() ? '0' : '1'); } catch (e) {} render(true); toast(viewOnly() ? 'View only on' : 'View only off. Your taps change her app.'); };

function moodName(k) { return (MOODS.find(m => m[0] === k) || ['', ''])[1]; }

function patternsReady() { return Object.values(S.days).filter(d => d && d.date <= TODAY && ((d.sleep && d.sleep.bed) || (d.checkins || []).length)).length >= 14; }

let modeChanged = false;
function showModeLine() { if (modeChanged) return true; const first = Object.keys(S.days).filter(k => S.days[k] && S.days[k].begun).sort()[0]; return !first || first >= addDays(TODAY, -6); }
{ const f = A.mode; A.mode = (el, e) => { modeChanged = true; return f(el, e); }; }

/* ===== Sign in: premium ===== */
const RECOVERY = /type=recovery/.test(location.hash);
const LOTUS_PATHS = '<path d="M12 20c-4 0-8-3-8-7 3 0 6 1 8 4 2-3 5-4 8-4 0 4-4 7-8 7z"/><path d="M12 17c-2-2-3-5-3-8 1 0 2 1 3 2 1-1 2-2 3-2 0 3-1 6-3 8z"/>';
function effTheme() { const a = document.documentElement.getAttribute('data-theme'); return a || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); }
function lgShell(inner) {
  const th = effTheme();
  return '<main class="login"><div class="loginbg" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'
    + '<div class="themeSw" role="group" aria-label="Appearance"><button class="' + (th === 'light' ? 'on' : '') + '" data-a="lgTheme" data-t="light" aria-label="Day mode"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button><button class="' + (th === 'dark' ? 'on' : '') + '" data-a="lgTheme" data-t="dark" aria-label="Night mode"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + G_ICON.sleep + '</svg></button></div>'
    + '<div class="lgMark"><span class="lgIcon">' + iconLotus(true) + '</span><h1 class="lgWord">' + WORDMARK + '</h1></div>'
    + inner + '</main>';
}
V.login = () => lgShell('<form class="lgForm" onsubmit="return false" novalidate>'
  + '<label class="fl"><input id="lgEmail" type="email" placeholder=" " autocomplete="username" inputmode="email" autocapitalize="off" value="' + esc(localStorage.getItem('prapti-last-email') || '') + '"><span>Email</span></label>'
  + '<label class="fl"><input id="lgPw" type="password" placeholder=" " autocomplete="current-password" data-enter="login"><span>Password</span></label>'
  + '<p id="lgErr" class="lgErr" role="status"></p>'
  + '<button class="lgBtn" data-a="login"><span class="t">Sign in</span><span class="spin" aria-hidden="true"></span></button>'
  + '<button class="lgForgot" type="button" data-a="forgot">Forgot password?</button></form>');
function lgMsg(t, ok) { const e = $('#lgErr'); if (e) { e.textContent = t; e.classList.toggle('ok', !!ok); } }
function lgShake() { const b = $('.lgBtn'); if (!b) return; b.classList.remove('busy', 'shake'); void b.offsetWidth; b.classList.add('shake'); hap(); }
A.login = async () => {
  const email = ($('#lgEmail').value || '').trim(), pw = $('#lgPw').value, btn = $('.lgBtn');
  if (!email || !pw) { lgMsg('Enter your email and password.'); return lgShake(); }
  if (btn.classList.contains('busy')) return;
  lgMsg(''); btn.classList.remove('shake'); btn.classList.add('busy');
  let res; try { res = await sb.auth.signInWithPassword({ email, password: pw }); } catch (e) { res = { error: e }; }
  if (res.error) { lgMsg(/invalid/i.test(res.error.message || '') ? 'That email or password isn\'t right.' : navigator.onLine ? (res.error.message || 'Couldn\'t sign in') : 'You\'re offline. Connect to sign in the first time.'); return lgShake(); }
  try { localStorage.setItem('prapti-last-email', email); } catch (e) {}
  btn.classList.add('done'); hap();
  flood(btn, 'var(--sa)', () => signedIn(res.data.user));
};
A.forgot = () => { lgMsg('Forgotten it? Message Tilak and he\'ll reset it for you.', true); hap(); };
A.lgTheme = el => { try { localStorage.setItem('prapti-theme', el.dataset.t); } catch (e) {} applyTheme(); document.querySelectorAll('.themeSw button').forEach(b => b.classList.toggle('on', b.dataset.t === el.dataset.t)); hap(); };
V.newpw = () => lgShell('<form class="lgForm" onsubmit="return false"><p class="lgHint">Choose a new password.</p>'
  + '<label class="fl"><input id="npw" type="password" placeholder=" " autocomplete="new-password" data-enter="newpwSave"><span>New password</span></label>'
  + '<p id="lgErr" class="lgErr" role="status"></p><button class="lgBtn" data-a="newpwSave"><span class="t">Save and continue</span><span class="spin" aria-hidden="true"></span></button></form>');
A.newpwSave = async () => {
  const pw = $('#npw').value, btn = $('.lgBtn');
  if (!pw || pw.length < 8) { lgMsg('Use at least 8 characters.'); return lgShake(); }
  btn.classList.add('busy');
  const { data, error } = await sb.auth.updateUser({ password: pw });
  if (error) { lgMsg(error.message || 'Couldn\'t save that password.'); return lgShake(); }
  try { history.replaceState(null, '', location.pathname); } catch (e) {}
  btn.classList.add('done'); flood(btn, 'var(--sa)', () => signedIn(data.user || USER));
};
/* a circle of colour that grows from a button to fill the screen, then fades into the next page */
function flood(el, colour, then) {
  if (reduced() || !el) { then(); return; }
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  const d = document.createElement('div'); d.className = 'flood'; d.style.cssText = 'left:' + (x - R) + 'px;top:' + (y - R) + 'px;width:' + 2 * R + 'px;height:' + 2 * R + 'px;background:' + colour;
  document.body.appendChild(d);
  requestAnimationFrame(() => d.classList.add('grow'));
  setTimeout(() => { then(); requestAnimationFrame(() => { d.classList.add('out'); setTimeout(() => d.remove(), 520); }); }, 480);
}

/* ===== Calm button: a soft bloom into Calm space ===== */
A.goCalm = el => {
  if (!el || !el.getBoundingClientRect || reduced()) return go('calm');
  hap(); el.classList.add('bloom');
  flood(el, 'radial-gradient(circle, var(--tint) 0%, var(--bg) 60%)', () => go('calm'));
};

/* ===== Her photo on Me ===== */
function avatarHTML() {
  const p = S.settings.avatar;
  return '<button class="avatar" data-a="avatarPick" aria-label="' + (p ? 'Change your photo' : 'Add your photo') + '">' + (p ? '<img data-photo="' + esc(p) + '" src="' + (photoSrc(p) || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=') + '" alt="">' : '<span class="serif">C</span>') + '<i class="avplus">' + I.plus + '</i></button>';
}
A.avatarPick = () => sheet('<div class="between"><span class="h2">Your photo</span>' + closeBtn('closeSheet') + '</div>'
  + '<label class="btn" for="avIn" style="cursor:pointer">' + (S.settings.avatar ? 'Choose a different photo' : 'Choose a photo') + '</label><input id="avIn" type="file" accept="image/*" hidden data-in="avatarFile">'
  + (S.settings.avatar ? '<button class="btn soft" data-a="avatarRemove">Remove photo</button>' : ''));
INP.avatarFile = async el => {
  const f = el.files && el.files[0]; el.value = ''; if (!f) return; closeSheet(); toast('Adding your photo…');
  try { const path = await storePhoto(f); S.settings.avatar = path; save('settings'); if (route.v === 'me') render(true); toast('Photo added'); } catch (e) { toast(e.message || 'Couldn\'t add that photo'); }
};
A.avatarRemove = () => { S.settings.avatar = ''; save('settings'); closeSheet(); render(true); };
V.me_after = () => fillPhotos();

const WORDMARK = '<svg viewBox="0 0 2113.23 873.06" fill="currentColor" role="img" aria-label="Prapti"><path d="M457.53,196.35c0,104.11-94.98,210.04-286.76,210.04h-43.84l.91,232.88H31.96V52.05c0-16.44-10.96-31.96-29.22-31.96H0v-3.65L126.94,0h73.06c170.78,0,257.53,96.8,257.53,196.35ZM350.68,222.83c0-102.28-71.23-211.87-185.39-211.87h-38.36v384.47h43.84c126.03,0,179.91-83.1,179.91-172.6Z"/><path d="M700.45,136.99c53.88,0,105.02,35.62,105.02,97.72,0,51.14-31.96,74.89-62.1,74.89-26.48,0-52.05-19.18-52.05-54.79,25.57,0,37.44-19.18,37.44-42.92,0-31.05-24.66-50.23-53.88-50.23-41.1,0-91.32,37.44-91.32,127.85l.91,349.77h-92.24V199.09c0-19.18-12.79-31.96-31.96-31.96v-3.65l123.29-15.52v73.06c21.92-57.53,70.32-84.02,116.89-84.02Z"/><path d="M1218.26,632.87c-27.4,7.31-52.05,10.05-71.23,10.05-73.97,0-111.42-39.27-117.81-115.07-20.09,79.45-83.1,116.89-144.29,116.89-66.67,0-130.59-44.75-130.59-128.77,0-173.52,274.88-153.42,274.88-231.05,0-95.89-24.66-135.16-62.1-135.16-34.7,0-53.88,32.88-53.88,62.1,0,22.83,10.96,42.01,36.53,42.01-4.57,38.36-30.14,56.62-55.71,56.62-29.22,0-58.45-23.74-58.45-68.49,0-64.84,63.01-100.46,128.77-100.46,73.97,0,153.42,44.75,153.42,141.55v194.52c0,77.62,6.39,154.34,73.06,154.34,7.31,0,16.44-.91,26.48-3.65l.91,4.57ZM933.33,603.65c47.49,0,95.89-39.27,95.89-128.77v-169.86c-28.31,61.19-184.47,44.75-184.47,199.09,0,63.93,43.84,99.54,88.58,99.54Z"/><path d="M1450.22,145.21c102.28,0,210.96,84.02,210.96,252.05s-96.8,237.44-196.35,237.44c-46.58,0-94.06-16.44-131.51-49.31v287.67h-92.24l-.91-678.54c0-15.52-12.79-28.31-28.31-28.31h-2.74v-3.65l123.29-16.44v43.84c32.88-30.14,74.88-44.75,117.81-44.75ZM1471.22,626.48c55.71,0,106.85-52.97,106.85-160.73,0-179.91-98.63-304.11-170.78-304.11-41.1,0-74.88,41.1-74.88,136.99v116.89c0,137.9,73.06,210.96,138.81,210.96Z"/><path d="M1885.82,629.22c10.96,0,21.92-1.83,34.7-4.57v5.48c-24.66,6.39-48.4,9.13-69.41,9.13-89.5,0-145.21-52.05-145.21-144.29l.91-340.64h-31.96v-8.22h31.96c46.58,0,86.76-94.98,86.76-146.12h5.48v146.12h71.23v8.22h-71.23l-.91,339.72c0,75.8,23.74,135.16,87.67,135.16Z"/><path d="M2113.23,629.22c-27.4,6.39-51.14,10.05-73.06,10.05-79.45,0-119.63-46.58-119.63-136.99V198.17c0-18.26-12.79-32.88-31.96-32.88v-2.74l123.29-16.44.91,327.85c0,77.63,6.39,154.34,73.06,154.34,7.31,0,16.44-.91,26.48-3.65l.91,4.57ZM1909.58,57.53c0-31.96,25.57-57.53,56.62-57.53s57.53,25.57,57.53,57.53-25.57,57.53-57.53,57.53-56.62-25.57-56.62-57.53Z"/></svg>';
/* the app icon's lotus: five filled cream petals; on sign-in they fan open */
function iconLotus(fan) {
  const angs = [-56, -28, 0, 28, 56], order = [0, 4, 1, 3, 2];
  let s = '<svg viewBox="0 0 120 104" aria-hidden="true"><defs><linearGradient id="icF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#F3D9C2"/><stop offset="1" stop-color="#FFFBF5"/></linearGradient><linearGradient id="icB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#E9C6A8"/><stop offset="1" stop-color="#FFF3E6"/></linearGradient></defs>';
  order.forEach(i => { const a = Math.abs(angs[i]), L = 62 - a * .16, W = 15 + a * .03;
    s += '<g transform="rotate(' + angs[i] + ' 60 92)"><path' + (fan ? ' class="fanp" style="--a:' + (-angs[i]) + 'deg;animation-delay:' + (.35 + (a / 28) * .12) + 's"' : '') + ' d="M60 92 C ' + (60 - W) + ' ' + (92 - L * .42) + ', ' + (60 - W * .6) + ' ' + (92 - L * .86) + ', 60 ' + (92 - L) + ' C ' + (60 + W * .6) + ' ' + (92 - L * .86) + ', ' + (60 + W) + ' ' + (92 - L * .42) + ', 60 92 Z" fill="url(#' + (a > 20 ? 'icB' : 'icF') + ')" style="filter:drop-shadow(0 1px 1.5px rgba(90,30,0,.25))"/></g>'; });
  return s + '</svg>';
}

/* sign-in always opens at the top (iPhone restores the old scroll position after sign-out otherwise) */
try { history.scrollRestoration = 'manual'; } catch (e) {}
V.login_after = V.newpw_after = () => { window.scrollTo(0, 0); requestAnimationFrame(() => window.scrollTo(0, 0)); };


/* ===== Suggestions and problem reports (her) → inbox (you) ===== */
let FB = null;
function fbList() { return Object.values(S.feedback || {}).filter(x => x && !x.deleted).sort((a, b) => (b.at || '') < (a.at || '') ? -1 : 1); }
function fbOpen() { return fbList().filter(x => !x.done).length; }
A.fbNew = () => { FB = { type: 'idea', text: '', photo: '' }; fbSheet(); };
function fbSheet() {
  sheet('<div class="between"><span class="h2">Tell Tilak</span>' + closeBtn('closeSheet') + '</div>'
    + '<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))">' + [['idea', 'An idea'], ['bug', 'Something\'s wrong']].map(x => '<button class="' + (FB.type === x[0] ? 'on' : '') + '" data-a="fbType" data-t="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>'
    + '<textarea id="fbText" class="ruled" style="height:136px" placeholder="' + (FB.type === 'bug' ? 'What happened, and where in the app?' : 'What would make Prapti better for you?') + '" data-in="fbText">' + esc(FB.text) + '</textarea>'
    + (FB.photo ? '<div class="row" style="gap:10px"><img src="' + (photoSrc(FB.photo) || '') + '" alt="" style="width:56px;height:56px;border-radius:12px;object-fit:cover"><span class="small" style="flex:1">Screenshot added</span><button class="link" data-a="fbNoPhoto">Remove</button></div>'
      : '<label class="chip" for="fbShot" style="align-self:flex-start;cursor:pointer">+ Add a screenshot</label><input id="fbShot" type="file" accept="image/*" hidden data-in="fbShot">')
    + '<button class="btn" data-a="fbSend">Send</button>');
  setTimeout(() => { const t = $('#fbText'); if (t) t.focus(); }, 60);
}
A.fbType = el => { FB.type = el.dataset.t; document.querySelectorAll('.sheet [data-a=fbType]').forEach(b => b.classList.toggle('on', b.dataset.t === FB.type)); const t = $('#fbText'); if (t) t.placeholder = FB.type === 'bug' ? 'What happened, and where in the app?' : 'What would make Prapti better for you?'; };
INP.fbText = el => { FB.text = el.value; };
INP.fbShot = async el => { const f = el.files && el.files[0]; el.value = ''; if (!f) return; toast('Adding screenshot…'); try { FB.photo = await storePhoto(f); fbSheet(); } catch (e) { toast(e.message || 'Couldn\'t add that'); } };
A.fbNoPhoto = () => { FB.photo = ''; fbSheet(); };
A.fbSend = el => {
  if (!FB.text.trim() && !FB.photo) return toast('Write a few words first');
  const id = 'f' + Date.now().toString(36) + uid();
  if (!S.feedback) S.feedback = {};
  S.feedback[id] = { id, type: FB.type, text: FB.text.trim(), photo: FB.photo, at: new Date().toISOString(), date: TODAY, from: route ? route.v : '', ver: APP_VER, ua: navigator.userAgent.slice(0, 140), standalone: !!(navigator.standalone || matchMedia('(display-mode: standalone)').matches), done: false };
  save('feedback/' + id); burstEl(el, 12); hap(); FB = null; closeSheet(); toast('Sent. Thank you.');
};
V.feedback = () => {
  const L = fbList();
  return '<main class="wrap nonav"><div class="between"><span class="pill">Suggestions</span>' + closeBtn() + '</div><div class="col" style="gap:6px"><h1 class="h1">From Chhaya</h1><p class="sub">Ideas and problems she\'s sent from the app.</p></div>'
    + (L.length ? L.map(x => '<section class="card col" style="gap:8px' + (x.done ? ';opacity:.6' : '') + '"><div class="between"><span class="eyebrow" style="color:' + (x.type === 'bug' ? '#B8400E' : 'var(--saT)') + '">' + (x.type === 'bug' ? 'Something\'s wrong' : 'Idea') + ' · ' + shortDate(x.date) + '</span>' + (x.done ? '<span class="small">Done</span>' : '') + '</div>'
      + (x.text ? '<p style="font-size:16px;line-height:1.5;white-space:pre-wrap">' + esc(x.text) + '</p>' : '')
      + (x.photo ? '<img data-photo="' + esc(x.photo) + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Screenshot" style="width:100%;border-radius:14px;background:var(--pill)">' : '')
      + '<span class="small">Sent from ' + esc(x.from || '?') + (x.standalone ? ' · home-screen app' : ' · browser') + '</span>'
      + '<button class="chip" style="align-self:flex-start" data-a="fbDone" data-id="' + x.id + '">' + (x.done ? 'Mark as open' : 'Mark as done') + '</button></section>').join('')
      : '<p class="sub">Nothing yet.</p>')
    + '</main>';
};
V.feedback_after = () => fillPhotos();
A.fbDone = el => { const x = S.feedback[el.dataset.id]; if (!x) return; x.done = !x.done; save('feedback/' + x.id); render(true); };

A.ownerMode = () => { try { localStorage.setItem('prapti-owner-mode', viewOnly() ? 'sandbox' : 'hers'); } catch (e) {} toast(viewOnly() ? 'Switching to your test space…' : 'Opening Chhaya\'s app…'); setTimeout(() => location.reload(), 400); };

/* ===== Push reminders ===== */
const VAPID_PUBLIC = 'BIOjrOZw87EXVFYR2gAYFCbbhp7O1RROQlK93DBOvZbi2zkY8tuJhNM4mMVMNGj3Jm0448QyHA_4c7kANNnCv8o';
const REMINDERS = [['darshan', 'Morning darshan', '7:00am'], ['start', 'Start the day', '10:00am, if Prapti isn\'t open yet'], ['checkin', 'Check-in', '1:00pm, if you haven\'t'], ['evening', 'Today\'s list', '7:30pm, if things are left'], ['rtms', 'rTMS', '1 hour before a session'], ['sabha', 'Sabha', '2 hours before, on Saturdays'], ['weekly', 'Weekly check-in', 'Sunday 6:00pm']];
function pushOK() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
function standalone() { return !!(navigator.standalone || matchMedia('(display-mode: standalone)').matches); }
function pushState() { if (!pushOK()) return standalone() ? 'unsupported' : 'browser'; return Notification.permission; }
function b64u8(s) { const p = '='.repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); }
async function saveSub() {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u8(VAPID_PUBLIC) });
  const j = sub.toJSON();
  const { error } = await sb.from('push_subs').upsert({ endpoint: j.endpoint, email: USER.email.toLowerCase(), sub: j, updated_at: new Date().toISOString() });
  if (error) throw error;
}
A.pushOn = async el => {
  if (!pushOK()) return toast(standalone() ? 'This iPhone needs iOS 16.4 or later for reminders' : 'Open Prapti from your home screen first');
  let perm;
  try { perm = await Notification.requestPermission(); } catch (e) { perm = 'denied'; }
  if (perm !== 'granted') { closeSheet(); return toast('Reminders are off. You can allow them in Settings, Notifications, Prapti.'); }
  try { await saveSub(); try { localStorage.setItem('prapti-push', '1'); } catch (e) {} hap(); closeSheet(); toast('Reminders on'); if (route.v === 'today' || route.v === 'me') render(true); }
  catch (e) { logErr('push-sub', e.message || e); toast('Couldn\'t turn reminders on. Try again in a moment.'); }
};
A.pushTest = async () => {
  toast('Sending a test…');
  try { const { data } = await sb.auth.getSession(); const r = await fetch(SB_URL + '/functions/v1/notify', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + data.session.access_token }, body: JSON.stringify({ test: true }) }); const j = await r.json().catch(() => ({})); toast(r.ok ? (j.sent ? 'Sent. It should arrive in a few seconds.' : 'No phone registered yet. Turn reminders on first.') : 'Reminders aren\'t set up on the server yet.'); }
  catch (e) { toast('Couldn\'t reach the reminder service'); }
};
A.remTog = el => { const k = el.dataset.k, st = S.settings; st.reminders = Object.assign({}, st.reminders, { [k]: st.reminders && st.reminders[k] === false }); save('settings'); remSheet(); };
function remOn(k) { return !(S.settings.reminders && S.settings.reminders[k] === false); }
function remSheet() {
  const st = pushState();
  let body;
  if (st === 'browser') body = '<p class="sub">Reminders work when Prapti is opened from your home screen. In Safari, tap Share, then Add to Home Screen, then open Prapti from there.</p>';
  else if (st === 'unsupported') body = '<p class="sub">Reminders need iOS 16.4 or later. Update your iPhone in Settings, General, Software Update.</p>';
  else if (st === 'denied') body = '<p class="sub">Notifications are blocked for Prapti. Turn them on in your iPhone Settings, Notifications, Prapti.</p>';
  else if (st === 'default') body = '<p class="sub">A gentle nudge at the right moments, never more than a few a day.</p><button class="btn" data-a="pushOn">Turn on reminders</button>';
  else body = (OWNER ? '<p class="sub">On your phone you\'ll get a ping when Chhaya sends a suggestion.</p>' : '<div class="card" style="padding:4px 16px">' + REMINDERS.filter(r => !(r[0] === 'rtms' && hidden('rtms'))).map(r => '<div class="setrow ic"><span class="col" style="gap:2px;flex:1"><span style="font-size:16px;font-weight:600">' + r[1] + '</span><span class="small">' + r[2] + '</span></span><button class="tg' + (remOn(r[0]) ? '' : ' off') + '" role="switch" aria-checked="' + remOn(r[0]) + '" aria-label="' + r[1] + '" data-a="remTog" data-k="' + r[0] + '"></button></div>').join('') + '</div>')
    + '<button class="btn soft" data-a="pushTest">Send a test</button>';
  closeSheet();
  sheet('<div class="between"><span class="h2">Reminders</span>' + closeBtn('closeSheet') + '</div>' + body);
}
A.remOpen = () => remSheet();
A.pushLater = () => { try { localStorage.setItem('prapti-push-card', 'no'); } catch (e) {} render(true); };
function pushCard() {
  if (OWNER || pushState() !== 'default' || !standalone()) return '';
  try { if (localStorage.getItem('prapti-push-card') === 'no') return ''; } catch (e) {}
  return '<div class="card row" style="gap:14px;background:var(--tint)"><span class="itile sm" style="background:var(--sa)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></span><span class="col" style="gap:8px;flex:1"><span style="font-size:15px;font-weight:600">Gentle reminders?</span><span class="row" style="gap:8px"><button class="chip" style="background:var(--sa);color:#fff" data-a="pushOn">Turn on</button><button class="chip" data-a="pushLater">Not now</button></span></span></div>';
}
// keep the phone's registration fresh whenever the app opens (iOS can rotate it)
setTimeout(() => { try { if (USER && pushOK() && Notification.permission === 'granted') saveSub().catch(e => logErr('push-refresh', e.message || e)); } catch (e) {} }, 6000);

/* ===== Activity: when she opens the app (her phone only), and a 14-day view for Tilak ===== */
function logOpen() {
  if (!USER || OWNER || !ready) return;
  const dd = day(), t = new Date().toTimeString().slice(0, 5), L = dd.opens || (dd.opens = []), last = L[L.length - 1];
  if (last && toMins(t) - toMins(last) < 5 && toMins(t) >= toMins(last)) return;
  L.push(t); save('days/' + TODAY);
}
setTimeout(function tryLog() { if (ready) logOpen(); else setTimeout(tryLog, 2000); }, 3000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(logOpen, 2500); });

let ACT = null;
async function loadActivity() {
  const from = addDays(TODAY, -13);
  const [d, j] = await Promise.all([
    sb.from('docs').select('id,data').eq('col', 'days').gte('id', 'days/' + from).lte('id', 'days/' + TODAY),
    sb.from('docs').select('data').eq('col', 'journal'),
  ]);
  const days = {}; (d.data || []).forEach(r => days[r.id.slice(5)] = r.data || {});
  const jn = {}; (j.data || []).forEach(r => { const x = r.data || {}; if (!x.deleted && !x.auto && x.date) jn[x.date] = (jn[x.date] || 0) + 1; });
  ACT = { days, jn, at: Date.now() };
  if (route && route.v === 'activity') render(true);
}
V.activity = () => {
  if (!ACT || Date.now() - ACT.at > 60000) loadActivity().catch(e => toast('Couldn\'t load activity'));
  const rows = Array.from({ length: 14 }, (_, i) => addDays(TODAY, -i)).map(d => {
    const x = (ACT && ACT.days[d]) || {}, opens = x.opens || [], done = Object.values(x.done || {}).filter(Boolean).length, cis = x.checkins || [], ci = cis[cis.length - 1];
    const bits = [];
    if (x.begun) bits.push('Started the day');
    if (ci) bits.push('Checked in' + (cis.length > 1 ? ' ' + cis.length + ' times' : '') + (ci.q === 'hp' || ci.q === 'lp' ? ' · latest ' + esc(ci.w) : ''));
    if (done) bits.push(done + (done === 1 ? ' task' : ' tasks') + ' done');
    if (x.sleep && x.sleep.bed) bits.push('Sleep logged');
    if (x.mala && (x.mala.done || x.mala.n)) bits.push((x.mala.done ? x.mala.done + (x.mala.done === 1 ? ' mala' : ' malas') : x.mala.n + ' beads'));
    if (ACT && ACT.jn[d]) bits.push(ACT.jn[d] + (ACT.jn[d] === 1 ? ' journal entry' : ' journal entries'));
    if (x.prapti) bits.push('Prapti line');
    const used = opens.length || bits.length;
    return '<div class="setrow" style="align-items:flex-start;cursor:default"><span class="col" style="gap:4px;flex:1"><span style="font-size:16px;font-weight:600">' + (d === TODAY ? 'Today' : d === addDays(TODAY, -1) ? 'Yesterday' : shortDate(d)) + '</span>'
      + '<span class="small">' + (opens.length ? 'Opened ' + opens.map(t => mins(toMins(t))).join(', ') : used ? 'Opened (time not recorded)' : 'Not opened') + '</span>'
      + (bits.length ? '<span class="small" style="color:var(--ink2)">' + bits.join(' · ') + '</span>' : '') + '</span>'
      + '<span style="width:10px;height:10px;border-radius:5px;margin-top:6px;flex-shrink:0;background:' + (used ? 'var(--sa)' : 'var(--rule)') + '"></span></div>';
  }).join('');
  return '<main class="wrap nonav"><div class="between"><span class="pill">Activity</span>' + closeBtn() + '</div><div class="col" style="gap:6px"><h1 class="h1">Chhaya\'s activity</h1><p class="sub">The last 14 days. Opening times are recorded from today onwards.</p></div>'
    + (ACT ? '<section class="card" style="padding:4px 18px">' + rows + '</section>' : '<p class="sub">Loading…</p>') + '</main>';
};
