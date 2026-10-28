/* ===== Sign in ===== */
V.login = () => '<main class="wrap nonav" style="justify-content:center;gap:22px;min-height:100vh">'
  + '<div class="col" style="align-items:center;gap:14px;text-align:center"><span style="width:84px;height:84px;border-radius:28px;background:var(--sa);color:#fff;display:flex;align-items:center;justify-content:center">' + I.lotus.replace('width="28" height="28"', 'width="46" height="46"') + '</span>'
  + '<h1 class="h1">Prapti</h1><p class="sub">Jay Swaminarayan. Sign in once and you\'ll stay signed in.</p></div>'
  + '<form class="card col" style="gap:12px" id="loginForm" onsubmit="return false"><label class="small" for="lgEmail">Email</label><input id="lgEmail" class="inp" type="email" autocomplete="username" inputmode="email" value="' + esc(localStorage.getItem('prapti-last-email') || '') + '">'
  + '<label class="small" for="lgPw">Password</label><input id="lgPw" class="inp" type="password" autocomplete="current-password" data-enter="login">'
  + '<p id="lgErr" class="small" style="color:#B8400E;min-height:18px"></p><button class="btn" data-a="login">Sign in</button></form>'
  + '</main>';
A.login = async el => {
  const email = $('#lgEmail').value.trim(), pw = $('#lgPw').value, errEl = $('#lgErr');
  if (!email || !pw) { errEl.textContent = 'Enter your email and password.'; return; }
  el.disabled = true; el.textContent = 'Signing in…';
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
  if (error) { el.disabled = false; el.textContent = 'Sign in'; errEl.textContent = /invalid/i.test(error.message) ? 'That email or password isn\'t right.' : (navigator.onLine ? error.message : 'You\'re offline. Connect to sign in the first time.'); return; }
  try { localStorage.setItem('prapti-last-email', email); } catch (e) {}
  signedIn(data.user);
};

/* ===== Theme ===== */
function applyTheme() { let lp = null; try { lp = localStorage.getItem('prapti-theme'); } catch (e) {} const t = (USER ? (S.settings && S.settings.theme) : lp) || lp || 'auto', r = document.documentElement; if (t === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', t); const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#17100C' : '#F7F1E8'; }
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch (e) {}
A.themePick = () => sheet('<div class="between"><span class="h2">Appearance</span>' + closeBtn('closeSheet') + '</div><div class="col" style="gap:10px">' + [['auto', 'Automatic', 'Follows your iPhone'], ['light', 'Light', 'Warm cream'], ['dark', 'Dark', 'Easier at night']].map(x => '<button class="opt' + ((S.settings.theme || 'auto') === x[0] ? ' on' : '') + '" data-a="themeSet" data-t="' + x[0] + '"><b>' + x[1] + '</b> <span style="opacity:.7">· ' + x[2] + '</span></button>').join('') + '</div>');
A.themeSet = el => { S.settings.theme = el.dataset.t; try { localStorage.setItem('prapti-theme', el.dataset.t); } catch (e) {} save('settings'); applyTheme(); closeSheet(); render(true); };

/* ===== Sabha time ===== */
A.sabhaPick = () => sheet('<div class="between"><span class="h2">Saturday sabha</span>' + closeBtn('closeSheet') + '</div><p class="sub">What time does sabha start? Your reminder comes 2 hours before.</p><input id="sabhaT" class="inp" type="time" value="' + esc(S.settings.sabhaTime || '17:00') + '"><div class="row"><button class="btn" data-a="sabhaSave">Save</button>' + (S.settings.sabhaTime ? '<button class="btn soft" data-a="sabhaClear">No reminder</button>' : '') + '</div>');
A.sabhaSave = () => { S.settings.sabhaTime = $('#sabhaT').value || '17:00'; save('settings'); closeSheet(); render(true); toast('Saved'); };
A.sabhaClear = () => { S.settings.sabhaTime = ''; save('settings'); closeSheet(); render(true); };

/* ===== Surprise notes ===== */
function notesList() { return Object.values(S.notes || {}).filter(n => n && !n.deleted).sort((a, b) => (b.at || '') < (a.at || '') ? -1 : 1); }
function noteCard() {
  if (OWNER) return '';
  const n = notesList().find(x => !x.seen); if (!n) return '';
  return '<div class="card notecard fade"><span class="eyebrow">A note for you</span><p class="serif" style="font-size:22px;line-height:1.35;white-space:pre-wrap">' + esc(n.text) + '</p><button class="heartbtn" data-a="noteSeen" data-id="' + n.id + '" aria-label="Seen, with love">' + I.heart(true) + '</button></div>';
}
A.noteSeen = el => { const n = S.notes[el.dataset.id]; if (!n) return; n.seen = true; n.seenAt = new Date().toISOString(); save('notes/' + n.id); burstEl(el, 16, ['#C4550F', '#F2B8C6', '#F6B48A']); setTimeout(() => render(true), 500); };
A.noteNew = () => sheet('<div class="between"><span class="h2">A surprise note</span>' + closeBtn('closeSheet') + '</div><p class="sub">It appears at the top of her Today screen next time she opens Prapti.</p><textarea id="noteT" class="ruled" style="height:150px;font-style:normal" placeholder="Write something kind…"></textarea><button class="btn" data-a="noteSend">Leave the note</button>'
  + (notesList().length ? '<div class="col" style="gap:6px;margin-top:6px"><span class="eyebrow">Sent</span>' + notesList().slice(0, 8).map(n => '<div class="between divrow" style="padding:8px 0;gap:10px"><span class="clamp3" style="font-size:14px">' + esc(n.text) + '</span><span class="small" style="flex-shrink:0">' + (n.seen ? 'Seen ♥' : 'Not yet') + '</span></div>').join('') + '</div>' : ''));
A.noteSend = () => { const v = ($('#noteT').value || '').trim(); if (!v) return toast('Write something first'); const id = 'n' + Date.now().toString(36) + uid(); S.notes[id] = { id, from: 'Tilak', to: 'Chhaya', text: v, at: new Date().toISOString(), seen: false }; save('notes/' + id); closeSheet(); toast('Note left for her'); };
V.notes = () => '<main class="wrap nonav"><div class="between"><span class="pill">Notes</span>' + closeBtn() + '</div><h1 class="h1">Notes</h1>' + notesList().map(n => '<div class="card col" style="gap:8px"><span class="eyebrow">' + shortDate((n.at || '').slice(0, 10) || TODAY) + '</span><p class="serif" style="font-size:20px;line-height:1.35;white-space:pre-wrap">' + esc(n.text) + '</p></div>').join('') + '</main>';

/* ===== First thing tomorrow ===== */
function firstTomorrowCard() {
  if (now().getHours() < 18) return '';
  const tm = addDays(TODAY, 1), cur = (S.days[tm] || {}).first || '';
  return '<section class="card col" style="gap:10px;background:var(--tint)"><span class="eyebrow">Before bed</span><label for="firstT" class="serif" style="font-size:22px;line-height:1.2">What\'s the first small thing tomorrow?</label>'
    + '<div class="addrow" style="border-style:solid;border-color:transparent;background:var(--card)"><input id="firstT" placeholder="e.g. Open the curtains and do mala" value="' + esc(cur) + '" data-enter="firstSave"><button class="iconbtn" style="background:var(--sa);color:#fff" data-a="firstSave" aria-label="Save">' + I.tick + '</button></div>'
    + (cur ? '<span class="small">It\'ll be waiting at the top of Today in the morning.</span>' : '') + '</section>';
}
A.firstSave = el => { const v = ($('#firstT').value || '').trim(); const d = day(addDays(TODAY, 1)); d.first = v; save('days/' + d.date); burstEl(el, 10); toast(v ? 'Waiting for you tomorrow' : 'Cleared'); render(true); };

/* ===== On this day (smruti) ===== */
function onThisDay() {
  const md = TODAY.slice(5), dd = TODAY.slice(8), yearAgo = addDays(TODAY, -370);
  const hits = Object.values(S.smruti || {}).filter(x => x && !x.deleted && x.date && x.date < TODAY && (x.date.slice(5) === md || (x.date.slice(8) === dd && x.date >= yearAgo)));
  if (!hits.length) return '';
  const x = hits.sort((a, b) => a.date < b.date ? 1 : -1)[0];
  return '<button class="card row fade" style="border:none;text-align:left;gap:12px;padding:12px 14px;background:var(--tint)" data-a="smOpen" data-id="' + x.id + '"><span style="color:var(--saT)">' + I.lotus + '</span><span class="col" style="gap:2px;min-width:0"><span class="eyebrow">On this day · ' + shortDate(x.date).replace(/^\w+ /, '') + (x.date.slice(0, 4) !== TODAY.slice(0, 4) ? ' ' + x.date.slice(0, 4) : '') + '</span><span style="font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(x.title || (x.text || '').slice(0, 60) || 'Your smruti') + '</span></span></button>';
}

/* ===== Sleep ===== */
const WOKE_BY = ['Anxious thoughts', 'Heart racing', 'A dream', 'Toilet', 'Noise', 'Too hot or cold', 'Don\'t know'];
const RESTED = ['Exhausted', 'Tired', 'Okay', 'Rested', 'Great'];
function sleepHours(s) { if (!s || !s.bed || !s.wake) return null; let a = toMins(s.bed), b = toMins(s.wake); if (b <= a) b += 1440; return (b - a) / 60; }
function bedHours(s) { if (!s || !s.bed || !(s.up || s.wake)) return null; let a = toMins(s.bed), b = toMins(s.up || s.wake); if (b <= a) b += 1440; return (b - a) / 60; }
function lastSleep() { const ks = Object.keys(S.days).sort().reverse(); for (const k of ks) { const s = S.days[k].sleep; if (s && s.bed) return s; } return null; }
function n1(x) { return String(+x.toFixed(1)); }
function fmtH(h) { if (h == null) return '–'; const hh = Math.floor(h), mm = Math.round((h - hh) * 60); return hh + 'h' + (mm ? ' ' + mm + 'm' : ''); }
function sleepSummary() { const ks = Object.keys(S.days).sort().reverse().slice(0, 7).map(k => sleepHours(S.days[k].sleep)).filter(x => x != null); return ks.length ? 'Last 7 nights: ' + fmtH(ks.reduce((a, b) => a + b, 0) / ks.length) + ' average' : 'Log how you slept each morning'; }
function sleepPrompt() { if (OWNER && !viewOnly()) return ''; const dd = day(); if (dd.sleep && dd.sleep.bed) return ''; if (now().getHours() >= 15) return ''; return '<button class="card between fade" style="border:none;text-align:left;background:#2F4468;color:#EEF1F8" data-a="go" data-v="sleeplog"><span class="col" style="gap:4px"><span class="eyebrow" style="color:#C9D4EA">Morning</span><span class="serif" style="font-size:22px">How did you sleep?</span></span>' + I.right.replace('#B3A393', '#C9D4EA') + '</button>'; }
let SL = null;
V.sleeplog = p => {
  const dd = day(), prev = lastSleep() || {}, target = S.settings.sleep || {};
  if (!SL) SL = Object.assign({ bed: prev.bed || '23:00', wake: prev.wake || (target.wake ? pad(Math.floor(target.wake / 60)) + ':' + pad(target.wake % 60) : '07:30'), up: '', wakes: 0, why: [], rested: 0, screen: false, caffeine: false, note: '' }, dd.sleep || {});
  if (!SL.up) SL.up = SL.wake;
  const nightN = (dd.sleep && dd.sleep.night || []).length;
  if (nightN && !SL.wakes) SL.wakes = Math.min(3, nightN);
  const tr = (id, label, v) => '<div class="between sleeprow"><label for="' + id + '" style="font-size:16px;font-weight:600">' + label + '</label><input id="' + id + '" class="timein" type="time" value="' + esc(v) + '" data-in="slT" data-k="' + id + '"></div>';
  return '<main class="wrap nonav sleepwrap" style="gap:18px"><div class="between"><span class="pill">Sleep</span><span class="row" style="gap:14px">' + (dd.sleep && dd.sleep.bed ? '' : '<button class="link" data-a="sleepSkip">Skip for today</button>') + (stack.length ? closeBtn('slClose') : '') + '</span></div>'
    + '<div class="col" style="gap:6px"><h1 class="h1" style="font-size:clamp(32px,9vw,40px)">How did you sleep?</h1><p class="sub">Roughly is fine. It takes 20 seconds.</p></div>'
    + '<section class="card col" style="gap:4px;padding:6px 18px">' + tr('bed', 'Fell asleep', SL.bed) + tr('wake', 'Woke up', SL.wake) + tr('up', 'Got out of bed', SL.up) + '</section>'
    + '<div class="small" id="slSum" style="margin-top:-8px;padding-left:4px">' + (sleepHours(SL) != null ? 'About ' + fmtH(sleepHours(SL)) + ' asleep · ' + fmtH(bedHours(SL)) + ' in bed' : '') + '</div>'
    + '<section class="col" style="gap:10px"><span class="h2">Woke in the night</span><div class="seg" style="grid-template-columns:repeat(4,minmax(0,1fr))">' + [0, 1, 2, 3].map(n => '<button class="' + (SL.wakes === n ? 'on' : '') + '" data-a="slWakes" data-n="' + n + '">' + (n === 3 ? '3+' : n) + '</button>').join('') + '</div>'
    + (nightN ? '<span class="small">You logged ' + nightN + ' wake-up' + (nightN > 1 ? 's' : '') + ' in the night.</span>' : '')
    + (SL.wakes ? '<span class="small" style="margin-top:4px">What woke you?</span><div class="chips">' + WOKE_BY.map(w => '<button class="chip' + (SL.why.includes(w) ? ' on' : '') + '" data-a="slWhy" data-w="' + esc(w) + '">' + esc(w) + '</button>').join('') + '</div>' : '') + '</section>'
    + '<section class="col" style="gap:10px"><span class="h2">How rested do you feel?</span><div class="rested">' + RESTED.map((r, i) => '<button class="' + (SL.rested === i + 1 ? 'on' : '') + '" data-a="slRested" data-n="' + (i + 1) + '"><span class="face">' + face(i) + '</span><span>' + r + '</span></button>').join('') + '</div></section>'
    + '<details class="card" style="padding:12px 16px"><summary style="font-weight:600;font-size:15px">A little more (optional)</summary><div class="col" style="gap:10px;margin-top:10px">'
    + '<button class="checkrow" data-a="slFlag" data-k="screen"><span class="box' + (SL.screen ? ' on' : '') + '">' + (SL.screen ? I.tick : '') + '</span>Phone or screen in bed</button>'
    + '<button class="checkrow" data-a="slFlag" data-k="caffeine"><span class="box' + (SL.caffeine ? ' on' : '') + '">' + (SL.caffeine ? I.tick : '') + '</span>Tea or coffee after 2pm</button>'
    + '<textarea class="ruled" style="height:68px;font-style:normal" placeholder="Anything else? (a dream, a worry…)" data-in="slNote">' + esc(SL.note) + '</textarea></div></details>'
    + '<div style="flex:1"></div><div class="cta"><button class="btn" data-a="sleepSave">Save</button></div></main>';
};
function face(i) { const m = ['M8 16c1.5-1.5 6.5-1.5 8 0', 'M8 16c2-1 6-1 8 0', 'M8 15.5h8', 'M8 14.5c2 1.5 6 1.5 8 0', 'M7.5 14c2 3 7 3 9 0'][i]; return '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r=".9" fill="currentColor"/><path d="' + m + '"/></svg>'; }
INP.slT = el => { SL[el.dataset.k] = el.value; const h = $('#slSum'); if (h) h.textContent = sleepHours(SL) != null ? 'About ' + fmtH(sleepHours(SL)) + ' asleep · ' + fmtH(bedHours(SL)) + ' in bed' : ''; };
INP.slNote = el => { SL.note = el.value; };
A.slWakes = el => { SL.wakes = +el.dataset.n; if (!SL.wakes) SL.why = []; render(true); };
A.slWhy = el => { const w = el.dataset.w, i = SL.why.indexOf(w); if (i > -1) SL.why.splice(i, 1); else SL.why.push(w); render(true); };
A.slRested = el => { SL.rested = +el.dataset.n; render(true); };
A.slFlag = el => { SL[el.dataset.k] = !SL[el.dataset.k]; render(true); };
function sleepNext() { const p = route.p || {}; SL = null; if (p.after === 'setup' || !S.settings.setupDone) go('setup', { first: true }, { replace: true }); else { stack = []; go('today', null, { replace: true }); } }
A.sleepSave = el => { const h = sleepHours(SL); if (h != null && h > 18) return toast('That\'s over 18 hours. Check the times.'); const dd = day(); dd.sleep = Object.assign({}, dd.sleep || {}, SL, { logged: new Date().toISOString() }); save('days/' + TODAY); burstEl(el, 14, ['#6F86B8', '#C9D4EA', '#F6B48A']); setTimeout(sleepNext, 300); };
A.slClose = () => { SL = null; back('today'); };
A.sleepSkip = () => { const dd = day(); dd.sleep = Object.assign({}, dd.sleep || {}, { skipped: true }); save('days/' + TODAY); sleepNext(); };
V.sleep = () => {
  const ks = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6));
  const rows = ks.map(k => ({ k, s: (S.days[k] || {}).sleep }));
  // Timeline runs from noon to noon (so late nights and lie-ins past midday both fit), trimmed to the nights shown.
  const W = 320, L = 44, noonM = m => (m - 720 + 1440) % 1440;
  const spans = rows.filter(r => r.s && r.s.bed && r.s.wake).map(r => { const a = noonM(toMins(r.s.bed)); return { r, a, b: a + sleepHours(r.s) * 60, c: a + (bedHours(r.s) || sleepHours(r.s)) * 60 }; });
  let lo = 8 * 60, hi = 24 * 60; spans.forEach(p => { lo = Math.min(lo, p.a); hi = Math.max(hi, p.c); });
  lo = Math.max(0, Math.floor(lo / 120) * 120); hi = Math.min(1800, Math.ceil(hi / 120) * 120);
  const x = v => L + (v - lo) / (hi - lo) * (W - L - 16), step = (hi - lo) > 16 * 60 ? 360 : 240;
  const lab = v => { const m = (v + 720) % 1440; return m === 0 ? 'Midnight' : m === 720 ? 'Noon' : (m / 60 % 12 || 12) + (m < 720 ? 'am' : 'pm'); };
  let svg = '<svg width="100%" viewBox="0 0 ' + W + ' ' + (rows.length * 30 + 26) + '" role="img" aria-label="Sleep over the last 7 nights">';
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) { const xx = x(v); svg += '<line x1="' + xx + '" x2="' + xx + '" y1="4" y2="' + (rows.length * 30 + 4) + '" stroke="var(--line)"/><text x="' + xx + '" y="' + (rows.length * 30 + 20) + '" font-size="10" fill="var(--faint)" text-anchor="' + (xx > W - 30 ? 'end' : 'middle') + '">' + lab(v) + '</text>'; }
  rows.forEach((r, i) => {
    const y = 8 + i * 30; svg += '<text x="0" y="' + (y + 11) + '" font-size="11" fill="var(--faint)">' + parse(r.k).toLocaleDateString('en-GB', { weekday: 'short' }) + '</text>';
    const p = spans.find(q => q.r === r); if (!p) return;
    const a = x(p.a), b = x(p.b), c = x(p.c);
    if (c > b + 1) svg += '<rect x="' + (b - 7) + '" y="' + y + '" width="' + (c - b + 7) + '" height="14" rx="7" fill="#C9D4EA"/>';
    svg += '<rect x="' + a + '" y="' + y + '" width="' + Math.max(14, b - a) + '" height="14" rx="7" fill="#5B72A6"/>';
    const night = (r.s.night || []).map(t => { let v = noonM(toMins(t)); if (v < p.a) v += 1440; return v; }).filter(v => v > p.a && v < p.b);
    const dots = night.length ? night.map(v => x(v)) : Array.from({ length: Math.min(r.s.wakes || 0, 3) }, (_, j) => a + (b - a) * (j + 1) / (Math.min(r.s.wakes || 0, 3) + 1));
    dots.forEach(cx => { svg += '<circle cx="' + cx + '" cy="' + (y + 7) + '" r="3.4" fill="#F6B48A" stroke="#5B72A6" stroke-width="1"/>'; });
  });
  svg += '</svg>';
  const logged = rows.filter(r => r.s && r.s.bed);
  const avg = f => { const v = logged.map(r => f(r.s)).filter(v => v != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  const tgt = S.settings.sleep;
  return '<main class="wrap nonav"><div class="between"><span class="pill">Sleep</span>' + closeBtn() + '</div><h1 class="h1">Sleep</h1>'
    + '<section class="card col" style="gap:12px"><div class="between"><span class="serif" style="font-size:22px">Last 7 nights</span><button class="link" data-a="go" data-v="sleeplog">Log today</button></div>' + svg
    + '<div class="chips" style="gap:12px"><span class="small row" style="gap:6px"><i class="lg" style="background:#5B72A6"></i>Asleep</span><span class="small row" style="gap:6px"><i class="lg" style="background:#C9D4EA"></i>Awake in bed</span><span class="small row" style="gap:6px"><i class="lg" style="background:#F6B48A;border-radius:50%"></i>Woke in the night</span></div></section>'
    + '<section class="tiles"><div class="card col" style="gap:2px"><span class="small">Average asleep</span><span class="serif" style="font-size:30px">' + fmtH(avg(sleepHours)) + '</span></div><div class="card col" style="gap:2px"><span class="small">Average in bed</span><span class="serif" style="font-size:30px">' + fmtH(avg(bedHours)) + '</span></div>'
    + '<div class="card col" style="gap:2px"><span class="small">Night wake-ups</span><span class="serif" style="font-size:30px">' + (avg(s => s.wakes || 0) != null ? n1(avg(s => s.wakes || 0)) : '–') + '</span></div><div class="card col" style="gap:2px"><span class="small">Wake time goal</span><span class="serif" style="font-size:30px">' + (tgt ? mins(tgt.wake) : '–') + '</span>' + (tgt ? '' : '<button class="link" style="font-size:13px;align-self:flex-start" data-a="guide" data-k="sleep">Set it</button>') + '</div></section>'
    + patternsCard(true)
    + '<p class="small">Sleep is also included in your rTMS clinic report.</p></main>';
};

/* ===== Awake in the night ===== */
V.night = () => '<main class="wrap nonav nightwrap" style="justify-content:center;text-align:center;gap:22px;min-height:100vh">'
  + '<span class="serif it" style="font-size:20px;opacity:.7">' + new Date().toTimeString().slice(0, 5) + '</span><h1 class="h1" style="font-size:clamp(32px,9vw,40px)">Awake? Let\'s log it and settle.</h1>'
  + '<button class="btn" style="background:#2F4468" data-a="nightLog">' + (nightLogged === TODAY ? 'Logged ✓' : 'Log that I woke up') + '</button>'
  + '<div class="row" style="gap:10px"><button class="btn soft" style="background:#2A211C;color:#E9DCCB" data-a="nightBreathe">Breathe</button><button class="btn soft" style="background:#2A211C;color:#E9DCCB" data-a="nightMantra">Mantra</button></div>'
  + '<button class="link" style="color:#8E7F72" data-a="nightClose">Open the app instead</button></main>';
let nightLogged = '';
A.nightLog = () => { if (nightLogged === TODAY) return; const tgt = now().getHours() < 4 ? addDays(TODAY, 1) : TODAY, dd = day(tgt); dd.sleep = Object.assign({}, dd.sleep || {}); dd.sleep.night = (dd.sleep.night || []).concat([new Date().toTimeString().slice(0, 5)]); save('days/' + tgt); nightLogged = TODAY; render(true); };
A.nightBreathe = () => { document.documentElement.setAttribute('data-theme', 'dark'); go('calm', { night: true }); };
A.nightMantra = () => { document.documentElement.setAttribute('data-theme', 'dark'); go('calm', { night: true }); setTimeout(() => A.play(), 300); };
A.nightClose = () => { nightDismissed = TODAY; applyTheme(); boot(); };

/* ===== Patterns ===== */
function patternsCard(inSleep) {
  const days = Object.values(S.days).filter(d => d && d.date <= TODAY);
  const withData = days.filter(d => (d.sleep && d.sleep.bed) || (d.checkins || []).length);
  if (withData.length < 14) return '<section class="card col" style="gap:6px"><span class="serif" style="font-size:22px">Patterns</span><p class="sub">Patterns appear after two weeks of logging sleep and check-ins. ' + withData.length + ' of 14 days so far.</p></section>';
  const pleasant = d => { const c = (d.checkins || []); if (!c.length) return null; const p = c.filter(x => x.q === 'hp' || x.q === 'lp').length; return p / c.length; };
  const lines = [];
  const good = days.filter(d => sleepHours(d.sleep) >= 7 && pleasant(d) != null), short = days.filter(d => sleepHours(d.sleep) != null && sleepHours(d.sleep) < 7 && pleasant(d) != null);
  if (good.length >= 3 && short.length >= 3) { const a = Math.round(100 * good.reduce((s, d) => s + pleasant(d), 0) / good.length), b = Math.round(100 * short.reduce((s, d) => s + pleasant(d), 0) / short.length); lines.push('On days after 7h+ sleep, you felt pleasant ' + a + '% of the time, compared with ' + b + '% after shorter nights.'); }
  const anxDays = new Set(days.filter(d => (d.checkins || []).some(c => c.q === 'hu')).map(d => d.date));
  const after = days.filter(d => d.sleep && d.sleep.bed && anxDays.has(addDays(d.date, -1))), other = days.filter(d => d.sleep && d.sleep.bed && !anxDays.has(addDays(d.date, -1)));
  if (after.length >= 3 && other.length >= 3) { const a = after.reduce((s, d) => s + (d.sleep.wakes || 0), 0) / after.length, b = other.reduce((s, d) => s + (d.sleep.wakes || 0), 0) / other.length; if (a > b + 0.3) lines.push('After an anxious day, you woke about ' + n1(a) + ' times in the night, compared with ' + n1(b) + ' on other nights.'); else lines.push('Anxious days don\'t seem to be disturbing your nights much. That\'s good to see.'); }
  const done = d => { const it = todayItems(d.date); return it.length ? it.filter(i => (d.done || {})[i.id]).length / it.length : null; };
  const dm = days.filter(d => done(d) != null && pleasant(d) != null);
  if (dm.length >= 6) { const hi = dm.filter(d => done(d) >= 0.5), lo = dm.filter(d => done(d) < 0.5); if (hi.length >= 3 && lo.length >= 3) { const a = Math.round(100 * hi.reduce((s, d) => s + pleasant(d), 0) / hi.length), b = Math.round(100 * lo.reduce((s, d) => s + pleasant(d), 0) / lo.length); lines.push('On days you ticked off half your list or more, you felt pleasant ' + a + '% of the time (' + b + '% on other days).'); } }
  if (!lines.length) lines.push('Nothing stands out yet. Keep logging and patterns will show here.');
  return '<section class="card col" style="gap:10px"><span class="serif" style="font-size:22px">Patterns</span>' + lines.map(l => '<p style="font-size:15px;line-height:1.5">' + l + '</p>').join('') + '<span class="small">Based on your own logs. Share them with your GP or rTMS team if helpful.</span></section>';
}

/* ===== Mala counter ===== */
let malaMantra = false;
function malaData() { const dd = day(); if (!dd.mala) dd.mala = { n: 0, done: 0 }; return dd.mala; }
function malaSVG(n, complete) {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  const R = 138, C = 155, gap = 0.11, off = dark ? 'rgba(247,241,232,.16)' : '#E3D6C6', on = '#C4550F';
  let svg = '<svg width="310" height="310" viewBox="0 0 310 310" style="position:absolute;inset:0;overflow:visible" aria-hidden="true">';
  for (let k = 0; k < 108; k++) { const a = -Math.PI / 2 + gap / 2 + k * (2 * Math.PI - gap) / 107, x = (C + R * Math.cos(a)).toFixed(2), y = (C + R * Math.sin(a)).toFixed(2), cur = !complete && k === n - 1; if (cur) svg += '<circle cx="' + x + '" cy="' + y + '" r="7.5" fill="rgba(246,180,138,.28)"/>'; svg += '<circle cx="' + x + '" cy="' + y + '" r="3.3" fill="' + (k < n || complete ? (cur ? '#F6B48A' : on) : off) + '"/>'; }
  const sx = C, sy = C - R, col = complete ? '#F6B48A' : '#C4550F';
  svg += '<circle cx="' + sx + '" cy="' + sy + '" r="5.5" fill="' + col + '"/><rect x="' + (sx - 4) + '" y="' + (sy - 15) + '" width="8" height="8" rx="3" fill="' + col + '"/>';
  for (let i = -7; i <= 7; i++) { const x0 = sx + i * 0.55, x1 = sx + i * 1.55, len = 34 - Math.abs(i) * 0.9; svg += '<path d="M' + x0 + ' ' + (sy - 14) + ' C ' + x0 + ' ' + (sy - 22) + ', ' + x1 + ' ' + (sy - 26) + ', ' + x1 + ' ' + (sy - 14 - len) + '" stroke="' + col + '" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="' + (0.75 + (7 - Math.abs(i)) * 0.035) + '"/>'; }
  svg += '<rect x="' + (sx - 6) + '" y="' + (sy - 21) + '" width="12" height="3.5" rx="1.5" fill="' + col + '"/></svg>';
  return svg;
}
V.mala = () => {
  const m = malaData(), complete = m.n >= 108;
  return '<main class="wrap nonav malawrap" style="align-items:center;text-align:center;gap:0">'
    + '<div class="between" style="width:100%"><span class="pill">Mala · Calm space</span>' + closeBtn('malaClose') + '</div>'
    + '<h1 class="serif" style="font-size:30px;margin-top:22px">' + (complete ? 'Mala complete' : 'Tap anywhere to count') + '</h1><p class="sub" style="font-size:14px">' + (complete ? '108 names. Jay Swaminarayan.' : 'Swaminarayan · one tap for each bead') + '</p>'
    + '<div class="malaring" id="malaRing">' + malaSVG(m.n, complete) + '<div class="malac">' + (complete ? '<span style="color:#F6B48A">' + I.lotus.replace('width="28" height="28"', 'width="110" height="110"').replace('stroke-width="1.7"', 'stroke-width="1.1"') + '</span><span class="serif it" style="font-size:22px;margin-top:8px">Another mala?</span>' : '<span class="serif malan" id="malaN">' + m.n + '</span><span style="font-size:14px;opacity:.65;margin-top:4px">of 108</span><span class="serif it" style="font-size:22px;margin-top:10px">Swaminarayan</span>') + '</div></div>'
    + '<div class="col" style="gap:12px;align-items:center;margin-top:auto;padding-top:20px"><div class="row" style="gap:8px;font-size:14px;opacity:.85">' + (m.done ? Array.from({ length: Math.min(m.done, 9) }, () => '<i class="lg" style="background:var(--sa);border-radius:50%"></i>').join('') + ' ' + m.done + (m.done === 1 ? ' mala' : ' malas') + ' today' : 'No malas yet today') + '</div>'
    + '<div class="row" style="gap:10px"><button class="chip" data-a="malaUndo">Undo</button><button class="chip" data-a="malaReset">Reset</button><button class="chip' + (malaMantra ? ' on' : '') + '" data-a="malaMantra">Mantra ' + (malaMantra ? 'on' : 'off') + '</button></div></div></main>';
};
V.mala_after = () => { const w = $('.malawrap'); if (!w) return; w.addEventListener('pointerdown', e => { if (e.target.closest('button,a')) return; e.preventDefault(); malaTap(); }); };
function malaTap() {
  const m = malaData();
  if (m.n >= 108) { m.n = 0; save('days/' + TODAY); render(true); return; }
  m.n++; try { navigator.vibrate && navigator.vibrate(m.n % 27 === 0 ? 40 : 10); } catch (e) {}
  if (m.n >= 108) { m.done = (m.done || 0) + 1; save('days/' + TODAY); render(true); petalRain(24); return; }
  save('days/' + TODAY);
  const ring = $('#malaRing'); if (ring) { ring.querySelector('svg').outerHTML = malaSVG(m.n, false); const n = $('#malaN'); if (n) n.textContent = m.n; }
}
A.malaUndo = () => { const m = malaData(); if (m.n > 0 && m.n < 108) { m.n--; save('days/' + TODAY); render(true); } };
A.malaReset = () => { const m = malaData(); m.n = 0; save('days/' + TODAY); render(true); };
A.malaMantra = () => { malaMantra = !malaMantra; const a = audio(); if (malaMantra) { try { localStorage.setItem('chhaya-track', '0'); } catch (e) {} if (a.getAttribute('src') !== TRACKS[0].src) a.setAttribute('src', TRACKS[0].src); a.volume = 0.5; a.play().catch(() => {}); } else a.pause(); render(true); };
A.malaClose = () => { if (malaMantra) { audio().pause(); malaMantra = false; } back('calm'); };

/* ===== rTMS schedule + clinic report ===== */
const DAYNAMES = [['mon', 'Mon'], ['tue', 'Tue'], ['wed', 'Wed'], ['thu', 'Thu'], ['fri', 'Fri'], ['sat', 'Sat'], ['sun', 'Sun']];
function rtmsScheduleHTML() {
  const sch = S.rtms.schedule || {};
  return '<section class="col" style="gap:12px"><h2 class="h2">My session days</h2><p class="small" style="margin-top:-6px">Tap the days you go and set the time. Change it whenever the clinic does.</p>'
    + '<div class="card" style="padding:4px 16px">' + DAYNAMES.map(([k, l]) => '<div class="between divrow" style="min-height:54px"><button class="chip' + (sch[k] ? ' on' : '') + '" style="min-width:64px" data-a="rtDay" data-k="' + k + '">' + l + '</button>' + (sch[k] ? '<input class="timein" type="time" value="' + esc(sch[k]) + '" data-in="rtTime" data-k="' + k + '" aria-label="' + l + ' session time">' : '<span class="small">No session</span>') + '</div>').join('') + '</div>'
    + '<div class="between card" style="padding:12px 16px"><label for="rtStart" style="font-weight:600">First session</label><input id="rtStart" class="timein" type="date" value="' + esc(S.rtms.start || RTMS_START) + '" data-in="rtStart"></div></section>';
}
A.rtDay = el => { const k = el.dataset.k, sch = S.rtms.schedule || (S.rtms.schedule = {}); if (sch[k]) delete sch[k]; else sch[k] = '10:00'; save('rtms'); render(true); };
INP.rtTime = el => { S.rtms.schedule[el.dataset.k] = el.value || '10:00'; save('rtms'); };
INP.rtStart = el => { S.rtms.start = el.value || RTMS_START; save('rtms'); };
V.report = () => {
  const R = S.rtms, wk = Object.keys(S.weekly).sort(), sl = Object.values(S.days).filter(d => d.sleep && d.sleep.bed).sort((a, b) => a.date < b.date ? -1 : 1).slice(-28);
  const avgSleep = sl.length ? sl.reduce((a, d) => a + (sleepHours(d.sleep) || 0), 0) / sl.length : null;
  return '<main class="wrap nonav report"><div class="between noprint"><span class="pill">Clinic report</span>' + closeBtn() + '</div>'
    + '<h1 class="h1" style="font-size:36px">rTMS report</h1><p class="sub">Chhaya · prepared ' + shortDate(TODAY) + '</p>'
    + '<section class="card col" style="gap:8px"><span class="eyebrow">Sessions</span><p style="font-size:16px">' + R.sessions.length + (R.total ? ' of ' + R.total : '') + ' sessions attended' + (R.sessions.length ? ', ' + shortDate(R.sessions[0]) + ' to ' + shortDate(R.sessions[R.sessions.length - 1]) : '') + '.</p>'
    + (R.notes.length ? '<table class="rt"><tr><th>Date</th><th>How it went</th></tr>' + R.notes.map(n => '<tr><td>' + shortDate(n.date) + '</td><td>' + esc(n.how || '') + '</td></tr>').join('') + '</table>' : '') + '</section>'
    + '<section class="card col" style="gap:8px"><span class="eyebrow">Weekly check-in (PHQ-9 and GAD-2)</span>' + (wk.length ? trendSVG(false) + '<table class="rt"><tr><th>Week</th><th>PHQ-9 (0–27)</th><th>GAD-2 (0–6)</th></tr>' + wk.map(k => '<tr><td>' + shortDate(k) + '</td><td>' + S.weekly[k].score + '</td><td>' + (S.weekly[k].gad != null ? S.weekly[k].gad : '–') + '</td></tr>').join('') + '</table>' : '<p class="sub">No weekly check-ins yet.</p>') + '</section>'
    + '<section class="card col" style="gap:8px"><span class="eyebrow">Sleep (last 4 weeks)</span>' + (sl.length ? '<p style="font-size:16px">' + sl.length + (sl.length === 1 ? ' night' : ' nights') + ' logged. Average ' + fmtH(avgSleep) + ' asleep, ' + n1(sl.reduce((a, d) => a + (d.sleep.wakes || 0), 0) / sl.length) + ' wake-ups a night.</p>' : '<p class="sub">No sleep logged yet.</p>') + '</section>'
    + '<section class="card col" style="gap:8px"><span class="eyebrow">My questions</span>' + (R.questions.length ? '<ul style="margin:0;padding-left:18px;line-height:1.7">' + R.questions.map(q => '<li>' + esc(q) + '</li>').join('') + '</ul>' : '<p class="sub">None</p>') + '</section>'
    + '<button class="btn noprint" data-a="printReport">Save as PDF or print</button><p class="small noprint">On iPhone: tap the button, then the share icon, then “Save to Files”.</p></main>';
};
A.printReport = () => window.print();

/* ===== Share a darshan ===== */
async function shareDarshan(v) {
  try {
    const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
    g.fillStyle = '#F7F1E8'; g.fillRect(0, 0, W, H);
    const img = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = v.photo ? photoSrc(v.photo) : v.src; });
    const ih = 860, sc = Math.max(W / img.naturalWidth, ih / img.naturalHeight), dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
    g.save(); g.beginPath(); g.rect(0, 0, W, ih); g.clip(); g.drawImage(img, (W - dw) / 2, (ih - dh) * 0.3, dw, dh); g.restore();
    await document.fonts.load('italic 52px "Instrument Serif"');
    g.fillStyle = '#2A1A12'; g.font = 'italic 50px "Instrument Serif", Georgia, serif';
    const words = ('“' + v.t + '”').split(' '), lines = []; let line = '';
    words.forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > W - 150) { lines.push(line); line = w; } else line = t; }); lines.push(line);
    const show = lines.slice(0, 6); if (lines.length > 6) show[5] = show[5].replace(/\s+\S*$/, '…');
    let y = ih + 90; show.forEach(l => { g.fillText(l, 75, y); y += 62; });
    g.fillStyle = '#A8470C'; g.font = '600 30px Figtree, sans-serif'; g.fillText(String(v.by || '').toUpperCase(), 75, Math.min(H - 60, y + 26));
    const blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.9)), file = new File([blob], 'darshan.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'Darshan' });
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'darshan.jpg'; a.click(); }
  } catch (e) { if (e && e.name !== 'AbortError') { toast('Couldn\'t share that one'); logErr('share', e.message || e); } }
}
A.feedShare = () => { const f = FEED[feedIdx()]; if (f) shareDarshan(pairView(f)); };

/* ===== Kirtans inside the app ===== */
function ytId(u) { const m = String(u).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : null; }
A.playVideo = el => { const u = el.dataset.u, id = ytId(u); if (!id) { window.open(u, '_blank', 'noopener'); return; } sheet('<div class="between"><span class="h2">' + esc(el.dataset.t || 'Kirtan') + '</span>' + closeBtn('closeSheet') + '</div><div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '?playsinline=1&rel=0&modestbranding=1" title="' + esc(el.dataset.t || 'Video') + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><a class="link" href="' + esc(u) + '" target="_blank" rel="noopener">Open in YouTube</a>'); };
