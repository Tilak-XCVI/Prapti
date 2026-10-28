/* ===== Darshan (morning) ===== */
V.darshan = () => {
  const { m, ti } = dailyPair(TODAY), dd = day();
  const own = ownList(), n = dayNum(TODAY), pool = DAILY_MURTIS.length + own.length, slot = ((n % pool) + pool) % pool;
  const v = slot >= DAILY_MURTIS.length ? pairView({ own: own[slot - DAILY_MURTIS.length].id, ti }) : pairView({ m, ti });
  const q = { t: v.t, by: v.by, scan: v.mine ? '' : C.thoughts[ti].scan }; dView = v;
  const long = q.t.length > 180;
  return '<main class="wrap nonav" style="background:var(--bg2);gap:20px">'
    + '<div class="murtiBox">' + imgTag(v, 'Today\'s darshan') + '</div>'
    + '<div class="col" style="gap:10px;align-items:flex-start"><span class="pill">' + dayLabel(TODAY) + '</span>'
    + '<h1 class="serif" style="font-size:clamp(31px,9.2vw,38px);line-height:1.05;letter-spacing:-.01em">Jay Swaminarayan, Chhaya</h1></div>'
    + '<div class="col" style="gap:8px"><p class="quote' + (long ? ' clamp3' : '') + '" style="font-size:' + quoteSize(q.t) + '">“' + esc(q.t) + '”</p>'
    + (long || q.scan ? '<button class="link" style="align-self:flex-start;height:28px" data-a="' + (v.mine ? 'ownQuote' : 'thought') + '" data-i="' + ti + '">' + (long ? 'Read more' : 'See it in his handwriting') + '</button>' : '')
    + '<div class="by">' + esc(q.by) + '</div></div>'
    + onThisDay()
    + '<div class="col" style="gap:4px"><label for="prapti" class="serif" style="font-size:21px;line-height:1.2">What have Maharaj &amp; Swami given me today?</label>'
    + '<textarea id="prapti" class="ruled" rows="2" style="height:68px" placeholder="Write a line…" data-in="prapti">' + esc(dd.prapti) + '</textarea></div>'
    + '<div style="flex:1"></div>'
    + '<button class="btn" data-a="begin">Begin my day</button>'
    + '</main>';
};
let dView = null;
V.darshan_after = () => fillPhotos();
A.ownQuote = () => sheet('<div class="between"><span class="eyebrow">' + esc(dView.by) + '</span><button class="iconbtn" data-a="closeSheet" aria-label="Close">' + I.close + '</button></div><p class="quote" style="font-size:22px">“' + esc(dView.t) + '”</p>');
INP.prapti = el => { day().prapti = el.value; save('days/' + TODAY); };
A.begin = () => {
  const dd = day(); const first = !dd.begun; dd.begun = true; save('days/' + TODAY); if (first) setTimeout(() => petalRain(18), 200);
  if (!(dd.sleep && (dd.sleep.bed || dd.sleep.skipped)) && now().getHours() < 15) go('sleeplog', { after: S.settings.setupDone ? 'today' : 'setup' }, { replace: true });
  else if (!S.settings.setupDone) go('setup', { first: true }, { replace: true }); else { stack = []; go('today', null, { replace: true }); }
};

/* ===== Setup ===== */
const SETUP_TILES = ['Puja', 'Breakfast and supplements', 'Daylight walk', 'Arti', 'Thaal', 'Seva', 'Call someone', 'Read satsang for 10 minutes', 'Stretch for 5 minutes', 'Rest', 'Tidy one space', 'Drink water'];
const WHEN = [['normal', 'Every day', 'Steady and good days'], ['good', 'Good days only', 'Good days only']];
function taskWhen(t) { return t.when === 'good' ? 'good' : 'normal'; }
function addToLibrary(name) { const L = S.settings.library || (S.settings.library = []); if (!SETUP_TILES.includes(name) && !L.includes(name)) L.push(name); }
let setupSel = null, setupEdit = false;
V.setup = p => {
  if (!setupSel) setupSel = S.settings.tasks.map(t => ({ t: t.t, when: taskWhen(t) }));
  const lib = S.settings.library || [], names = setupSel.map(x => x.t);
  const all = SETUP_TILES.concat(lib.filter(t => !SETUP_TILES.includes(t)), names.filter(t => !SETUP_TILES.includes(t) && !lib.includes(t)));
  const n = setupSel.length, mins_ = S.settings.minimums || [];
  return '<main class="wrap nonav" style="gap:22px">'
    + '<div class="between"><span class="pill">' + (p.first ? 'One time' : 'My daily tasks') + '</span>' + (p.first ? '' : closeBtn()) + '</div>'
    + '<div class="col" style="gap:8px"><h1 class="h1">What do you want in your day?</h1><p class="sub">Tap to add or remove. Anything you write stays here so you can tap it again another time.</p></div>'
    + '<div class="chips" style="gap:10px">' + all.map(t => { const i = names.indexOf(t), custom = !SETUP_TILES.includes(t); return '<span style="position:relative;display:inline-flex"><button class="chip' + (i > -1 ? ' on' : '') + '" style="min-height:48px;padding:10px 16px;font-size:15px;border-radius:24px" data-a="setupTog" data-t="' + esc(t) + '" aria-pressed="' + (i > -1) + '">' + esc(t) + '</button>' + (setupEdit && custom ? '<button class="libx" data-a="libRm" data-t="' + esc(t) + '" aria-label="Remove ' + esc(t) + ' from the list">' + I.close + '</button>' : '') + '</span>'; }).join('') + '</div>'
    + '<div class="addrow"><input id="ownTask" placeholder="Write my own" aria-label="Write my own task" data-enter="setupAdd"><button class="iconbtn" style="background:var(--sa);color:#fff" data-a="setupAdd" aria-label="Add">' + I.plus + '</button></div>'
    + (lib.length ? '<button class="link" style="align-self:flex-start;margin-top:-10px" data-a="libEdit">' + (setupEdit ? 'Done tidying' : 'Tidy my list') + '</button>' : '')
    + (n ? '<section class="col" style="gap:10px"><h2 class="h2">When should each one show?</h2><p class="small" style="margin-top:-4px">Steady days show your “every day” tasks. Good days show everything. Hard days use your minimums below.</p>'
      + setupSel.map((x, i) => '<div class="card col" style="gap:10px;padding:14px 16px"><span style="font-weight:600;font-size:16px">' + esc(x.t) + '</span><div class="seg" role="group" aria-label="When ' + esc(x.t) + ' shows" style="grid-template-columns:repeat(2,minmax(0,1fr))">' + WHEN.map(w => '<button class="' + (x.when === w[0] ? 'on' : '') + '" style="height:36px;font-size:13px" data-a="setupWhen" data-i="' + i + '" data-w="' + w[0] + '" aria-pressed="' + (x.when === w[0]) + '">' + w[1] + '</button>').join('') + '</div></div>').join('') + '</section>' : '')
    + '<section class="col" style="gap:10px"><h2 class="h2">My hard-day minimums</h2><p class="small" style="margin-top:-4px">The smallest version of each thing, done without effort. On a hard day, one tap swaps your list for these.</p>'
    + '<div class="card" style="padding:4px 16px">' + mins_.map((m, i) => '<div class="between divrow" style="min-height:48px"><span style="font-size:16px">' + esc(m) + '</span><button class="xbtn" data-a="minRm" data-i="' + i + '" aria-label="Remove ' + esc(m) + '">' + I.close + '</button></div>').join('')
    + '<div class="row" style="min-height:52px"><input id="minNew" style="flex:1;min-width:0;border:none;background:transparent;font-size:16px;height:44px" placeholder="+ Add a minimum" aria-label="Add a hard-day minimum" data-enter="minAdd"><button class="link" data-a="minAdd">Add</button></div></div></section>'
    + '<div style="flex:1"></div>'
    + '<div class="cta"><button class="btn" data-a="setupDone">' + (n ? 'Save my day' : 'Continue with none for now') + '</button></div></main>';
};
A.setupTog = el => { const t = el.dataset.t, i = setupSel.findIndex(x => x.t === t); if (i > -1) setupSel.splice(i, 1); else setupSel.push({ t, when: 'normal' }); render(true); };
A.setupWhen = el => { setupSel[+el.dataset.i].when = el.dataset.w; render(true); };
A.setupAdd = () => { const i = $('#ownTask'), v = i.value.trim(); if (!v) return; addToLibrary(v); save('settings'); if (!setupSel.some(x => x.t === v)) setupSel.push({ t: v, when: 'normal' }); render(true); setTimeout(() => $('#ownTask') && $('#ownTask').focus(), 30); };
A.libEdit = () => { setupEdit = !setupEdit; render(true); };
A.libRm = el => { const t = el.dataset.t; S.settings.library = (S.settings.library || []).filter(x => x !== t); setupSel = setupSel.filter(x => x.t !== t); save('settings'); render(true); };
A.minAdd = () => { const i = $('#minNew'), v = i && i.value.trim(); if (!v) return; (S.settings.minimums = S.settings.minimums || []).push(v); save('settings'); render(true); setTimeout(() => $('#minNew') && $('#minNew').focus(), 30); };
A.minRm = el => { S.settings.minimums.splice(+el.dataset.i, 1); save('settings'); render(true); };
A.setupDone = () => {
  const old = S.settings.tasks;
  setupSel.forEach(x => addToLibrary(x.t));
  S.settings.tasks = setupSel.map(x => Object.assign({}, old.find(o => o.t === x.t) || { id: uid(), t: x.t }, { when: x.when }));
  S.settings.setupDone = true; setupSel = null; setupEdit = false; save('settings');
  stack = []; go('today', null, { replace: true });
};

/* ===== Today ===== */
const DONE_LINES = ['All done. Jay Swaminarayan.', 'You showed up today. Maharaj & Swami saw it.', 'Small steps, done. That\'s how it\'s built.'];
const JOB_BANK = {
  Apply: { good: 'Tailor and send one application', steady: 'Save two HR roles to look at later', hard: 'Read one job description' },
  Prepare: { good: 'Update one section of my CV', steady: 'Write one line for a cover letter', hard: 'Open my CV and read it through' },
  Connect: { good: 'Message one contact about work', steady: 'Reply to one message or email', hard: 'Update one line on LinkedIn' },
  Grow: { good: 'One module of a free HR course', steady: 'Read one CIPD article or HR news story', hard: 'Listen to 10 minutes of an HR podcast' },
};
const HEARD_BACK = ['Honour and insult are both perishable.', 'The Satpurush\'s affection is not reduced.'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function rtmsTimeOn(d) { const R = S.rtms, sch = R.schedule || {}; if (d < (R.start || RTMS_START)) return null; const t = sch[WEEKDAYS[dow(d)]]; return t || null; }
function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40); }
function todayItems(d) {
  const dd = day(d), items = [];
  if (dow(d) === 6) items.push({ id: 'sabha', t: 'Sabha today' + (S.settings.sabhaTime ? ' · ' + mins(toMins(S.settings.sabhaTime)) : ''), fixed: true, sabha: true });
  const rt = hidden('rtms') ? null : rtmsTimeOn(d); if (rt && !dd.noRtms) items.push({ id: 'rtms', t: 'rTMS session · ' + mins(toMins(rt)), fixed: true, rtms: true });
  if (dd.first) items.push({ id: 'first', t: dd.first, first: true });
  let own;
  if (dd.mode === 'hard') own = (S.settings.minimums || []).map(m => ({ id: 'min-' + slug(m), t: m, min: true }));
  else own = S.settings.tasks.map(t => ({ id: t.id, t: t.t, when: taskWhen(t) })).filter(t => dd.mode === 'good' || t.when !== 'good');
  const ex = (dd.extras || []).map(e => ({ id: e.id, t: e.t, extra: true }));
  return items.concat(own, ex);
}
function toMins(hhmm) { const [h, m] = String(hhmm || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); }
function ring(done, total) {
  const r = 26, c = 2 * Math.PI * r, f = total ? done / total : 0;
  return '<svg width="68" height="68" viewBox="0 0 68 68" role="img" aria-label="' + done + ' of ' + total + ' done"><circle cx="34" cy="34" r="' + r + '" fill="none" stroke="var(--pill)" stroke-width="7"/><circle cx="34" cy="34" r="' + r + '" fill="none" stroke="#C4550F" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + (c * (1 - f)) + '" transform="rotate(-90 34 34)" style="transition:stroke-dashoffset .6s cubic-bezier(.2,.7,.2,1)"/><text x="34" y="39" text-anchor="middle" font-family="Figtree, sans-serif" font-size="15" font-weight="700" fill="var(--ink)">' + done + '/' + total + '</text></svg>';
}
let lastTicked = null, justFinished = false, welcome = null, jobPick = null, jobMsg = '';
V.today = () => {
  const dd = day(), items = todayItems(TODAY), done = items.filter(i => dd.done[i.id]).length;
  const all = items.length > 0 && done === items.length;
  const line = dd.mode === 'hard' && all ? 'Hard day, and you still did it. That\'s strength.' : DONE_LINES[dayNum(TODAY) % DONE_LINES.length];
  const task = i => '<div class="row" style="gap:0;position:relative">'
    + '<button class="task' + (dd.done[i.id] ? ' done' : '') + (lastTicked === i.id && dd.done[i.id] ? ' just' : '') + (i.sabha ? ' sabha' : '') + '" data-a="tog" data-id="' + esc(i.id) + '" aria-pressed="' + !!dd.done[i.id] + '"><span class="tick">' + (dd.done[i.id] ? I.tick : '') + '</span><span class="tt">' + esc(i.t) + (i.sabha ? '<span class="small" style="display:block;text-decoration:none">' + (dd.done[i.id] ? 'You went. Jay Swaminarayan.' : 'Tap when you\'ve been') + '</span>' : '') + (i.rtms ? '<span class="small" style="display:block">' + (dd.done[i.id] ? 'Counted. ' + S.rtms.sessions.length + ' times you showed up.' : 'Tap when you\'ve been') + '</span>' : '') + '</span></button>'
    + (i.first ? '<span class="firsttag">First thing</span>' : '') + (i.extra ? '<button class="xbtn" style="position:absolute;right:10px" data-a="rmExtra" data-id="' + i.id + '" aria-label="Remove ' + esc(i.t) + '">' + I.close + '</button>' : '')
    + '</div>';
  const pin = dd.pin ? '<div class="card" style="background:var(--tint);display:flex;flex-direction:column;gap:6px"><div class="between"><span class="eyebrow">Carry it today</span><button class="link" data-a="unpin" aria-label="Remove">' + I.close + '</button></div><p class="serif it" style="font-size:20px;line-height:1.3">' + esc(dd.pin) + '</p></div>' : '';
  const sleepCard = (() => { const sl = S.settings.sleep; if (!sl) return ''; const h = now().getHours() * 60 + now().getMinutes(); if (h < sl.wind - 45 || h > sl.wind + 120) return ''; return '<div class="darkcard" style="background:#2F4468;display:flex;flex-direction:column;gap:6px"><span class="eyebrow" style="color:#C9D4EA">Wind down · ' + mins(sl.wind) + '</span><p class="serif" style="font-size:21px;line-height:1.25">Dim the lights, phone away, arti or dhun. Wake at ' + mins(sl.wake) + '.</p></div>'; })();
  return '<main class="wrap">'
    + '<div class="between"><span class="pill">' + dayLabel(TODAY) + '</span><button class="link" data-a="rereadDarshan">Today\'s darshan</button></div>'
    + (OWNER ? '<div class="card" style="background:var(--pill);font-size:14px;line-height:1.45"><b>This is Chhaya\'s app.</b> Anything you tick or type here saves to her data.</div>' : '')
    + noteCard()
    + (welcome ? '<p class="serif it fade" style="font-size:21px;color:var(--saT)">' + welcome + '</p>' : '')
    + sleepPrompt()
    + '<div class="between"><div class="col" style="gap:6px"><h1 class="h1">Today</h1><p class="sub">' + (items.length ? (all ? 'Everything done.' : done ? 'Some done is a good day.' : 'One at a time.') : 'Nothing set. That\'s allowed.') + '</p></div>' + ring(done, items.length) + '</div>'
    + '<div class="seg" role="group" aria-label="How is today?">' + ['good', 'steady', 'hard'].map(k => '<button class="' + (dd.mode === k ? 'on' : '') + '" data-a="mode" data-k="' + k + '" aria-pressed="' + (dd.mode === k) + '">' + ({ good: 'Good day', steady: 'Steady', hard: 'Hard day' })[k] + '</button>').join('') + '</div>'
    + '<p class="small fade" style="margin-top:-12px;line-height:1.5">' + ({ good: '<b style="color:var(--ink)">Good day:</b> everything on your list, including your good-day extras. Job steps are a little bigger.', steady: '<b style="color:var(--ink)">Steady:</b> your every-day list.', hard: '<b style="color:var(--ink)">Hard day:</b> just your minimums, plus anything you add. One thing done on a heavy day counts fully. <button class="link" style="font-size:13px" data-a="goCalm">Calm space</button> ·' })[dd.mode] + ' <button class="link" style="font-size:13px" data-a="go" data-v="setup">Edit</button>' + '</p>'
    + pin + sleepCard
    + '<div class="col" style="gap:10px">' + items.map(task).join('')
    + (all ? '<div class="petals" aria-hidden="true">' + '' + '</div><p class="serif it fade" style="font-size:24px;text-align:center;padding:8px 0;color:var(--saT)">' + line + '</p>' : '')
    + (true ? '<div class="addrow"><input id="extra" placeholder="Add something for today" aria-label="Add something for today" data-enter="addExtra"><button class="iconbtn" style="background:var(--sa);color:#fff" data-a="addExtra" aria-label="Add">' + I.plus + '</button></div>' : '')
    + extraChips(dd)
    + (rtmsTimeOn(TODAY) && !dd.noRtms && !dd.done.rtms ? '<button class="link" style="align-self:flex-start;color:var(--faint);font-weight:500" data-a="noRtms">No rTMS session today</button>' : '')
    + '</div>'
    + firstTomorrowCard()
    + journalCard()
    + jobCard()
    + '<button class="darkcard" data-a="go" data-v="checkin" style="border:none;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px"><span class="col" style="gap:6px"><span class="serif" style="font-size:25px;line-height:1.1">How are you right now?</span><span style="font-size:14px;color:#CDBBA8">' + (dd.checkins.length ? 'Last: ' + esc(dd.checkins[dd.checkins.length - 1].w) + ' at ' + dd.checkins[dd.checkins.length - 1].at + ' · ' + dd.checkins.length + ' today' : 'Two taps. Whenever you like.') + '</span></span><span style="width:46px;height:46px;border-radius:23px;background:var(--sa);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + I.plus.replace('currentColor', '#fff') + '</span></button>'
    + weeklyNudge()
    + '</main>';
};
V.today_after = () => { justFinished = false; lastTicked = null; };
function mins(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + (mm ? ':' + pad(mm) : '') + (h < 12 ? 'am' : 'pm'); }
function weeklyNudge() {
  const wk = weekStart(TODAY); const doneThisWeek = Object.keys(S.weekly).some(k => k >= wk);
  if (doneThisWeek || dow(TODAY) !== 0) return '';
  return '<button class="card" data-a="go" data-v="weekly" style="border:none;text-align:left;display:flex;justify-content:space-between;align-items:center;background:var(--tint)"><span class="col" style="gap:4px"><span class="eyebrow">Sunday</span><span class="serif" style="font-size:21px">Weekly check-in · 2 minutes</span></span>' + I.right + '</button>';
}
function jobWeek() { const wk = weekStart(TODAY); if (!S.job.weeks[wk]) S.job.weeks[wk] = { steps: [], quiet: false }; return S.job.weeks[wk]; }
function jobCard() {
  if (hidden('job')) return '';
  const w = jobWeek(), n = w.steps.filter(s => s.done).length, mode = day().mode;
  let body = '';
  if (jobPick) {
    body = '<div class="col fade" style="gap:8px"><span class="small">Pick one. Sized for a ' + ({ good: 'good', steady: 'steady', hard: 'hard' })[mode] + ' day.</span>'
      + Object.keys(JOB_BANK).map(k => '<button class="opt" style="background:var(--card2);min-height:52px" data-a="jobAdd" data-k="' + k + '"><span class="eyebrow" style="display:block;font-size:10px">' + k + '</span>' + esc(JOB_BANK[k][mode]) + '</button>').join('')
      + '<button class="link" style="align-self:flex-start" data-a="jobPickOff">Not now</button></div>';
  } else {
    body = (w.steps.length ? '<div class="col">' + w.steps.map((s, i) => '<button class="checkrow" data-a="jobTog" data-i="' + i + '"><span class="box' + (s.done ? ' on' : '') + '">' + (s.done ? I.tick : '') + '</span><span' + (s.done ? ' style="color:var(--faint)"' : '') + '>' + esc(s.t) + '</span></button>').join('') + '</div>' : '')
      + (jobMsg ? '<p class="serif fade" style="font-size:19px;line-height:1.3;color:var(--saT)">' + jobMsg + '</p>' : '')
      + '<div class="row" style="gap:8px"><button class="chip" style="background:var(--sa);color:#fff" data-a="jobAddSheet">+ Add a step</button><button class="chip" data-a="jobMore" aria-label="More options">···</button></div>';
  }
  return '<section class="card" style="display:flex;flex-direction:column;gap:12px">'
    + '<div class="between"><span class="row" style="gap:12px"><span class="itile sm" style="background:#96610C">' + gicon('job') + '</span><span class="eyebrow">This week · Job search</span></span><span class="small">' + (n ? n + (n === 1 ? ' step' : ' steps') + ' taken' : 'Aim for 2 or 3') + '</span></div>'
    + '<p class="serif it" style="font-size:21px;line-height:1.2">“Do your best and leave the rest.”</p>'
    + body + '</section>';
}
A.jobAddSheet = () => sheet('<div class="between"><span class="h2">Add a step</span>' + closeBtn('closeSheet') + '</div><div class="addrow" style="min-height:48px"><input id="jobOwn" placeholder="Write my own" aria-label="Write my own step" data-enter="jobOwn"><button class="iconbtn" style="background:var(--sa);color:#fff" data-a="jobOwn" aria-label="Add">' + I.plus + '</button></div><span class="small">Or pick one, sized for today</span>' + Object.keys(JOB_BANK).map(k => '<button class="opt" data-a="jobAdd" data-k="' + k + '"><span class="eyebrow" style="display:block;font-size:10px">' + k + '</span>' + esc(JOB_BANK[k][day().mode || 'steady']) + '</button>').join(''));
A.jobMore = () => sheet('<div class="between"><span class="h2">Job search</span>' + closeBtn('closeSheet') + '</div><button class="opt" data-a="jobQuiet">Nothing to apply for this week</button><button class="opt" data-a="jobHeard">I heard back</button>');
A.jobPickOn = () => { jobPick = true; jobMsg = ''; render(true); };
A.jobPickOff = () => { jobPick = null; render(true); };
A.jobAdd = el => { const k = el.dataset.k; jobWeek().steps.push({ t: JOB_BANK[k][day().mode || 'steady'], type: k, done: false }); jobPick = null; save('job'); closeSheet(); render(true); };
A.jobTog = el => { const s = jobWeek().steps[+el.dataset.i]; s.done = !s.done; if (s.done) { s.date = TODAY; const r = el.querySelector('.box').getBoundingClientRect(); burstAt(r.left + 12, r.top + 12, 12); buzz(); } save('job'); render(true); };
A.jobOwn = () => { const i = $('#jobOwn'), v = i && i.value.trim(); if (!v) return; jobWeek().steps.push({ t: v, type: 'Own', done: false }); save('job'); closeSheet(); render(true); };
A.jobQuiet = () => { closeSheet(); const w = jobWeek(); w.quiet = true; save('job'); jobMsg = 'Some weeks there\'s nothing to apply for. That\'s the market, not you. Rest counts too.'; render(true); };
A.jobHeard = () => { closeSheet(); jobMsg = '“' + HEARD_BACK[Math.floor(Math.random() * HEARD_BACK.length)] + '” Whenever you\'re ready, a steady step or some rest.'; render(true); };
A.tog = el => {
  const dd = day(), id = el.dataset.id; dd.done[id] = !dd.done[id];
  if (id === 'rtms') { const s = S.rtms.sessions; if (dd.done[id] && !s.includes(TODAY)) s.push(TODAY); if (!dd.done[id]) S.rtms.sessions = s.filter(x => x !== TODAY); save('rtms'); }
  save('days/' + TODAY);
  const items = todayItems(TODAY); justFinished = items.length && items.every(i => dd.done[i.id]);
  if (dd.done[id]) { lastTicked = id; const r = el.querySelector('.tick').getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top + r.height / 2, 14); buzz(); }
  render(true);
  if (justFinished && dd.done[id]) setTimeout(celebrate, 250);
};
A.mode = el => { day().mode = el.dataset.k; save('days/' + TODAY); jobPick = null; render(true); };
function rememberExtra(v) { const L = S.settings.extraLib || (S.settings.extraLib = []); const i = L.indexOf(v); if (i > -1) L.splice(i, 1); L.unshift(v); S.settings.extraLib = L.slice(0, 24); save('settings'); }
A.addExtra = () => { const i = $('#extra'), v = i && i.value.trim(); if (!v) return; day().extras.push({ id: 'x' + uid(), t: v }); rememberExtra(v); save('days/' + TODAY); render(true); setTimeout(() => $('#extra') && $('#extra').focus(), 30); };
A.extraChip = el => { const v = el.dataset.t; day().extras.push({ id: 'x' + uid(), t: v }); rememberExtra(v); save('days/' + TODAY); burstEl(el, 8); render(true); };
A.extraForget = el => { S.settings.extraLib = (S.settings.extraLib || []).filter(x => x !== el.dataset.t); save('settings'); render(true); };
let extraEdit = false;
A.extraEdit = () => { extraEdit = !extraEdit; render(true); };
function extraChips(dd) {
  const have = new Set((dd.extras || []).map(e => e.t)), L = (S.settings.extraLib || []).filter(x => !have.has(x)).slice(0, 10);
  if (!L.length) return '';
  return '<div class="col" style="gap:6px"><div class="chips">' + L.map(x => '<span style="position:relative;display:inline-flex"><button class="chip" style="font-weight:500" data-a="extraChip" data-t="' + esc(x) + '">+ ' + esc(x) + '</button>' + (extraEdit ? '<button class="libx" data-a="extraForget" data-t="' + esc(x) + '" aria-label="Forget ' + esc(x) + '">' + I.close + '</button>' : '') + '</span>').join('') + '</div><button class="link" style="align-self:flex-start;font-size:13px;color:var(--faint);font-weight:500" data-a="extraEdit">' + (extraEdit ? 'Done' : 'Tidy these') + '</button></div>';
}
A.rmExtra = el => { const dd = day(); dd.extras = dd.extras.filter(e => e.id !== el.dataset.id); delete dd.done[el.dataset.id]; save('days/' + TODAY); render(true); };
A.noRtms = () => { day().noRtms = true; save('days/' + TODAY); render(true); };
A.unpin = () => { day().pin = ''; save('days/' + TODAY); render(true); };
A.rereadDarshan = () => go('darshan');

/* ===== Check-in ===== */
const QUADS = {
  hu: { e: 'High energy', l: 'Unpleasant', bg: '#B8400E', words: ['Anxious', 'Restless', 'Overwhelmed', 'Frustrated', 'Tense', 'Panicky'] },
  hp: { e: 'High energy', l: 'Pleasant', bg: '#96610C', words: ['Hopeful', 'Motivated', 'Happy', 'Grateful', 'Excited', 'Proud'] },
  lu: { e: 'Low energy', l: 'Unpleasant', bg: '#3E5A86', words: ['Heavy', 'Flat', 'Tired', 'Lonely', 'Numb', 'Hopeless'] },
  lp: { e: 'Low energy', l: 'Pleasant', bg: '#2E7556', words: ['Calm', 'Content', 'Peaceful', 'Rested', 'Relieved', 'At ease'] },
};
const TAGS = ['Puja', 'Sabha', 'Seva', 'Walk', 'Job search', 'Resting', 'rTMS', 'On my own', 'Family', 'Friends'];
let CI = null;
V.checkin = () => {
  if (!CI) CI = { step: 0, q: null, w: null, tags: [], note: '', extraTags: [] };
  const top = '<div class="between"><span class="pill">' + new Date().toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }) + '</span>' + closeBtn('ciClose') + '</div>';
  if (CI.step === 0) return '<main class="wrap nonav">' + top + '<div class="col" style="gap:8px"><h1 class="h1">How are you right now?</h1><p class="sub">Tap the one that\'s closest. No wrong answers.</p></div>'
    + '<div class="quad">' + ['hu', 'hp', 'lu', 'lp'].map(k => '<button style="background:' + QUADS[k].bg + '" data-a="ciQ" data-k="' + k + '"><span class="l">' + moodName(k) + '</span></button>').join('') + '</div></main>';
  if (CI.step === 1) {
    const Q = QUADS[CI.q];
    return '<main class="wrap nonav">' + top
      + '<div class="col fade" style="gap:8px"><span class="eyebrow" style="color:' + Q.bg + '">' + moodName(CI.q) + '</span><h1 class="h1">Which word fits?</h1></div>'
      + '<div class="chips" style="gap:10px">' + Q.words.map(w => '<button class="chip" style="min-height:48px;padding:10px 18px;font-size:16px;' + (CI.w === w ? 'background:' + Q.bg + ';color:#fff' : '') + '" data-a="ciW" data-w="' + w + '" aria-pressed="' + (CI.w === w) + '">' + w + '</button>').join('') + '</div>'
      + '<div class="col" style="gap:10px"><span class="h2">What\'s happening?</span><span class="small">Optional</span><div class="chips">' + TAGS.concat(CI.extraTags).map(t => '<button class="chip' + (CI.tags.includes(t) ? ' on' : '') + '" data-a="ciT" data-t="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>'
      + '<div class="addrow" style="min-height:48px"><input id="ciOwn" placeholder="Add your own" aria-label="Add your own tag" data-enter="ciOwn"><button class="iconbtn" data-a="ciOwn" aria-label="Add">' + I.plus + '</button></div></div>'
      + '<div class="col" style="gap:4px"><label for="ciNote" class="h2">Anything else?</label><textarea id="ciNote" class="ruled" style="height:68px" placeholder="A line, if you want" data-in="ciNote">' + esc(CI.note) + '</textarea></div>'
      + '<div style="flex:1"></div><div class="cta"><button class="btn" data-a="ciSave"' + (CI.w ? '' : ' disabled style="opacity:.45"') + '>Save</button></div></main>';
  }
  const Q = QUADS[CI.q], unpleasant = CI.q === 'hu' || CI.q === 'lu';
  const weekAgo = addDays(TODAY, -6);
  const hopeless = Object.values(S.days).filter(d => d.date >= weekAgo).reduce((n, d) => n + (d.checkins || []).filter(c => c.w === 'Hopeless').length, 0);
  return '<main class="wrap nonav" style="justify-content:center;text-align:center">'
    + '<div class="orb" style="background:' + Q.bg + '"></div><p class="small" style="margin-top:-8px">Saved to today · you can see it in Me</p>'
    + '<h1 class="h1" style="font-size:clamp(32px,9vw,40px)">' + (unpleasant ? 'Thank you for checking in.' : 'That\'s worth noticing.') + '</h1>'
    + '<p class="sub" style="font-size:16px">' + (unpleasant ? (hopeless >= 2 ? 'Hopeless has come up a few times this week. That\'s a heavy thing to carry, and you don\'t have to carry it alone. Calm space and your people are one tap away.' : '<b>' + esc(CI.w) + '</b> is real, and it will pass. It\'s your mind having a hard moment, not who you are.') : '<b>' + esc(CI.w) + '</b>. Hold on to it for a second.') + '</p>'
    + (unpleasant ? (day().mode !== 'hard' && now().getHours() < 16 ? '<button class="btn" data-a="ciHard">Make today a hard day</button><p class="small" style="margin-top:-6px">Just your minimums. Nothing else expected.</p><button class="btn soft" data-a="ciCalm">Go to Calm space</button>' : '<button class="btn" data-a="ciCalm">Go to Calm space</button>') + (hopeless >= 2 ? '<button class="btn soft" data-a="ciSafety">My safety plan</button>' : '')
      : '<div class="col" style="gap:4px;text-align:left"><label for="ciPrapti" class="serif" style="font-size:21px">What have Maharaj &amp; Swami given me today?</label><textarea id="ciPrapti" class="ruled" style="height:68px" placeholder="Write a line…" data-in="prapti">' + esc(day().prapti) + '</textarea></div>')
    + '<button class="btn ghost" data-a="ciClose">Back to Today</button></main>';
};
A.ciQ = el => { CI.q = el.dataset.k; CI.step = 1; render(); };
A.ciW = el => { CI.w = el.dataset.w; render(true); };
A.ciT = el => { const t = el.dataset.t, i = CI.tags.indexOf(t); if (i > -1) CI.tags.splice(i, 1); else CI.tags.push(t); render(true); };
A.ciOwn = () => { const v = $('#ciOwn').value.trim(); if (!v) return; CI.extraTags.push(v); CI.tags.push(v); render(true); };
INP.ciNote = el => { CI.note = el.value; };
A.ciSave = () => { if (!CI.w) return; day().checkins = (day().checkins || []).concat([{ at: new Date().toTimeString().slice(0, 5), q: CI.q, w: CI.w, tags: CI.tags, note: CI.note }]); save('days/' + TODAY); CI.step = 2; render(); setTimeout(() => { const o = $('.orb'); if (o) { const r = o.getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top + r.height / 2, 18, [QUADS[CI.q].bg, '#F6B48A', '#FFFFFF']); } }, 350); };
A.ciClose = () => { CI = null; stack = []; go('today', null, { replace: true }); };
A.ciCalm = () => { CI = null; go('calm', null, { replace: true }); };
A.ciSafety = () => { CI = null; go('safety', null, { replace: true }); };
