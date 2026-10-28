/* ===== Weekly check-in (PHQ-9) ===== */
const PHQ = ['Little interest or pleasure in doing things', 'Feeling down, depressed, or hopeless', 'Trouble falling or staying asleep, or sleeping too much', 'Feeling tired or having little energy', 'Poor appetite or overeating', 'Feeling bad about yourself, or that you are a failure or have let yourself or your family down', 'Trouble concentrating on things, such as reading the newspaper or watching television', 'Moving or speaking so slowly that other people could have noticed; or the opposite, being so fidgety or restless that you have been moving around a lot more than usual', 'Thoughts that you would be better off dead or of hurting yourself in some way'];
const PHQA = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
let WK = null;
function trendSVG(dark) {
  const ks = Object.keys(S.weekly).sort().slice(-10), pts = ks.map(k => S.weekly[k].score);
  if (!pts.length) return '';
  const W = 310, H = 90, x = i => pts.length === 1 ? W / 2 : 14 + i * (W - 28) / (pts.length - 1), y = v => 10 + (v / 27) * (H - 20);
  const col = dark ? '#F08A4B' : '#C4550F';
  return '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Weekly check-in totals, lower is lighter: ' + pts.join(', ') + '"><line x1="0" x2="' + W + '" y1="' + (H - 10) + '" y2="' + (H - 10) + '" stroke="' + (dark ? 'rgba(247,241,232,.15)' : '#EDE2D3') + '"/>'
    + (pts.length > 1 ? '<polyline points="' + pts.map((v, i) => x(i) + ',' + y(v)).join(' ') + '" fill="none" stroke="' + col + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' : '')
    + pts.map((v, i) => '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="' + (i === pts.length - 1 ? 5 : 3.5) + '" fill="' + col + '"/>').join('') + '</svg>';
}
V.weekly = () => {
  if (!WK) WK = { s: 0, a: [] };
  const s = WK.s, top = '<div class="between"><div class="dots">' + Array.from({ length: 11 }, (_, k) => '<span class="' + (k === s ? 'on' : k < s ? 'past' : '') + '"></span>').join('') + '</div>' + closeBtn('wkClose') + '</div>';
  if (s === 0) return '<main class="stage">' + top + '<div class="grow1 fade"><span class="eyebrow">Weekly check-in</span><h1 class="h1">Nine quick questions about the past two weeks.</h1><p class="sub" style="font-size:16px">There are no right answers; this just shows how things are moving. About 2 minutes.</p></div><button class="btn" data-a="wkNext">Begin</button><button class="btn ghost" data-a="wkClose">Not this week</button></main>';
  if (s >= 1 && s <= 9) {
    const i = s - 1;
    return '<main class="stage">' + top + '<div class="grow1 fade" style="justify-content:flex-start;padding-top:6px"><span class="small">Over the last 2 weeks, how often have you been bothered by…</span><h2 class="h1" style="font-size:clamp(28px,8vw,34px);line-height:1.1">' + PHQ[i] + '</h2>'
      + '<div class="col" style="gap:10px">' + PHQA.map((t, v) => '<button class="opt' + (WK.a[i] === v ? ' on' : '') + '" data-a="wkAns" data-v="' + v + '">' + t + '</button>').join('') + '</div></div>'
      + '<div class="navbtns"><button class="back" data-a="wkBack" aria-label="Back">' + I.back + '</button><span class="small" style="align-self:center">' + s + ' of 9</span></div></main>';
  }
  if (s === 10 && WK.support) return '<main class="stage">' + top + '<div class="grow1 fade"><h1 class="h1" style="font-size:clamp(30px,8.6vw,38px)">Thank you for being honest.</h1><p class="sub" style="font-size:17px;line-height:1.55">That\'s a heavy thing to carry, and you don\'t have to carry it alone. Please let someone know today.</p>'
    + '<div class="col" style="gap:10px"><button class="btn" data-a="go" data-v="safety">Open my safety plan</button>'
    + (S.safety.people[0] ? '<a class="btn soft" href="tel:' + esc(S.safety.people[0].phone.replace(/\s/g, '')) + '">Call ' + esc(S.safety.people[0].name) + ' · ' + esc(S.safety.people[0].phone) + '</a>' : '<button class="btn soft" data-a="go" data-v="safety">Add someone I trust</button>')
    + '<div class="card" style="font-size:15px;line-height:1.5">Tell your rTMS team or GP. The rTMS team will want to know about this during treatment.</div></div></div><button class="btn ghost" data-a="wkSeen">See my check-in</button></main>';
  const ks = Object.keys(S.weekly).sort();
  return '<main class="stage">' + '<div class="between"><span class="pill">Weekly check-in</span>' + closeBtn('wkClose') + '</div><div class="grow1 fade" style="justify-content:flex-start"><h1 class="h1">Done. Thank you.</h1>'
    + '<div class="darkcard col" style="gap:12px"><span class="serif" style="font-size:22px">Your line</span>' + trendSVG(true) + '<span style="font-size:13px;color:#CDBBA8">Up means lighter. The direction over a few weeks matters more than any single week.' + (ks.length < 2 ? ' Your line grows each week.' : '') + '</span></div>'
    + '<button class="btn soft" data-a="wkShare">Share with my clinic</button></div><button class="btn" data-a="wkClose">Back to Today</button></main>';
};
A.wkNext = () => { WK.s++; render(); };
A.wkBack = () => { WK.s = Math.max(0, WK.s - 1); render(); };
A.wkAns = el => {
  const i = WK.s - 1; WK.a[i] = +el.dataset.v; render(true);
  setTimeout(() => {
    if (WK.s < 9) { WK.s++; render(); return; }
    const score = WK.a.reduce((a, b) => a + (b || 0), 0);
    S.weekly[TODAY] = { date: TODAY, answers: WK.a.slice(), score }; save('weekly/' + TODAY);
    WK.support = WK.a[8] > 0; WK.s = 10; render();
  }, 260);
};
A.wkSeen = () => { WK.support = false; render(); };
A.wkClose = () => { WK = null; stack = []; go('today', null, { replace: true }); };
A.wkShare = () => { const ks = Object.keys(S.weekly).sort(); copy('PHQ-9 weekly totals\n' + ks.map(k => shortDate(k) + ': ' + S.weekly[k].score + ' / 27').join('\n')); };

/* ===== Me ===== */
function showedUp(d) { const x = S.days[d]; if (!x) return false; return x.begun || Object.values(x.done || {}).some(Boolean) || (x.checkins || []).length > 0; }
V.me = () => {
  const ws = weekStart(TODAY), days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  const n = days.filter(showedUp).length;
  const strip = days.map((d, i) => { const x = S.days[d] || {}, sab = x.done && x.done.sabha, up = showedUp(d), fut = d > TODAY;
    return '<div class="col" style="align-items:center;gap:6px"><span style="font-size:12px;font-weight:600;color:' + (d === TODAY ? 'var(--saT)' : 'var(--faint)') + '">' + 'MTWTFSS'[i] + '</span><span class="' + (up || sab ? 'wkdot' : '') + '" style="animation-delay:' + (i * 70) + 'ms;width:32px;height:32px;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;' + (sab ? 'background:var(--sa)' : up ? 'background:var(--peach)' : fut ? 'border:1.5px dashed #DCCBB8' : 'background:var(--line)') + '">' + (sab ? monoLotus(18) : '') + '</span></div>'; }).join('');
  const journal = journalEntries().slice(0, 3);
  const wks = Object.keys(S.weekly).sort();
  const row = (t, s, a, v) => '<button class="setrow" data-a="' + a + '"' + (v ? ' data-v="' + v + '"' : '') + '><span class="col" style="gap:2px"><span style="font-size:16px;font-weight:600">' + t + '</span><span class="small">' + s + '</span></span>' + I.right + '</button>';
  return '<main class="wrap">'
    + skyHead('<div class="between" style="align-items:center"><div class="col" style="gap:8px"><h1 class="hello">Me</h1><p class="skysub">What you\'ve done, not what you\'ve missed.</p></div>' + avatarHTML() + '</div>')
    + adminEntry()
    + '<section class="card col" style="gap:14px"><div class="between"><span class="serif" style="font-size:22px">This week</span><span class="small">' + (n ? n + (n === 1 ? ' day' : ' days') + ' you showed up' : 'A fresh week') + '</span></div><div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px">' + strip + '</div><span class="small">The lotus marks sabha.</span></section>'
    + weeksCard()
    + '<button class="darkcard col" data-a="go" data-v="weekly" style="border:none;text-align:left;gap:12px"><div class="between" style="width:100%"><span class="serif" style="font-size:22px">Weekly check-in</span><span style="font-size:13px;color:var(--peachT)">' + (wks.length && wks[wks.length - 1] >= ws ? 'Done this week' : 'Due Sunday') + '</span></div>'
    + (wks.length ? trendSVG(true) + '<span style="font-size:13px;color:#CDBBA8">Up means lighter.</span>' : '<span style="font-size:14px;color:#CDBBA8">Nine quick questions, once a week. Your line appears here.</span>') + '</button>'
    + feelingsSection()
    + allTimeCard()
    + insightsCard()
    + sleepMini()
    + myAppSection()
    + '<section class="col"><h2 class="h2" style="margin-bottom:4px">My day</h2>'
    + row('My daily tasks', S.settings.tasks.length ? esc(S.settings.tasks.map(t => t.t).slice(0, 3).join(' · ')) + (S.settings.tasks.length > 3 ? ' …' : '') : 'None yet', 'go', 'setup')
    + row('Reminders', pushState() === 'granted' ? 'On' : 'Off · tap to set up', 'remOpen')
    + row('Sleep', sleepSummary(), 'go', 'sleep')
    + row('Sabha time', S.settings.sabhaTime ? 'Saturdays at ' + mins(toMins(S.settings.sabhaTime)) : 'Set it for your Saturday reminder', 'sabhaPick')
    + '</section>'
    + '<section class="col"><h2 class="h2" style="margin-bottom:4px">My space</h2>'
    + row('My safety plan', S.safety.people.length ? S.safety.people.length + (S.safety.people.length === 1 ? ' person' : ' people') + ' and your steps' : 'Fill it in on a good day', 'go', 'safety')
    + row('My darshan photos', ownList().length ? ownList().length + ' added' : 'Add your own photos and quotes', 'go', 'mydarshan')
    + row('Saved darshan', S.saved.darshan.length ? S.saved.darshan.length + ' saved' : 'Tap the heart in Darshan', 'go', 'saved')
    + ((!OWNER || viewOnly()) && notesList().filter(noteLive).length ? row('Notes', notesList().filter(noteLive).length + (notesList().filter(noteLive).length === 1 ? ' note' : ' notes'), 'go', 'notes') : '')
    + row('Health report', 'A PDF for your GP or clinic', 'go', 'report')
    + (deletedItems().length ? row('Recently deleted', deletedItems().length + ' you can restore', 'go', 'trash') : '')
    + '</section>'
    + '<section class="col"><h2 class="h2" style="margin-bottom:4px">App</h2>'
    + row('Appearance', ({ auto: 'Automatic', light: 'Light', dark: 'Dark' })[S.settings.theme || 'auto'], 'themePick')
    + '<div class="setrow" style="cursor:default"><span class="col" style="gap:2px"><span style="font-size:16px;font-weight:600">' + (!navigator.onLine ? 'Offline · saving on this phone' : dirty.size ? 'Saving…' : 'Saved to the cloud ✓') + '</span><span class="small">' + (!navigator.onLine ? 'Everything will upload when you\'re back online.' : dirty.size ? dirty.size + ' change' + (dirty.size === 1 ? '' : 's') + ' waiting to upload' + (lastErr ? ' (' + esc(lastErr) + ')' : '') : 'Everything you add is saved as you go.') + '</span></span></div>'
    + row('Backups', 'Saved every night · keep a copy in Google Drive', 'bkSheet')
    + row('What\'s new', 'Version ' + APP_VERSION + (S.settings.seenVer !== CHANGELOG[0].v ? ' · new' : ''), 'go', 'whatsnew')
    + (OWNER && !viewOnly() ? '' : row('Send feedback', 'An idea, or something not working', 'fbNew'))
    + row('Something not working?', 'Copy a report if something breaks', 'diag')
    + row('Sign out', USER ? esc(USER.email) : '', 'signOut')
    + '</section>'
    + '<div class="madeby"><span class="mbicon">' + iconLotus(false) + '</span><span class="mbword">' + WORDMARK + '</span><span style="color:var(--sa);margin-top:4px">' + I.heart(true) + '</span><span class="serif" style="font-size:19px;line-height:1.3;color:var(--ink2)">Made for Chhaya, with love, by Tilak</span><span class="small">2026</span></div>'
    + '</main>';
};
A.go = el => { if (el.dataset.v === 'setup') { setupSel = null; return go('setup', {}); } go(el.dataset.v, el.dataset.p ? JSON.parse(el.dataset.p) : null); };
function journalEntries() {
  const out = [];
  Object.keys(S.days).sort().reverse().forEach(d => { const x = S.days[d]; if (x.prapti && x.prapti.trim()) out.push({ d, t: x.prapti.trim() }); (x.notes || []).forEach(n => out.push({ d, t: n.a, q: n.q })); });
  return out;
}
const jHTML = e => '<div class="col divrow" style="gap:4px;padding:14px 0"><span class="eyebrow">' + shortDate(e.d) + (e.q ? ' · Reflection' : '') + '</span>' + (e.q ? '<span class="small">' + esc(e.q) + '</span>' : '') + '<span class="serif it" style="font-size:20px;line-height:1.3">' + esc(e.t) + '</span></div>';
V.saved = () => {
  const items = S.saved.darshan.map(k => { const [m, ti] = k.split('|'); const v = m === 'own' ? (S.mydarshan[ti] ? pairView({ own: ti, ti: 0 }) : null) : (C.thoughts[+ti] ? pairView({ m, ti: +ti }) : null); return v && Object.assign(v, { k }); }).filter(Boolean);
  return '<main class="wrap nonav"><div class="between"><span class="pill">Saved</span>' + closeBtn() + '</div><h1 class="h1">Saved darshan</h1>'
    + (items.length ? '<div class="col" style="gap:14px">' + items.map(x => '<div class="card" style="padding:0;overflow:hidden;display:grid;grid-template-columns:110px 1fr"><button style="border:none;padding:0;background:none" data-a="savedOpen" data-k="' + x.k + '" aria-label="Open in darshan">' + imgTag(x, '', 'style="width:110px;height:100%;min-height:140px;object-fit:cover"') + '</button><div class="col" style="gap:8px;padding:14px"><p class="quote" style="font-size:17px">“' + esc(x.t) + '”</p><div class="between"><span class="by" style="font-size:11px">' + esc(x.by) + '</span><button class="link" data-a="unsave" data-k="' + x.k + '">Remove</button></div></div></div>').join('') + '</div>'
      : '<p class="sub">Tap the heart on any darshan to keep it here.</p><button class="btn" data-a="goFeed">Open Darshan</button>') + '</main>';
};
A.unsave = el => { S.saved.darshan = S.saved.darshan.filter(k => k !== el.dataset.k); save('saved'); render(true); };
A.savedOpen = el => { const [m, ti] = el.dataset.k.split('|'); go('feed', { start: m === 'own' ? { own: ti, ti: 0 } : { m, ti: +ti } }); };
V.saved_after = () => fillPhotos();

/* ===== Backup + recently deleted ===== */
function backupData() { return JSON.stringify({ app: 'Prapti', exported: new Date().toISOString(), version: APP_VER, data: S }, null, 1); }
A.backupDl = async () => {
  const name = 'prapti-backup-' + TODAY + '.json', data = backupData();
  try { const file = new File([data], name, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Prapti backup' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
};
function deletedItems() { const out = []; ['journal', 'smruti', 'mydarshan'].forEach(c => Object.values(S[c] || {}).forEach(x => { if (x && x.deleted) out.push({ c, x }); })); return out.sort((a, b) => (b.x.deletedAt || '') < (a.x.deletedAt || '') ? -1 : 1); }
V.trash = () => '<main class="wrap nonav"><div class="between"><span class="pill">Recently deleted</span>' + closeBtn() + '</div><h1 class="h1">Recently deleted</h1><p class="sub">Nothing is ever lost. Tap Restore to bring something back.</p>'
  + (deletedItems().length ? deletedItems().map(({ c, x }) => '<div class="card col" style="gap:8px"><span class="eyebrow">' + ({ journal: 'Journal', smruti: 'Smruti', mydarshan: 'My darshan' })[c] + ' · ' + shortDate(x.date || (x.added || '').slice(0, 10) || TODAY) + '</span><span class="clamp3" style="font-size:15px">' + esc(x.text || x.title || x.quote || 'Photo') + '</span><button class="link" style="align-self:flex-start" data-a="restore" data-k="' + c + '/' + x.id + '">Restore</button></div>').join('') : '<p class="sub">Nothing here.</p>') + '</main>';
A.restore = el => { const x = getData(el.dataset.k); if (!x) return; x.deleted = false; x.deletedAt = ''; x.restored = new Date().toISOString(); save(el.dataset.k); toast('Restored'); render(true); };

A.diag = () => { let L = []; try { L = JSON.parse(localStorage.getItem('prapti-log') || '[]'); } catch (e) {}
  const rep = 'Prapti v' + APP_VER + ' · user: ' + (USER ? USER.email : '-') + ' · online: ' + navigator.onLine + ' · ready: ' + ready + ' · unsaved: ' + dirty.size + ' · standalone: ' + (window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches) + '\n' + navigator.userAgent + '\n\n' + (L.slice(-15).map(e => e.at.slice(5, 16) + ' ' + e.kind + ' ' + e.detail).join('\n') || 'No errors recorded.');
  sheet('<div class="between"><span class="h2">Problem report</span>' + closeBtn('closeSheet') + '</div><p class="sub">Copy this and send it on.</p><textarea readonly style="width:100%;height:220px;border:none;border-radius:16px;background:var(--card);padding:14px;font-size:12px;font-family:ui-monospace,monospace">' + esc(rep) + '</textarea><button class="btn" data-a="diagCopy">Copy report</button>'); window.__rep = rep; };
A.diagCopy = () => copy(window.__rep || '');

/* ===== Safety plan ===== */
V.safety = () => {
  const F = S.safety, fld = (k, label, hint, ph) => '<div class="card col" style="gap:6px"><label for="sp_' + k + '" class="eyebrow">' + label + '</label><span class="small">' + hint + '</span><textarea id="sp_' + k + '" rows="3" data-in="sp" data-k="' + k + '" placeholder="' + ph + '" style="width:100%;min-height:80px;border:none;background:transparent;font-family:var(--serif);font-size:19px;line-height:1.4;resize:vertical;padding:0">' + esc(F[k]) + '</textarea></div>';
  return '<main class="wrap nonav" style="gap:14px"><div class="between"><span class="pill">Safety plan</span>' + closeBtn() + '</div>'
    + '<h1 class="h1" style="margin-top:6px">My safety plan</h1><p class="sub" style="margin-bottom:6px">Filled in by you, on a good day, for a hard one.</p>'
    + fld('signs', 'Signs a hard time is starting', 'What you notice first', 'e.g. staying in bed, stopping puja…')
    + fld('helps', 'Things that help me', 'Small things you can do alone', 'e.g. the mantra, a walk, darshan…')
    + fld('reasons', 'Reasons to hold on', 'People, places, words from the gurus', 'e.g. “Never Worry, We Have God!”')
    + '<div class="card col" style="gap:10px"><span class="eyebrow">People I can reach</span>'
    + F.people.map((p, i) => '<div class="between" style="min-height:52px"><span class="col"><span style="font-size:16px;font-weight:600">' + esc(p.name) + '</span><span class="small" style="user-select:all">' + esc(p.phone) + (i === 0 ? ' · shown in Calm space' : '') + '</span></span><span class="row" style="gap:6px"><button class="iconbtn" style="background:transparent;color:var(--hint)" data-a="spRm" data-i="' + i + '" aria-label="Remove ' + esc(p.name) + '">' + I.close + '</button><a class="iconbtn" style="background:var(--sa);color:#fff" href="tel:' + esc(p.phone.replace(/\s/g, '')) + '" aria-label="Call ' + esc(p.name) + '">' + I.phone + '</a></span></div>').join('')
    + '<div class="col" style="gap:8px;padding-top:6px;border-top:1px solid var(--line)"><input id="spName" class="field" style="font-size:18px" placeholder="Name" aria-label="Name"><input id="spPhone" class="field" style="font-size:18px" type="tel" placeholder="Phone number" aria-label="Phone number" data-enter="spAdd"><button class="link" style="align-self:flex-start;height:36px" data-a="spAdd">+ Add someone</button></div></div>'
    + fld('urgent', 'Urgent help', 'Who or where you\'d go if you couldn\'t keep yourself safe', 'Add this on a good day')
    + '</main>';
};
INP.sp = el => { S.safety[el.dataset.k] = el.value; save('safety'); };
A.spAdd = () => { const n = $('#spName').value.trim(), p = $('#spPhone').value.trim(); if (!n || !p) return toast('Add a name and number'); S.safety.people.push({ name: n, phone: p }); save('safety'); render(true); };
A.spRm = el => { S.safety.people.splice(+el.dataset.i, 1); save('safety'); render(true); };

/* ===== boot ===== */
function boot() {
  let last = null; try { last = localStorage.getItem('prapti-lastOpen'); } catch (e) {}
  welcome = last && last < addDays(TODAY, -1) ? 'Welcome back. No catching up needed; just today.' : null;
  try { localStorage.setItem('prapti-lastOpen', TODAY); } catch (e) {}
  stack = []; applyTheme();
  const h = now().getHours();
  if (viewOnly()) { route = null; go('today', null, { replace: true }); return; }
  if (((h === 1 && now().getMinutes() >= 30) || (h >= 2 && h < 5)) && nightDismissed !== TODAY) { route = null; go('night', null, { replace: true }); }
  else if (!day().begun) { route = null; go('darshan', null, { replace: true }); }
  else if (!S.settings.setupDone) go('setup', { first: true }, { replace: true });
  else go('today', null, { replace: true });
}
let nightDismissed = '';
async function start() {
  applyTheme();
  let session = null;
  try { const { data } = await sb.auth.getSession(); session = data.session; } catch (e) {}
  if (!session) { route = null; go('login', null, { replace: true }); return; }
  if (RECOVERY) { USER = session.user; OWNER = isOwnerEmail(USER.email); route = null; go('newpw', null, { replace: true }); return; }
  signedIn(session.user);
}
function signedIn(u) {
  USER = u; OWNER = isOwnerEmail(u.email);
  if (OWNER && !OMODE) { try { ['prapti-state-v1', 'prapti-bases-v1', 'prapti-dirty-v1'].forEach(k => localStorage.removeItem(k)); localStorage.setItem('prapti-owner-mode', 'sandbox'); } catch (e) {} location.reload(); return; }
  boot(); startSync();
}
A.signOut = () => sheet('<span class="h2">Sign out?</span><p class="sub">Your entries stay safe in the cloud. You\'ll need your password to sign back in.</p><div class="row"><button class="btn" data-a="signOutYes">Sign out</button><button class="btn soft" data-a="closeSheet">Stay</button></div>');
A.signOutYes = async () => { window.scrollTo(0, 0); closeSheet(); await flush(); await sb.auth.signOut(); try { localStorage.removeItem(LS); localStorage.removeItem(LSB); localStorage.removeItem(LSD); } catch (e) {} location.reload(); };
start();
