/* ===== feel-good effects ===== */
const PETAL_COLS = ['#F08A4B', '#C4550F', '#F6B48A', '#E9A23B', '#F2B8C6', '#FFFFFF'];
function fxLayer() { let l = $('#fx'); if (!l) { l = document.createElement('div'); l.id = 'fx'; l.className = 'fx'; l.setAttribute('aria-hidden', 'true'); document.body.appendChild(l); } return l; }
function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
function buzz() { hap(); }
function burstAt(x, y, n, cols) {
  if (reduced()) return; const l = fxLayer(); cols = cols || PETAL_COLS;
  for (let k = 0; k < (n || 12); k++) {
    const i = document.createElement('i'), a = (k / n) * Math.PI * 2 + Math.random() * .5, d = 36 + Math.random() * 54;
    i.className = 'burst-p'; i.style.left = x + 'px'; i.style.top = y + 'px'; i.style.background = cols[k % cols.length];
    i.style.setProperty('--tx', Math.cos(a) * d + 'px'); i.style.setProperty('--ty', Math.sin(a) * d + 'px'); i.style.setProperty('--r', (Math.random() * 360) + 'deg');
    l.appendChild(i); setTimeout(() => i.remove(), 950);
  }
}
function petalRain(n) {
  if (reduced()) return; const l = fxLayer(); n = n || 34;
  for (let k = 0; k < n; k++) {
    const i = document.createElement('i'), dur = 2.4 + Math.random() * 1.8;
    i.className = 'rain-p'; i.style.left = (Math.random() * 100) + 'vw'; i.style.background = PETAL_COLS[k % PETAL_COLS.length];
    i.style.setProperty('--sx', ((Math.random() - .5) * 120) + 'px'); i.style.setProperty('--r', (180 + Math.random() * 540) + 'deg');
    i.style.animationDuration = dur + 's'; i.style.animationDelay = (Math.random() * .7) + 's';
    l.appendChild(i); setTimeout(() => i.remove(), (dur + 0.8) * 1000);
  }
}
function burstEl(el, n, cols) { if (!el) return; const r = el.getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top + r.height / 2, n || 14, cols); }

/* ===== Journal hub ===== */
function journalCard() {
  const js = Object.values(S.journal || {}).filter(x => !x.deleted), today = js.filter(j => j.date === TODAY).length;
  return '<button class="card" data-a="go" data-v="journal" style="border:none;text-align:left;display:flex;flex-direction:column;gap:12px;background:#2E2019;color:#F7F1E8;padding:20px">'
    + '<span class="between" style="width:100%"><span class="row" style="gap:12px"><span class="itile sm" style="background:#6B4A8C">' + gicon('journal') + '</span><span class="eyebrow" style="color:var(--peachT)">Journal</span></span><span style="font-size:13px;color:#CDBBA8">' + (today ? today + (today === 1 ? ' entry' : ' entries') + ' today' : js.length ? js.length + ' entries so far' : 'Your own space') + '</span></span>'
    + '<span class="serif" style="font-size:clamp(24px,7vw,28px);line-height:1.15">Write anything. It\'s yours.</span>'
    + '<span class="chips">' + [['write', 'Write'], ['smruti', 'Smruti'], ['prapti', 'Prapti lines']].map(x => '<span class="chip" style="background:rgba(247,241,232,.12);color:#F7F1E8" data-a="journalTab" data-t="' + x[0] + '">' + x[1] + '</span>').join('') + '</span></button>';
}
A.journalTab = (el, e) => { e.stopPropagation(); go('journal', { tab: el.dataset.t }); };
let jDraft = '';
V.journal = p => {
  const tab = p.tab || 'write';
  const tabs = '<div class="seg" role="tablist">' + [['write', 'Journal'], ['smruti', 'Smruti'], ['prapti', 'Prapti lines']].map(x => '<button role="tab" class="' + (tab === x[0] ? 'on' : '') + '" aria-selected="' + (tab === x[0]) + '" data-a="jTab" data-t="' + x[0] + '">' + x[1] + '</button>').join('') + '</div>';
  let body = '';
  if (tab === 'write') {
    const list = Object.values(S.journal || {}).filter(x => !x.deleted).sort((a, b) => (b.date + b.at) < (a.date + a.at) ? -1 : 1);
    body = '<section class="card col" style="gap:10px"><label for="jText" class="serif" style="font-size:22px">' + dayLabel(TODAY) + '</label><textarea id="jText" class="ruled" style="height:204px;font-style:normal" placeholder="Anything on your mind…" data-in="jDraft">' + esc(jDraft) + '</textarea><button class="btn" id="jSave" data-a="jSave">Save entry</button></section>'
      + (list.length ? groupByDate(list).map(g => '<section class="col"><span class="eyebrow" style="padding:6px 0">' + shortDate(g.d) + '</span>' + g.items.map(x => '<div class="col divrow" style="gap:6px;padding:12px 0"><p class="serif" style="font-size:19px;line-height:1.4;white-space:pre-wrap">' + esc(x.text) + '</p><div class="between small"><span>' + esc(x.at) + (x.edited ? ' · edited' : '') + '</span><span class="row" style="gap:14px"><button class="link" data-a="jEdit" data-id="' + x.id + '">Edit</button><button class="link" style="color:var(--faint)" data-a="jDel" data-id="' + x.id + '">Delete</button></span></div></div>').join('') + '</section>').join('')
        : '<p class="sub">Entries you save will gather here, newest first.</p>');
  } else if (tab === 'smruti') {
    const list = Object.values(S.smruti || {}).filter(x => !x.deleted).sort((a, b) => a.date < b.date ? 1 : -1);
    body = '<p class="sub">Your darshan of Mahant Swami Maharaj: what you saw, what he said, how it felt. Any day, past or present.</p><button class="btn" data-a="smNew">+ New smruti</button>'
      + (list.length ? '<div class="col" style="gap:12px">' + list.map(x => '<button class="card col" style="border:none;text-align:left;gap:8px" data-a="smOpen" data-id="' + x.id + '"><span class="eyebrow">' + shortDate(x.date) + '</span>' + (x.title ? '<span class="serif" style="font-size:22px;line-height:1.15">' + esc(x.title) + '</span>' : '') + (x.text ? '<span class="clamp3" style="font-size:15px;line-height:1.5;color:var(--ink2)">' + esc(x.text) + '</span>' : '') + ((x.photos || []).length ? '<span class="row" style="gap:6px">' + x.photos.slice(0, 4).map(id => '<img ' + (photoSrc(id) ? 'src="' + photoSrc(id) + '"' : 'data-photo="' + id + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="') + ' alt="" style="width:64px;height:64px;border-radius:12px;object-fit:cover;background:var(--pill)">').join('') + (x.photos.length > 4 ? '<span class="small">+' + (x.photos.length - 4) + '</span>' : '') + '</span>' : '') + '</button>').join('') + '</div>'
        : '<p class="sub" style="padding-top:4px">Your smruti will gather here.</p>');
  } else {
    const list = journalEntries();
    body = '<p class="sub">Your answers to “What have Maharaj &amp; Swami given me today?”, plus your teaching reflections.</p>' + (list.length ? '<section class="col">' + list.map(jHTML).join('') + '</section>' : '<p class="sub">Your prapti lines will gather here. One line a day is plenty.</p>');
  }
  return '<main class="wrap nonav paperpage"><div class="between"><span class="pill">Journal</span>' + closeBtn() + '</div><h1 class="h1">Journal</h1>' + tabs + body + '</main>';
};
V.journal_after = () => fillPhotos();
function groupByDate(list) { const g = []; list.forEach(x => { let last = g[g.length - 1]; if (!last || last.d !== x.date) g.push(last = { d: x.date, items: [] }); last.items.push(x); }); return g; }
A.jTab = el => { route.p.tab = el.dataset.t; render(); };
INP.jDraft = el => { jDraft = el.value; };
A.jSave = el => {
  const v = jDraft.trim(); if (!v) return toast('Write something first');
  const id = 'j' + Date.now().toString(36) + uid();
  S.journal[id] = { id, date: TODAY, at: new Date().toTimeString().slice(0, 5), text: v };
  save('journal/' + id); jDraft = ''; burstEl(el, 16); buzz(); toast('Saved to your journal'); render(true);
};
A.jEdit = el => { const x = S.journal[el.dataset.id]; sheet('<div class="between"><span class="h2">Edit entry</span>' + closeBtn('closeSheet') + '</div><textarea id="jEditT" class="ruled" style="height:220px;font-style:normal">' + esc(x.text) + '</textarea><button class="btn" data-a="jEditSave" data-id="' + x.id + '">Save</button>'); };
A.jEditSave = el => { const x = S.journal[el.dataset.id], v = $('#jEditT').value.trim(); if (!v) return; x.text = v; x.edited = true; save('journal/' + x.id); closeSheet(); render(true); };
A.jDel = el => sheet('<span class="h2">Delete this entry?</span><p class="sub">It will be hidden. You can restore it from Me if you change your mind.</p><div class="row"><button class="btn" style="background:#8E2F24" data-a="jDelYes" data-id="' + el.dataset.id + '">Delete</button><button class="btn soft" data-a="closeSheet">Keep it</button></div>');
A.jDelYes = el => { removeDoc('journal/' + el.dataset.id); closeSheet(); render(true); };

/* ===== Smruti editor ===== */
let SM = null, smBusy = 0;
A.smNew = () => { SM = { id: 's' + Date.now().toString(36) + uid(), date: TODAY, title: '', text: '', photos: [], isNew: true }; go('smruti'); };
A.smOpen = el => { SM = Object.assign({}, clone(S.smruti[el.dataset.id])); go('smruti'); };
V.smruti = () => {
  if (!SM) return V.journal({ tab: 'smruti' });
  return '<main class="wrap nonav" style="gap:18px"><div class="between"><span class="pill">Smruti</span>' + closeBtn('smClose') + '</div>'
    + '<h1 class="h1" style="font-size:clamp(32px,9vw,40px)">' + (SM.isNew ? 'New smruti' : 'My smruti') + '</h1>'
    + '<div class="card col" style="gap:8px"><label for="smDate" class="eyebrow">Which day?</label><input id="smDate" type="date" max="' + TODAY + '" value="' + esc(SM.date) + '" data-in="smDate" style="height:46px;border:none;border-bottom:1px solid var(--rule);background:transparent;font-size:17px;padding:0">'
    + '<label for="smTitle" class="eyebrow" style="margin-top:8px">Where, or what was the occasion?</label><input id="smTitle" class="field" placeholder="e.g. Sabha in Leicester" value="' + esc(SM.title) + '" data-in="smTitle"></div>'
    + '<div class="card col" style="gap:6px"><label for="smText" class="eyebrow">My darshan</label><textarea id="smText" class="ruled" style="height:272px;font-style:normal" placeholder="What did you see? What did Swami say or do? How did it feel?" data-in="smText">' + esc(SM.text) + '</textarea></div>'
    + '<div class="card col" style="gap:12px"><div class="between"><span class="eyebrow">Photos</span><span class="small">' + (smBusy ? 'Adding ' + smBusy + '…' : SM.photos.length ? SM.photos.length + (SM.photos.length === 1 ? ' photo' : ' photos') : '') + '</span></div>'
    + (SM.photos.length ? '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">' + SM.photos.map((id, i) => '<div style="position:relative;aspect-ratio:1/1;border-radius:14px;overflow:hidden;background:var(--pill)"><button style="border:none;padding:0;width:100%;height:100%;background:none" data-a="smView" data-id="' + esc(id) + '" aria-label="View photo"><img ' + (photoSrc(id) ? 'src="' + photoSrc(id) + '"' : 'data-photo="' + esc(id) + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="') + ' alt="Smruti photo" style="width:100%;height:100%;object-fit:cover"></button><button class="glass" style="position:absolute;top:6px;right:6px;width:32px;height:32px;background:rgba(20,12,8,.5)" data-a="smRmPhoto" data-i="' + i + '" aria-label="Remove photo">' + I.close + '</button></div>').join('') + '</div>' : '')
    + '<label class="btn soft sm" style="align-self:flex-start;cursor:pointer">' + I.plus + ' Add photos<input type="file" accept="image/*" multiple hidden data-in="smFiles"></label></div>'
    + '<button class="btn" data-a="smSave"' + (smBusy ? ' disabled style="opacity:.5"' : '') + '>Save smruti</button>'
    + (SM.isNew ? '' : '<button class="btn ghost" style="color:var(--faint)" data-a="smDel">Delete this smruti</button>')
    + '</main>';
};
V.smruti_after = () => fillPhotos();
INP.smDate = el => { SM.date = el.value || TODAY; };
INP.smTitle = el => { SM.title = el.value; };
INP.smText = el => { SM.text = el.value; };
INP.smFiles = async el => {
  const files = [...el.files]; el.value = ''; if (!files.length) return;
  smBusy += files.length; render(true);
  for (const f of files) { try { const id = await storePhoto(f); if (id && SM) SM.photos.push(id); } catch (e) { toast(e.message || 'Couldn\'t add that photo'); } smBusy--; if (route.v === 'smruti') render(true); }
};
A.smRmPhoto = el => { SM.photos.splice(+el.dataset.i, 1); render(true); };
A.smView = el => sheet('<div class="between"><span class="eyebrow">Photo</span>' + closeBtn('closeSheet') + '</div><img src="' + (photoSrc(el.dataset.id) || '') + '" data-photo="' + esc(el.dataset.id) + '" alt="Smruti photo" style="width:100%;border-radius:18px">') || setTimeout(fillPhotos, 0);
A.smSave = el => { if (!SM) return;
  if (!SM.text.trim() && !SM.photos.length && !SM.title.trim()) return toast('Add a few words or a photo first');
  const x = { id: SM.id, date: SM.date || TODAY, title: SM.title.trim(), text: SM.text.trim(), photos: SM.photos.slice(), saved: new Date().toISOString() };
  S.smruti[x.id] = x; save('smruti/' + x.id); burstEl(el, 18); buzz(); toast('Smruti saved');
  SM = null; setTimeout(() => back('journal'), 350);
};
A.smClose = () => { SM = null; back('journal'); };
A.smDel = () => sheet('<span class="h2">Delete this smruti?</span><p class="sub">It will be hidden. You can restore it from Me if you change your mind.</p><div class="row"><button class="btn" style="background:#8E2F24" data-a="smDelYes">Delete</button><button class="btn soft" data-a="closeSheet">Keep it</button></div>');
A.smDelYes = () => { removeDoc('smruti/' + SM.id); SM = null; closeSheet(); back('journal'); };

/* ===== My darshan photos ===== */
let MD = { photo: null, quote: '', by: '', busy: false };
V.mydarshan = () => {
  const list = ownList();
  return '<main class="wrap nonav" style="gap:18px"><div class="between"><span class="pill">My darshan</span>' + closeBtn() + '</div>'
    + '<div class="col" style="gap:6px"><h1 class="h1">Add my own darshan</h1><p class="sub">Your photos appear in the Darshan feed and sometimes as your morning darshan.</p></div>'
    + '<section class="card col" style="gap:12px">'
    + (MD.photo ? '<div style="position:relative;border-radius:18px;overflow:hidden;aspect-ratio:3/4;max-height:420px;background:var(--pill)"><img src="' + photoSrc(MD.photo) + '" alt="Chosen photo" style="width:100%;height:100%;object-fit:cover"><button class="glass" style="position:absolute;top:10px;right:10px;background:rgba(20,12,8,.5)" data-a="mdClear" aria-label="Remove photo">' + I.close + '</button></div>'
      : '<label class="col" style="gap:8px;align-items:center;justify-content:center;aspect-ratio:3/4;max-height:320px;border-radius:18px;border:1.5px dashed #DCCBB8;cursor:pointer;color:var(--saT);font-weight:600">' + (MD.busy ? 'Adding…' : I.plus + '<span>Choose a photo</span>') + '<input type="file" accept="image/*" hidden data-in="mdFile"></label>')
    + '<label for="mdQuote" class="eyebrow">Quote (optional)</label><textarea id="mdQuote" class="ruled" style="height:102px" placeholder="Leave empty to pair it with a quote from the gurus" data-in="mdQuote">' + esc(MD.quote) + '</textarea>'
    + '<label for="mdBy" class="eyebrow">Who said it?</label><input id="mdBy" class="field" placeholder="e.g. Mahant Swami Maharaj" value="' + esc(MD.by) + '" data-in="mdBy">'
    + '<button class="btn" data-a="mdSave"' + (MD.photo ? '' : ' disabled style="opacity:.45"') + '>Add to my darshan</button></section>'
    + (list.length ? '<section class="col" style="gap:12px"><h2 class="h2">Added by me</h2>' + list.map(o => '<div class="card" style="padding:0;overflow:hidden;display:grid;grid-template-columns:96px 1fr"><img data-photo="' + o.photo + '" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="" style="width:96px;height:100%;min-height:120px;object-fit:cover;background:var(--pill)"><div class="col" style="gap:6px;padding:12px 14px"><p class="quote" style="font-size:17px">' + (o.quote ? '“' + esc(o.quote) + '”' : '<span class="small">Paired with a quote from the gurus</span>') + '</p><div class="between"><span class="by" style="font-size:11px">' + esc(o.by || '') + '</span><button class="link" style="color:var(--faint)" data-a="mdDel" data-id="' + o.id + '">Remove</button></div></div></div>').join('') + '</section>' : '')
    + '</main>';
};
V.mydarshan_after = () => fillPhotos();
INP.mdFile = async el => { const f = el.files[0]; el.value = ''; if (!f) return; MD.busy = true; render(true); try { MD.photo = await storePhoto(f); } catch (e) { toast(e.message || 'Couldn\'t add that photo'); } MD.busy = false; render(true); };
INP.mdQuote = el => { MD.quote = el.value; }; INP.mdBy = el => { MD.by = el.value; };
A.mdClear = () => { MD.photo = null; render(true); };
A.mdSave = el => { if (!MD.photo) return; const id = 'd' + Date.now().toString(36) + uid(); S.mydarshan[id] = { id, photo: MD.photo, quote: MD.quote.trim(), by: MD.by.trim(), added: new Date().toISOString() }; save('mydarshan/' + id); burstEl(el, 16); buzz(); toast('Added to your darshan'); MD = { photo: null, quote: '', by: '', busy: false }; render(true); };
A.mdDel = el => { S.saved.darshan = S.saved.darshan.filter(k => k !== 'own|' + el.dataset.id); save('saved'); removeDoc('mydarshan/' + el.dataset.id); render(true); };

/* ===== Mood history (Me) ===== */
function moodSection() {
  const days = Array.from({ length: 14 }, (_, i) => addDays(TODAY, i - 13));
  const all = []; Object.keys(S.days).sort().reverse().forEach(d => (S.days[d].checkins || []).slice().reverse().forEach(c => all.push(Object.assign({ d }, c))));
  const strip = days.map(d => { const cs = (S.days[d] || {}).checkins || []; const last = cs[cs.length - 1];
    return '<div class="col" style="align-items:center;gap:4px"><span style="width:22px;height:22px;border-radius:11px;' + (last ? 'background:' + QUADS[last.q].bg : 'background:var(--line)') + '"></span><span style="font-size:10px;color:var(--faint)">' + parse(d).getDate() + '</span></div>'; }).join('');
  return '<section class="card col" style="gap:14px"><div class="between"><span class="serif" style="font-size:22px">How I\'ve been feeling</span><span class="small">Last 14 days</span></div>'
    + '<div style="display:grid;grid-template-columns:repeat(14,minmax(0,1fr));gap:2px">' + strip + '</div>'
    + '<div class="chips" style="gap:10px">' + Object.keys(QUADS).map(k => '<span class="small row" style="gap:5px"><span style="width:10px;height:10px;border-radius:5px;background:' + QUADS[k].bg + '"></span>' + moodName(k) + '</span>').join('') + '</div>'
    + (all.length ? '<div class="col">' + all.slice(0, 6).map(c => '<div class="row divrow" style="gap:12px;padding:10px 0;align-items:flex-start"><span style="width:12px;height:12px;border-radius:6px;margin-top:5px;flex-shrink:0;background:' + QUADS[c.q].bg + '"></span><span class="col" style="gap:2px;min-width:0"><span style="font-weight:600">' + esc(c.w) + ' <span class="small" style="font-weight:400">· ' + shortDate(c.d).replace(/^\w+ /, '') + ', ' + esc(c.at) + '</span></span>' + ((c.tags || []).length ? '<span class="small">' + esc(c.tags.join(' · ')) + '</span>' : '') + (c.note ? '<span style="font-size:14px;color:var(--ink2)">' + esc(c.note) + '</span>' : '') + '</span></div>').join('') + '</div>'
      : '<p class="sub">Check in whenever you like. Patterns appear after a week or two.</p>')
    + '<button class="btn soft sm" style="align-self:flex-start" data-a="go" data-v="checkin">Check in now</button></section>';
}
