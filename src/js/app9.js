/* ===== Prapti v3: Me analytics, day story, insights, weekly round-up, lifts, self-compassion ===== */
const PLEASANT = q => q === 'hp' || q === 'lp';
const dayCheck = d => { const cs = (S.days[d] || {}).checkins || []; return cs[cs.length - 1] || null; };
const wkDays = wk => Array.from({ length: 7 }, (_, i) => addDays(wk, i));
const wdName = d => parse(d).toLocaleDateString('en-GB', { weekday: 'long' });
function itemName(d, id) {
  const dd = S.days[d] || {}, t = (S.settings.tasks || []).find(x => x.id === id); if (t) return t.t;
  if (id.startsWith('min-')) { const m = (S.settings.minimums || []).find(x => 'min-' + slug(x) === id); if (m) return m; }
  const e = (dd.extras || []).find(e => e.id === id); if (e) return e.t;
  if (id === 'first') return dd.first || null; if (id === 'sabha') return 'Sabha'; if (id === 'rtms') return 'rTMS session';
  return null;
}
function doneNames(d) { const dd = S.days[d] || {}; return Object.keys(dd.done || {}).filter(k => dd.done[k]).map(k => itemName(d, k)).filter(Boolean); }
function countUp(el, to, dur) { if (!el) return; if (reduced() || !isFinite(to)) { el.textContent = el.dataset.fmt === 'h' ? fmtH(to) : to; return; } const t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / (dur || 900)), e = 1 - Math.pow(1 - k, 3), v = to * e; el.textContent = el.dataset.fmt === 'h' ? fmtH(v) : Math.round(v); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }

/* ---------- What lifted you today? (evening, one tap) ---------- */
const LIFTS = ['Family', 'Darshan', 'Kirtan or mantra', 'Being outside', 'Rest', 'Talking to someone', 'Seva', 'Something I achieved'];
let LIFT = null;
function liftCard() {
  const dd = day(); if ((OWNER && !viewOnly()) || now().getHours() < 17 || dd.lift || dd.liftSkip) return '';
  if (!LIFT) LIFT = [];
  const opts = [...new Set(doneNames(TODAY).slice(0, 4).concat(LIFTS))];
  return '<section class="card col" style="gap:12px"><div class="between" style="align-items:baseline"><span class="serif" style="font-size:clamp(21px,6vw,24px)">What lifted you today?</span><button class="link" style="font-size:13px;color:var(--faint)" data-a="liftSkip">Skip</button></div>'
    + '<div class="chips">' + opts.map(o => '<button class="chip' + (LIFT.includes(o) ? ' on' : '') + '" data-a="liftTog" data-t="' + esc(o) + '">' + esc(o) + '</button>').join('') + '<button class="chip' + (LIFT.includes('Not much today') ? ' on' : '') + '" data-a="liftTog" data-t="Not much today">Not much today</button></div>'
    + (LIFT.length ? '<button class="btn sm" style="align-self:flex-start" data-a="liftSave">Save</button>' : '') + '</section>';
}
A.liftTog = el => { const t = el.dataset.t; if (t === 'Not much today') LIFT = LIFT.includes(t) ? [] : [t]; else { LIFT = LIFT.filter(x => x !== 'Not much today'); const i = LIFT.indexOf(t); if (i > -1) LIFT.splice(i, 1); else LIFT.push(t); } hap(); render(true); };
A.liftSave = el => { const dd = day(); dd.lift = LIFT.slice(); save('days/' + TODAY); LIFT = null; burstEl(el, 12); toast('Saved. Noticing this is how it grows.'); render(true); };
A.liftSkip = () => { day().liftSkip = true; save('days/' + TODAY); LIFT = null; render(true); };

/* ---------- Insights: what seems to help (positive patterns only) ---------- */
function insights(endDay, span) {
  endDay = endDay || TODAY; span = span || 28;
  const days = Array.from({ length: span }, (_, i) => addDays(endDay, -i)).filter(d => dayCheck(d));
  if (days.length < 10) return { need: 10 - days.length, list: [] };
  const feats = {};
  const add = (key, phrase, d) => { (feats[key] = feats[key] || { phrase, on: new Set() }).on.add(d); };
  days.forEach(d => {
    const dd = S.days[d] || {}, sh = sleepHours(dd.sleep);
    doneNames(d).forEach(n => add('t:' + n.toLowerCase(), 'you did “' + n + '”', d));
    if (sh != null && sh >= 7) add('sleep7', 'you slept 7 hours or more', d);
    if (dd.mala && (dd.mala.done || dd.mala.n >= 27)) add('mala', 'you did a mala', d);
    if ((dd.opens || [])[0] && toMins(dd.opens[0]) < 10 * 60) add('early', 'you opened Prapti before 10am', d);
    if (dd.prapti) add('prapti', 'you wrote a prapti line', d);
  });
  const out = [];
  Object.values(feats).forEach(f => {
    const w = days.filter(d => f.on.has(d)), wo = days.filter(d => !f.on.has(d));
    if (w.length < 3 || wo.length < 3) return;
    const pw = w.filter(d => PLEASANT(dayCheck(d).q)).length, po = wo.filter(d => PLEASANT(dayCheck(d).q)).length;
    const a = pw / w.length, b = po / wo.length;
    if (a >= .5 && a - b >= .3) out.push({ text: 'On days ' + f.phrase + ', you felt Upbeat or Calm ' + pw + ' of ' + w.length + ' times, compared with ' + po + ' of ' + wo.length + ' on other days.', gap: a - b });
  });
  return { need: 0, list: out.sort((x, y) => y.gap - x.gap).slice(0, 2) };
}
function insightsCard() {
  const r = insights();
  return '<section class="card col" style="gap:10px"><div class="row" style="gap:12px"><span class="itile sm" style="background:#2E7556">' + gicon('leaf') + '</span><span class="serif" style="font-size:22px">What seems to help</span></div>'
    + (r.need ? '<p class="sub">After ' + r.need + ' more day' + (r.need === 1 ? '' : 's') + ' of check-ins, Prapti will point out what seems to lift you.</p>'
      : r.list.length ? r.list.map(x => '<p style="font-size:15px;line-height:1.5">' + x.text + '</p>').join('') + '<p class="small">Patterns, not proof. Worth noticing.</p>'
        : '<p class="sub">No clear patterns yet. Keep checking in and they\'ll show.</p>') + '</section>';
}

/* ---------- Me: feelings calendar, tap a day for its full story ---------- */
function feelingsSection() {
  const start = addDays(weekStart(TODAY), -21), days = Array.from({ length: 28 }, (_, i) => addDays(start, i));
  const inRange = days.filter(d => d <= TODAY), cs = inRange.map(dayCheck).filter(Boolean);
  const mix = {}; cs.forEach(c => mix[c.q] = (mix[c.q] || 0) + 1);
  const words = {}; cs.forEach(c => words[c.w] = (words[c.w] || 0) + 1); const top = Object.keys(words).sort((a, b) => words[b] - words[a]).slice(0, 3);
  const cell = d => { const c = dayCheck(d), fut = d > TODAY, isT = d === TODAY, had = S.days[d] && (S.days[d].begun || (S.days[d].opens || []).length);
    return '<button class="fcell' + (isT ? ' today' : '') + '" ' + (fut ? 'disabled' : 'data-a="go" data-v="daystory" data-p=\'{"d":"' + d + '"}\'') + ' aria-label="' + shortDate(d) + (c ? ', ' + esc(c.w) : '') + '" style="' + (c ? 'background:' + QUADS[c.q].bg + ';color:#fff' : fut ? 'opacity:.35' : had ? 'background:var(--pill)' : '') + '">' + parse(d).getDate() + '</button>'; };
  return '<section class="card col" style="gap:14px"><div class="between"><span class="serif" style="font-size:22px">How I\'ve been feeling</span><span class="small">Tap a day</span></div>'
    + '<div class="fgrid">' + ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => '<span class="small" style="text-align:center">' + x + '</span>').join('') + days.map(cell).join('') + '</div>'
    + (cs.length ? '<div class="col" style="gap:8px"><div class="mixbar">' + ['lp', 'hp', 'lu', 'hu'].filter(k => mix[k]).map(k => '<span style="flex:' + mix[k] + ';background:' + QUADS[k].bg + '"></span>').join('') + '</div>'
      + '<div class="chips" style="gap:12px">' + ['lp', 'hp', 'lu', 'hu'].filter(k => mix[k]).map(k => '<span class="small row" style="gap:5px"><span style="width:10px;height:10px;border-radius:5px;background:' + QUADS[k].bg + '"></span>' + moodName(k) + ' · ' + mix[k] + '</span>').join('') + '</div>'
      + '<span class="small">Most often: <b style="color:var(--ink)">' + top.map(esc).join(', ') + '</b></span></div>'
      : '<p class="sub">Check in once a day and your month fills with colour.</p>') + '</section>';
}
function sleepMini() {
  const ks = Array.from({ length: 7 }, (_, i) => addDays(TODAY, i - 6)), hs = ks.map(k => sleepHours((S.days[k] || {}).sleep));
  const got = hs.filter(h => h != null); if (!got.length) return '<button class="card between" style="border:none;text-align:left" data-a="go" data-v="sleep"><span class="col" style="gap:2px"><span class="serif" style="font-size:22px">Sleep</span><span class="small">Log how you slept each morning</span></span>' + I.right + '</button>';
  const avg = got.reduce((a, b) => a + b, 0) / got.length;
  return '<button class="card col" style="border:none;text-align:left;gap:12px" data-a="go" data-v="sleep"><div class="between" style="width:100%"><span class="serif" style="font-size:22px">Sleep</span><span class="small">' + fmtH(avg) + ' average</span></div>'
    + '<div class="sbars">' + hs.map((h, i) => '<span class="col" style="align-items:center;gap:4px;flex:1"><i style="height:' + (h == null ? 4 : Math.max(8, Math.min(1, h / 10) * 64)) + 'px;background:' + (h == null ? 'var(--line)' : h >= 7 ? '#3E5A86' : '#8FA3C7') + '"></i><span class="small" style="font-size:10px">' + 'MTWTFSS'[(dow(ks[i]) + 6) % 7] + '</span></span>').join('') + '</div></button>';
}
V.daystory = p => {
  const d = p.d, dd = S.days[d] || {}, c = dayCheck(d), sl = dd.sleep || {}, sh = sleepHours(sl);
  const jn = Object.values(S.journal || {}).filter(j => j && !j.deleted && j.date === d), sm = Object.values(S.smruti || {}).filter(x => x && !x.deleted && x.date === d);
  const done = doneNames(d), card = (title, body, bg) => '<section class="card col" style="gap:8px' + (bg ? ';background:' + bg : '') + '"><span class="eyebrow">' + title + '</span>' + body + '</section>';
  let h = '';
  const cks = (dd.checkins || []).slice().sort((x, y) => toMins(x.at) - toMins(y.at));
  h += cks.length ? card('How you felt' + (cks.length > 1 ? ' through the day' : ''), cks.map((k, i) => '<div class="col" style="gap:6px' + (i ? ';border-top:1px solid var(--line);padding-top:10px' : '') + '"><div class="row" style="gap:12px"><span style="width:18px;height:18px;border-radius:9px;background:' + QUADS[k.q].bg + ';flex-shrink:0"></span><span class="serif" style="font-size:' + (cks.length > 1 ? 22 : 26) + 'px">' + esc(k.w) + '</span><span class="small" style="margin-left:auto">' + mins(toMins(k.at)) + '</span></div>'
    + ((k.tags || []).length ? '<div class="chips">' + k.tags.map(t => '<span class="chip" style="min-height:30px;padding:4px 12px;font-size:13px">' + esc(t) + '</span>').join('') + '</div>' : '') + (k.note ? '<p style="font-size:16px;line-height:1.5">' + esc(k.note) + '</p>' : '') + '</div>').join(''))
    : card('How you felt', '<p class="sub">No check-in this day.</p>');
  if ((dd.lift || []).length) h += card('What lifted you', '<div class="chips">' + dd.lift.map(t => '<span class="chip on" style="min-height:30px;padding:4px 12px;font-size:13px">' + esc(t) + '</span>').join('') + '</div>');
  if (sl.bed || sl.wakes || (sl.night || []).length) h += card('Sleep', '<div class="grid2"><div class="stat"><b>' + (sh != null ? fmtH(sh) : '–') + '</b><span class="small">asleep' + (sl.bed ? ' · ' + mins(toMins(sl.bed)) + ' to ' + mins(toMins(sl.wake)) : '') + '</span></div><div class="stat"><b>' + (sl.wakes || (sl.night || []).length || 0) + '</b><span class="small">wake-ups</span></div></div>'
    + (sl.rested ? '<span class="small">Felt ' + RESTED[sl.rested - 1].toLowerCase() + ' in the morning' + ((sl.why || []).length ? ' · woke from: ' + sl.why.map(esc).join(', ').toLowerCase() : '') + '</span>' : ''));
  h += card('Your day' + (dd.mode ? ' · ' + ({ good: 'Good day', steady: 'Steady', hard: 'Hard day' })[dd.mode] : ''), done.length ? '<div class="col">' + done.map(t => '<div class="row" style="gap:10px;padding:6px 0"><span class="tick" style="width:22px;height:22px;border-radius:11px;background:var(--sa);color:#fff;display:flex;align-items:center;justify-content:center">' + I.tick + '</span><span style="font-size:15px">' + esc(t) + '</span></div>').join('') + '</div>' : '<p class="sub">Nothing ticked. Some days are for resting.</p>');
  const sat = [];
  if (dd.mala && (dd.mala.done || dd.mala.n)) sat.push(dd.mala.done ? dd.mala.done + (dd.mala.done === 1 ? ' mala' : ' malas') : dd.mala.n + ' beads');
  if ((dd.calm || []).length) sat.push('Calm space ' + dd.calm.filter(x => !String(x).startsWith('after:')).length + '×');
  if (sat.length || dd.prapti) h += card('Satsang', (sat.length ? '<span style="font-size:15px">' + sat.join(' · ') + '</span>' : '') + (dd.prapti ? '<p class="serif" style="font-size:20px;line-height:1.35">“' + esc(dd.prapti) + '”</p>' : ''), 'var(--tint)');
  if (jn.length || sm.length) h += card('Written', jn.map(j => '<p style="font-size:15px;line-height:1.5;white-space:pre-wrap">' + esc(j.text) + '</p>').join('<hr style="border:none;border-top:1px solid var(--line);margin:4px 0">') + sm.map(x => '<button class="link" style="align-self:flex-start" data-a="smOpen" data-id="' + x.id + '">Smruti: ' + esc(x.title || 'Open') + '</button>').join(''));
  return '<main class="wrap nonav"><div class="between"><span class="pill">' + (d === TODAY ? 'Today' : wdName(d)) + '</span>' + closeBtn() + '</div><h1 class="h1" style="font-size:clamp(32px,9vw,40px)">' + parse(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) + '</h1>' + h + '</main>';
};

/* ---------- Weekly check-in: two anxiety questions (GAD-2) after the nine ---------- */
const GAD2 = ['Feeling nervous, anxious or on edge', 'Not being able to stop or control worrying'];
{
  const baseWeekly = V.weekly;
  V.weekly = () => {
    if (WK && WK.s >= 10 && WK.s <= 11) {
      const i = WK.s - 10, top = '<div class="between"><div class="dots">' + Array.from({ length: 13 }, (_, k) => '<span class="' + (k === WK.s ? 'on' : k < WK.s ? 'past' : '') + '"></span>').join('') + '</div>' + closeBtn('wkClose') + '</div>';
      return '<main class="stage">' + top + '<div class="grow1 fade" style="justify-content:flex-start;padding-top:6px"><span class="small">Over the last 2 weeks, how often have you been bothered by…</span><h2 class="h1" style="font-size:clamp(28px,8vw,34px);line-height:1.1">' + GAD2[i] + '</h2>'
        + '<div class="col" style="gap:10px">' + PHQA.map((t, v) => '<button class="opt' + (WK.a[9 + i] === v ? ' on' : '') + '" data-a="wkAns" data-v="' + v + '">' + t + '</button>').join('') + '</div></div>'
        + '<div class="navbtns"><button class="back" data-a="wkBack" aria-label="Back">' + I.back + '</button><span class="small" style="align-self:center">' + (WK.s + 1) + ' of 11</span></div></main>';
    }
    if (WK && WK.s === 12) { WK.s = 10; const html = baseWeekly(); WK.s = 12; return html.replace('Done. Thank you.', 'Done. Thank you.'); }
    return baseWeekly().replace('Nine quick questions about the past two weeks.', 'Eleven quick questions about the past two weeks.').replace(/ of 9<\/span>/, ' of 11</span>');
  };
  A.wkAns = el => {
    const i = WK.s - 1; WK.a[i] = +el.dataset.v; render(true);
    setTimeout(() => {
      if (WK.s < 11) { WK.s++; render(); return; }
      const score = WK.a.slice(0, 9).reduce((a, b) => a + (b || 0), 0), gad = (WK.a[9] || 0) + (WK.a[10] || 0);
      S.weekly[TODAY] = { date: TODAY, answers: WK.a.slice(0, 9), score, gad2: [WK.a[9] || 0, WK.a[10] || 0], gad }; save('weekly/' + TODAY);
      WK.support = WK.a[8] > 0; WK.s = 12; render();
    }, 260);
  };
  A.wkSeen = () => { WK.support = false; render(); };
}
/* trend with both lines: mood (saffron) and anxiety (blue, dashed) */
function trendSVG(dark) {
  const ks = Object.keys(S.weekly).sort().slice(-10), pts = ks.map(k => S.weekly[k].score), gs = ks.map(k => S.weekly[k].gad);
  if (!pts.length) return '';
  const W = 310, H = 96, x = i => pts.length === 1 ? W / 2 : 14 + i * (W - 28) / (pts.length - 1), y = (v, m) => 10 + (1 - v / m) * (H - 22);
  const col = dark ? '#F08A4B' : '#C4550F', blue = dark ? '#9FB6DD' : '#3E5A86';
  const line = (arr, m, c, dash) => { const p = arr.map((v, i) => v == null ? null : [x(i), y(v, m)]).filter(Boolean); return (p.length > 1 ? '<polyline points="' + p.map(q => q.join(',')).join(' ') + '" fill="none" stroke="' + c + '" stroke-width="2.6"' + (dash ? ' stroke-dasharray="5 5"' : '') + ' stroke-linecap="round" stroke-linejoin="round"/>' : '') + p.map((q, i) => '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (i === p.length - 1 ? 4.5 : 3) + '" fill="' + c + '"/>').join(''); };
  return '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Weekly check-in, up means lighter"><line x1="0" x2="' + W + '" y1="' + (H - 12) + '" y2="' + (H - 12) + '" stroke="' + (dark ? 'rgba(247,241,232,.15)' : 'var(--pill)') + '"/>'
    + line(pts, 27, col, false) + (gs.some(v => v != null) ? line(gs, 6, blue, true) : '') + '</svg>'
    + (gs.some(v => v != null) ? '<div class="row" style="gap:14px;font-size:12px;opacity:.85"><span class="row" style="gap:6px"><i style="width:14px;height:3px;border-radius:2px;background:' + col + '"></i>Mood</span><span class="row" style="gap:6px"><i style="width:14px;height:3px;border-radius:2px;background:' + blue + '"></i>Anxiety</span></div>' : '');
}

/* ---------- Self-compassion minute (Calm space) ---------- */
const KIND = [
  ['Place a hand on your heart.', 'Breathe in slowly, and out even more slowly. Feel the warmth of your hand.'],
  ['This is a hard moment.', 'It hurts, and that is real. You don\'t have to push it away.'],
  ['You are not the only one.', 'Everyone struggles sometimes. Maharaj & Swami are with you in this, right now.'],
  ['May I be kind to myself.', 'What would you say to a friend who felt like this? Say it to yourself, gently.'],
];
V.kind = p => {
  const s = (p && p.s) || 0, last = s === KIND.length - 1, k = KIND[s];
  return '<div class="kindpage"><main class="stage" style="--ctabg:transparent"><div class="between"><div class="dots">' + KIND.map((_, i) => '<span class="' + (i === s ? 'on' : i < s ? 'past' : '') + '"></span>').join('') + '</div>' + closeBtn('kindClose') + '</div>'
    + '<div class="grow1 fade" style="align-items:center;text-align:center;gap:22px"><div class="kindglow" aria-hidden="true"></div><h1 class="h1" style="font-size:clamp(30px,8.6vw,38px)">' + k[0] + '</h1><p class="sub" style="font-size:17px;line-height:1.6;max-width:330px">' + k[1] + '</p></div>'
    + '<div class="navbtns">' + (s ? '<button class="back" data-a="kindStep" data-d="-1" aria-label="Back">' + I.back + '</button>' : '') + '<button class="btn" style="background:#A23B4F" data-a="kindStep" data-d="1">' + (last ? 'Done' : s ? 'Next' : 'Begin') + '</button></div></main></div>';
};
A.kind = () => go('kind', { s: 0 });
A.kindStep = el => { const s = route.p.s + +el.dataset.d; if (s >= KIND.length) { const dd = day(); dd.calm = (dd.calm || []).concat(['kind']); save('days/' + TODAY); hap(); return back('calm'); } go('kind', { s: Math.max(0, s) }, { replace: true }); };
A.kindClose = () => back('calm');
function kindCard() { return '<button class="card row kindcard" style="border:none;text-align:left;gap:14px" data-a="kind"><span class="itile" style="background:#A23B4F"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></span><span class="col" style="gap:2px;flex:1"><span class="serif" style="font-size:21px">Be kind to yourself</span><span class="small">A one-minute pause for hard, self-critical moments</span></span>' + I.right + '</button>'; }

/* ---------- Weekly round-up ("your week", story style) ---------- */
function weekStats(wk) {
  const ds = wkDays(wk).filter(d => d <= TODAY), D = ds.map(d => S.days[d] || {});
  const shown = ds.filter(showedUp).length, perDay = ds.map(d => doneNames(d).length), done = perDay.reduce((a, b) => a + b, 0);
  const best = done ? ds[perDay.indexOf(Math.max(...perDay))] : null;
  const cs = ds.map(dayCheck).filter(Boolean), mix = {}; cs.forEach(c => mix[c.q] = (mix[c.q] || 0) + 1);
  const words = {}; cs.forEach(c => words[c.w] = (words[c.w] || 0) + 1); const topWord = Object.keys(words).sort((a, b) => words[b] - words[a])[0];
  const sh = ds.map(d => sleepHours((S.days[d] || {}).sleep)), got = sh.filter(h => h != null);
  const wakes = D.map(x => x.sleep && (x.sleep.wakes || (x.sleep.night || []).length)).filter(x => x != null && x !== undefined);
  const malas = D.reduce((n, x) => n + ((x.mala && x.mala.done) || 0), 0), darshan = D.filter(x => x.begun).length, sabha = D.filter(x => x.done && x.done.sabha).length, praptis = D.filter(x => x.prapti && x.prapti.trim()).length;
  const rd = S.settings.read || {}, teach = Object.keys(rd).filter(k => rd[k] >= wk && rd[k] <= addDays(wk, 6)).length;
  const lifts = {}; D.forEach(x => (x.lift || []).forEach(l => { if (l !== 'Not much today') lifts[l] = (lifts[l] || 0) + 1; }));
  const wEntry = Object.keys(S.weekly).filter(k => k >= wk && k <= addDays(wk, 6)).sort().pop();
  const line = D.map((x, i) => ({ d: ds[i], t: x.prapti })).filter(x => x.t && x.t.trim()).pop() || Object.values(S.journal || {}).filter(j => j && !j.deleted && !j.auto && j.date >= wk && j.date <= addDays(wk, 6)).map(j => ({ d: j.date, t: j.text })).pop();
  return { wk, ds, shown, done, best, bestN: best ? Math.max(...perDay) : 0, cs, mix, topWord, pleasant: cs.filter(c => PLEASANT(c.q)).length, sleep: got.length ? got.reduce((a, b) => a + b, 0) / got.length : null, sleepDays: sh, wakes: wakes.length ? wakes.reduce((a, b) => a + b, 0) / wakes.length : null, malas, darshan, sabha, praptis, teach, lifts, weekly: wEntry ? S.weekly[wEntry] : null, line };
}
function latestRoundup() { return (dow(TODAY) === 0 && now().getHours() >= 18) ? weekStart(TODAY) : weekStart(addDays(weekStart(TODAY), -1)); }
function hasWeek(wk) { return wkDays(wk).some(d => showedUp(d)); }
function recapCard() {
  const wk = latestRoundup();
  if (!hasWeek(wk) || (S.settings.wrapSeen || {})[wk]) return '';
  const fresh = dow(TODAY) === 0 || dow(TODAY) === 1 || dow(TODAY) === 2; if (!fresh) return '';
  return '<button class="wrapcard" data-a="go" data-v="wrapped" data-p=\'{"wk":"' + wk + '"}\'><span class="col" style="gap:4px;position:relative;z-index:1"><span class="eyebrow" style="color:#FFE2C8">Your week</span><span class="serif" style="font-size:clamp(24px,7vw,28px);line-height:1.05">Your week in Prapti is ready</span><span style="font-size:14px;opacity:.9">' + rangeLabel(wk, addDays(wk, 6)) + ' · tap to play</span></span><span class="wrapplay" aria-hidden="true">' + PLAYI + '</span></button>';
}
let WR = null;
function cmp(a, b) { if (a == null || b == null) return ''; const d = a - b; if (Math.abs(d) < .25) return 'About the same as last week.'; return (d > 0 ? '↑ ' : '↓ ') + (Math.abs(d) < 1 ? Math.round(Math.abs(d) * 60) + ' min' : fmtH(Math.abs(d))) + (d > 0 ? ' more' : ' less') + ' than last week.'; }
function wrapSlides(wk) {
  const a = weekStats(wk), b = weekStats(addDays(wk, -7)), sl = [];
  sl.push({ bg: 'linear-gradient(160deg,#E07A2E,#C4550F 55%,#A23B4F)', html: '<div class="wmark">' + monoLotus(120) + '</div><span class="weye">Your week in Prapti</span><h2 class="wbig">' + rangeLabel(wk, addDays(wk, 6)) + '</h2><p class="wsub">Tap to see how it went.</p>' });
  sl.push({ bg: 'linear-gradient(160deg,#F2B27E,#E07A2E)', html: '<span class="weye">You showed up</span><h2 class="wnum"><span data-count="' + a.shown + '">0</span><small> of 7 days</small></h2><div class="wdots">' + wkDays(wk).map((d, i) => '<i class="' + (showedUp(d) ? 'on' : '') + '" style="animation-delay:' + (.3 + i * .12) + 's"></i>').join('') + '</div><p class="wsub">' + (b.shown || a.shown ? 'Last week: ' + b.shown + '. ' : '') + (a.shown >= 5 ? 'That\'s a steady rhythm.' : a.shown ? 'Every one of these counts.' : 'A quiet week. This one\'s a fresh start.') + '</p>' });
  if (a.done || b.done) sl.push({ bg: 'linear-gradient(160deg,#D8651C,#96610C)', html: '<span class="weye">Things you did</span><h2 class="wnum" data-count="' + a.done + '">0</h2><div class="wcmp"><div><span>This week</span><i style="--w:' + Math.round(100 * a.done / Math.max(a.done, b.done, 1)) + '%"></i><b>' + a.done + '</b></div><div><span>Last week</span><i style="--w:' + Math.round(100 * b.done / Math.max(a.done, b.done, 1)) + '%;opacity:.5"></i><b>' + b.done + '</b></div></div>' + (a.best ? '<p class="wsub">Best day: ' + wdName(a.best) + ', with ' + a.bestN + ' done.</p>' : '') });
  sl.push({ bg: 'linear-gradient(160deg,#4F6E9E,#2E7556)', html: a.cs.length ? '<span class="weye">How you felt</span><h2 class="wbig">Mostly ' + esc(a.topWord) + '</h2><div class="wmix">' + ['lp', 'hp', 'lu', 'hu'].filter(k => a.mix[k]).map(k => '<span style="--f:' + a.mix[k] + ';background:' + QUADS[k].bg + '"><em>' + moodName(k) + ' ' + a.mix[k] + '</em></span>').join('') + '</div><p class="wsub">' + a.pleasant + ' of ' + a.cs.length + ' check-ins felt Upbeat or Calm' + (b.cs.length ? ' (last week ' + b.pleasant + ' of ' + b.cs.length + ')' : '') + '.</p>' : '<span class="weye">How you felt</span><h2 class="wbig">No check-ins this week</h2><p class="wsub">Ten seconds a day builds your picture. Try one tomorrow.</p>' });
  if (a.sleep != null) sl.push({ bg: 'linear-gradient(170deg,#1F2A44,#2F4468 60%,#3E5A86)', html: '<span class="weye">Your sleep</span><h2 class="wnum" data-count="' + a.sleep + '" data-fmt="h">0</h2><p class="wsub" style="margin-top:-6px">average a night</p><div class="wbars">' + a.sleepDays.map((h, i) => '<span><i style="--h:' + (h == null ? 4 : Math.min(100, h / 10 * 100)) + '%;animation-delay:' + (.3 + i * .08) + 's"></i><em>' + 'MTWTFSS'[i] + '</em></span>').join('') + '</div><p class="wsub">' + (b.sleep != null ? cmp(a.sleep, b.sleep) + ' ' : '') + (a.wakes != null ? 'About ' + n1(a.wakes) + ' wake-ups a night.' : '') + '</p>' });
  if (a.malas || a.darshan || a.sabha || a.teach || a.praptis) sl.push({ bg: 'linear-gradient(160deg,#B8400E,#7A2E1A)', html: '<span class="weye">Your satsang</span><div class="wgrid">' + [[a.darshan, 'darshan mornings'], [a.malas, a.malas === 1 ? 'mala' : 'malas'], [a.praptis, 'prapti lines'], [a.teach, a.teach === 1 ? 'teaching read' : 'teachings read'], [a.sabha, 'sabha']].filter(x => x[0]).map(x => '<div><b data-count="' + x[0] + '">0</b><span>' + x[1] + '</span></div>').join('') + '</div><p class="wsub">Jay Swaminarayan.</p>' });
  const lk = Object.keys(a.lifts).sort((x, y) => a.lifts[y] - a.lifts[x]).slice(0, 4), ins = insights(addDays(wk, 6), 28).list[0];
  if (lk.length || ins) sl.push({ bg: 'linear-gradient(160deg,#C75B7A,#A23B4F)', html: '<span class="weye">What lifted you</span>' + (lk.length ? '<div class="wlifts">' + lk.map((l, i) => '<div style="animation-delay:' + (.3 + i * .15) + 's"><span>' + esc(l) + '</span><b>' + a.lifts[l] + '×</b></div>').join('') + '</div>' : '') + (ins ? '<p class="wsub">' + ins.text + '</p>' : '') });
  if (a.weekly) { const w = a.weekly, pw = b.weekly, mood = pw ? (w.score < pw.score ? 'lighter' : w.score > pw.score ? 'heavier' : 'steady') : null, anx = pw && w.gad != null && pw.gad != null ? (w.gad < pw.gad ? 'eased' : w.gad > pw.gad ? 'risen' : 'steady') : null;
    sl.push({ bg: 'linear-gradient(160deg,#1F6F78,#2E7556)', html: '<span class="weye">Your weekly check-in</span><h2 class="wbig">' + (mood === 'lighter' ? 'A lighter week than last.' : mood === 'heavier' ? 'A heavier week.' : mood === 'steady' ? 'Holding steady.' : 'Your first line is drawn.') + '</h2><p class="wsub">' + (mood === 'heavier' ? 'That\'s information, not failure. Hard weeks pass, and your team can help.' : 'The direction over a few weeks matters more than any single week.') + (anx ? ' Anxiety has ' + anx + '.' : '') + '</p><div class="wtrend">' + trendSVG(true) + '</div>' }); }
  else if (dow(TODAY) === 0 && wk === weekStart(TODAY)) sl.push({ bg: 'linear-gradient(160deg,#1F6F78,#2E7556)', html: '<span class="weye">Your weekly check-in</span><h2 class="wbig">Two minutes, then your line grows.</h2><button class="wbtn" data-a="go" data-v="weekly">Do it now</button>' });
  if (a.line) sl.push({ bg: 'linear-gradient(160deg,#FBEFE2,#F4D9BF)', dark: true, html: '<span class="weye" style="color:#A8470C">A line you wrote · ' + wdName(a.line.d) + '</span><p class="wquote">“' + esc(a.line.t.length > 220 ? a.line.t.slice(0, 217) + '…' : a.line.t) + '”</p>' });
  sl.push({ bg: 'linear-gradient(160deg,#E07A2E,#C4550F 55%,#A23B4F)', end: true, html: '<div class="wmark">' + monoLotus(90) + '</div><span class="weye">That\'s your week</span><h2 class="wbig">' + (a.shown >= 5 ? 'You kept showing up.' : a.shown ? 'You showed up. That matters.' : 'Next week is a fresh start.') + '</h2><div class="wchips">' + [a.shown + ' days', a.done + ' things done', a.sleep != null ? fmtH(a.sleep) + ' sleep' : null, a.malas ? a.malas + ' malas' : null].filter(Boolean).map(t => '<span>' + t + '</span>').join('') + '</div><button class="wbtn" data-a="wrapDone">Onto next week</button>' });
  return sl;
}
V.wrapped = p => {
  const wk = p.wk || latestRoundup();
  if (!WR || WR.wk !== wk) WR = { wk, i: 0, slides: wrapSlides(wk) };
  const s = WR.slides[WR.i];
  return '<div class="wstory' + (s.dark ? ' wdark' : '') + '" style="background:' + s.bg + '"><div class="wbars-top">' + WR.slides.map((_, i) => '<i class="' + (i < WR.i ? 'done' : i === WR.i ? 'now' : '') + '"></i>').join('') + '</div>'
    + '<button class="wclose" data-a="wrapClose" aria-label="Close">' + I.close + '</button>'
    + '<div class="wtap wl" data-a="wrapPrev" aria-label="Previous"></div><div class="wtap wr" data-a="wrapNext" aria-label="Next"></div>'
    + '<div class="wbody" key="' + WR.i + '">' + s.html + '</div></div>';
};
V.wrapped_after = () => { document.querySelectorAll('.wstory [data-count]').forEach(el => countUp(el, +el.dataset.count, 1100)); requestAnimationFrame(() => { const w = $('.wstory'); if (w) w.classList.add('go'); }); };
A.wrapNext = () => { if (WR.i < WR.slides.length - 1) { WR.i++; hap(); render(); } };
A.wrapPrev = () => { if (WR.i > 0) { WR.i--; render(); } };
A.wrapDone = () => { S.settings.wrapSeen = Object.assign({}, S.settings.wrapSeen, { [WR.wk]: TODAY }); save('settings'); WR = null; softFall(10); stack = []; go('me', null, { replace: true }); };
A.wrapClose = () => { if (WR && WR.i >= WR.slides.length - 2) { S.settings.wrapSeen = Object.assign({}, S.settings.wrapSeen, { [WR.wk]: TODAY }); save('settings'); } WR = null; back('me'); };
function weeksCard() {
  const first = Object.keys(S.days).filter(d => showedUp(d)).sort()[0]; if (!first) return '';
  const cur = latestRoundup(), L = []; for (let wk = cur; wk >= weekStart(first) && L.length < 12; wk = addDays(wk, -7)) if (hasWeek(wk)) L.push(wk);
  if (!L.length) return '';
  return '<section class="col" style="gap:10px"><h2 class="h2">Your weeks</h2><div class="carousel" style="gap:10px">' + L.map((wk, i) => { const st = weekStats(wk); return '<button class="weekchip" data-a="go" data-v="wrapped" data-p=\'{"wk":"' + wk + '"}\' style="background:' + ['linear-gradient(160deg,#E07A2E,#A23B4F)', 'linear-gradient(160deg,#4F6E9E,#2E7556)', 'linear-gradient(160deg,#D8651C,#96610C)', 'linear-gradient(160deg,#2F4468,#3E5A86)'][i % 4] + '"><span class="small" style="color:rgba(255,255,255,.85)">' + rangeLabel(wk, addDays(wk, 6)) + '</span><b class="serif">' + st.shown + '<small> days</small></b><span style="font-size:12px;opacity:.9">' + st.done + ' done' + (st.topWord ? ' · ' + esc(st.topWord) : '') + '</span>' + ((S.settings.wrapSeen || {})[wk] ? '' : '<i class="newdot"></i>') + '</button>'; }).join('') + '</div></section>';
}
