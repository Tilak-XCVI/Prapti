/* ===== Prapti ===== */
const C = __CONTENT__;
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const now = () => new Date();
const appDay = () => { const d = new Date(); if (d.getHours() < 4) d.setDate(d.getDate() - 1); return ymd(d); }; // local clock, so clock changes don't move the 4am boundary
let TODAY = appDay();
const dow = s => parse(s).getDay(); // 0 Sun
const weekStart = s => addDays(s, -((dow(s) + 6) % 7)); // Monday
const dayLabel = s => { const d = parse(s); return d.toLocaleDateString('en-GB', { weekday: 'long' }) + ' · ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }); };
const shortDate = s => parse(s).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const dayNum = s => { const [y, m, d] = s.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
const RTMS_START = '2026-10-19';
const uid = () => Math.random().toString(36).slice(2, 9);
const IMG = id => 'm/' + id + '.jpg';

/* ---------- icons ---------- */
/* the app's lotus, drawn in the current text colour (outer petals softer) */
function monoLotus(sz) {
  const angs = [-56, -28, 0, 28, 56], order = [0, 4, 1, 3, 2]; let p = '';
  order.forEach(i => { const a = Math.abs(angs[i]), L = 62 - a * .16, W = 15 + a * .03, op = a > 40 ? .5 : a > 20 ? .75 : 1;
    p += '<path transform="rotate(' + angs[i] + ' 60 92)" opacity="' + op + '" d="M60 92 C ' + (60 - W) + ' ' + (92 - L * .42) + ', ' + (60 - W * .6) + ' ' + (92 - L * .86) + ', 60 ' + (92 - L) + ' C ' + (60 + W * .6) + ' ' + (92 - L * .86) + ', ' + (60 + W) + ' ' + (92 - L * .42) + ', 60 92 Z"/>'; });
  return '<svg width="' + sz + '" height="' + sz + '" viewBox="0 18 120 84" fill="currentColor" aria-hidden="true">' + p + '</svg>';
}
const I = {
  today: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  darshan: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V10a6 6 0 0 1 12 0v11z"/></svg>',
  grow: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V11"/><path d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M12 14c0-3-2-5-6-5 0 3 2 5 6 5z"/></svg>',
  me: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
  lotus: monoLotus(28),
  close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  tick: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B3A393" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  plus: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  heart: f => '<svg width="22" height="22" viewBox="0 0 24 24" fill="' + (f ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  up: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',
  down: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  play: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>',
  phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  undo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-2"/></svg>',
  share: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  ext: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
};
const G_ICON = {
  motivation: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  lowmood: '<path d="M7 16a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1A4 4 0 0 1 17 16z"/><path d="M9 19v1M12 19v2M15 19v1"/>',
  anxiety: '<path d="M3 12h4l2-5 3 10 2-6 2 3h5"/>',
  overthinking: '<circle cx="12" cy="12" r="8"/><path d="M12 8a4 4 0 1 0 4 4"/><path d="M12 12h.01"/>',
  sleep: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  job: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  rtms: '<path d="M12 4c-4 0-7 3-7 7 0 2 1 4 3 5v4h8v-4c2-1 3-3 3-5 0-4-3-7-7-7z"/><path d="M10 11h4M12 9v4"/>',
  satsang: '<path d="M12 20c-4 0-8-3-8-7 3 0 6 1 8 4 2-3 5-4 8-4 0 4-4 7-8 7z"/><path d="M12 17c-2-2-3-5-3-8 1 0 2 1 3 2 1-1 2-2 3-2 0 3-1 6-3 8z"/>',
};
const gicon = k => '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + G_ICON[k] + '</svg>';

/* ---------- state + storage: Supabase, with an offline queue and 3-way field merge ---------- */
const SB_URL = 'https://pfltodlzcflxqgniznag.supabase.co', SB_KEY = 'sb_publishable_tjEF35iES5TJ0MUNgL_sYw_C9A5C4Xm';
// The owner account is recognised by a short fingerprint of its email, so no address appears in this public code.
const OWNER_HASH = 'cd785d5a';
const emailHash = e => { let x = 2166136261; for (const c of String(e || '').toLowerCase()) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return (x >>> 0).toString(16); };
const isOwnerEmail = e => emailHash(e) === OWNER_HASH;
const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'prapti-auth' } });
const APP_VER = 10;
/* Tilak's account has two modes: his own test space ('sandbox', saved separately) or Chhaya's app, view only ('hers') */
const OMODE = (() => { try { return localStorage.getItem('prapti-owner-mode') || ''; } catch (e) { return ''; } })();
const SFX = (OMODE ? '-' + OMODE : '') + (BUILD === 'beta' ? '-beta' : '');
const LS = 'prapti-state-v1' + SFX, LSB = 'prapti-bases-v1' + SFX, LSD = 'prapti-dirty-v1' + SFX;
const SHARED = ['notes', 'feedback'];
function SANDBOX() { return !!OWNER && OMODE !== 'hers'; }
const DEFAULT_MINIMUMS = ['Mala for 1 minute', 'Take supplements', 'Open the curtains', 'Drink a glass of water'];
const DEF = () => ({
  settings: { tasks: [], setupDone: false, sleep: null, trusted: '', library: [], extraLib: [], minimums: DEFAULT_MINIMUMS.slice(), theme: 'auto', sabhaTime: '' },
  rtms: { sessions: [], total: null, checks: {}, questions: ['How many sessions will I have?', 'What happens if I miss one?', 'Who do I call if I feel worse?'], notes: [], schedule: {}, start: '2026-10-19' },
  safety: { signs: '', helps: '', reasons: '', urgent: '', people: [] },
  saved: { darshan: [] },
  media: { items: [] },
  job: { weeks: {} },
  days: {}, weekly: {}, journal: {}, smruti: {}, mydarshan: {}, notes: {}, feedback: {},
});
const DAYDEF = d => ({ date: d, done: {}, extras: [], mode: 'steady', prapti: '', checkins: [], notes: [], begun: false, calm: [] });
let S = DEF(), B = {};
try { const raw = localStorage.getItem(LS); if (raw) S = Object.assign(DEF(), JSON.parse(raw)); } catch (e) {}
try { const rb = localStorage.getItem(LSB); if (rb) B = JSON.parse(rb) || {}; } catch (e) {}
const APPDOCS = ['settings', 'rtms', 'safety', 'saved', 'job', 'media'];
const COLS = ['days', 'weekly', 'journal', 'smruti', 'mydarshan', 'notes', 'feedback'];
const ENTRY_COLS = ['journal', 'smruti', 'mydarshan', 'notes'];
let USER = null, OWNER = false, ready = false, online = navigator.onLine, flushT = null, flushing = false, lastErr = '';
let dirty = new Set((() => { try { return JSON.parse(localStorage.getItem(LSD) || '[]'); } catch (e) { return []; } })());
const J = v => JSON.stringify(v === undefined ? null : v);
const clone = o => JSON.parse(JSON.stringify(o));
let freshStart = false;
function cacheLocal() { if (freshStart) return; try { localStorage.setItem(LS, JSON.stringify(S)); localStorage.setItem(LSB, JSON.stringify(B)); localStorage.setItem(LSD, JSON.stringify([...dirty])); } catch (e) {} }
function day(d) { d = d || TODAY; if (!S.days[d]) S.days[d] = DAYDEF(d); return S.days[d]; }
function split(key) { return key.includes('/') ? key.split('/') : ['app', key]; }
function rowId(key) { const [c, id] = split(key); return (SANDBOX() && !SHARED.includes(c) ? 'sandbox/' : '') + c + '/' + id; }
function getData(key) { const [c, id] = split(key); return c === 'app' ? S[id] : (S[c] || {})[id]; }
function setData(key, v) { const [c, id] = split(key); if (c === 'app') S[id] = v; else { S[c] = S[c] || {}; if (v === undefined) delete S[c][id]; else S[c][id] = v; } }
function fieldsJ(o) { const r = {}; Object.keys(o || {}).forEach(f => r[f] = J(o[f])); return r; }
function setSaveState() {}
function viewOnly() { return !!OWNER && OMODE === 'hers'; }
function save(key) { if (viewOnly() && !/^(notes|feedback)\//.test(String(key))) return; dirty.add(key); cacheLocal(); clearTimeout(flushT); flushT = setTimeout(flush, 500); }
async function flush() {
  if (freshStart) return;
  if (viewOnly()) [...dirty].forEach(k => { if (!/^(notes|feedback)\//.test(k)) dirty.delete(k); });
  if (!USER || !ready || flushing || !dirty.size) return;
  if (!navigator.onLine) { online = false; return; }
  flushing = true;
  const keys = [...dirty];
  const rows = [];
  keys.forEach(k => { const d = getData(k); if (d) rows.push({ id: rowId(k), col: SANDBOX() && !SHARED.includes(split(k)[0]) ? 'sandbox' : split(k)[0], data: clone(d), _k: k }); else dirty.delete(k); });
  try {
    for (let i = 0; i < rows.length; i += 40) {
      const chunk = rows.slice(i, i + 40);
      const { error } = await sb.from('docs').upsert(chunk.map(r => ({ id: r.id, col: r.col, data: r.data })));
      if (error) throw error;
      chunk.forEach(r => { if (J(getData(r._k)) === J(r.data)) dirty.delete(r._k); B[r._k] = fieldsJ(r.data); }); // edited during upload: stays queued
    }
    lastErr = ''; failCount = 0;
  } catch (e) {
    lastErr = (e && (e.message || e.code)) || 'network';
    logErr('save', lastErr);
    failCount++; clearTimeout(flushT); flushT = setTimeout(flush, Math.min(60000, 2000 * Math.pow(1.7, failCount)));
  } finally { flushing = false; cacheLocal(); if (dirty.size && !lastErr) { clearTimeout(flushT); flushT = setTimeout(flush, 300); } }
}
let failCount = 0;
function removeDoc(key) { const d = getData(key); if (!d) return; d.deleted = true; d.deletedAt = new Date().toISOString(); save(key); }
/* merge one remote document into local state */
function applyRemote(key, remote, defs) {
  const local = getData(key), b = B[key];
  let merged = Object.assign(defs ? defs() : {}, clone(remote));
  if (local && b && !viewOnly()) {
    Object.keys(local).forEach(f => { if (J(local[f]) !== (b[f] === undefined ? J(undefined) : b[f])) { merged[f] = local[f]; dirty.add(key); } });
  } else if (local && !b && dirty.has(key)) {
    Object.keys(local).forEach(f => { if (!(f in remote)) merged[f] = local[f]; });
  }
  setData(key, merged); B[key] = fieldsJ(remote);
}
function keyFromRow(row) { const [c, ...rest] = row.id.split('/'); const id = rest.join('/'); return c === 'app' ? id : c + '/' + id; }
function applyRow(row) {
  if (OWNER) {
    if (SANDBOX()) { if (row.col === 'sandbox') { const id = row.id.slice(8); row = { id, col: id.split('/')[0], data: row.data }; } else if (!SHARED.includes(row.col)) return; }
    else if (row.col === 'sandbox') return;
  }
  const k = keyFromRow(row), c = split(k)[0];
  if (c === 'app' && !APPDOCS.includes(k)) return;
  if (c !== 'app' && !COLS.includes(c)) return;
  applyRemote(k, row.data || {}, c === 'app' ? () => DEF()[k] : c === 'days' ? () => DAYDEF(split(k)[1]) : null);
}
async function loadAll() {
  let from = 0; const size = 1000;
  for (;;) {
    const { data, error } = await sb.from('docs').select('id,col,data').in('col', ['app'].concat(COLS, SANDBOX() ? ['sandbox'] : [])).order('id').range(from, from + size - 1);
    if (error) throw error;
    if (!from) { const meta = data.find(r => r.id === 'app/meta'), ep = meta && meta.data && meta.data.epoch; let mine = null; try { mine = localStorage.getItem('prapti-epoch'); } catch (e) {}
      if (ep && String(ep) !== mine) { try { [LS, LSB, LSD, 'prapti-photo-urls', 'prapti-log', 'prapti-lastOpen'].forEach(k => localStorage.removeItem(k)); localStorage.setItem('prapti-epoch', String(ep)); } catch (e) {} freshStart = true; dirty.clear(); location.reload(); throw new Error('fresh start'); } }
    data.forEach(applyRow);
    if (data.length < size) break; from += size;
  }
}
async function startSync() {
  try { await loadAll(); } catch (e) { if (e && e.message === 'fresh start') return; lastErr = e.message || 'load failed'; logErr('load', lastErr); }
  ready = true;
  // anything created on this phone before the first sync is uploaded now
  APPDOCS.forEach(k => { if (!B[k]) dirty.add(k); });
  COLS.forEach(c => Object.keys(S[c] || {}).forEach(id => { if (!B[c + '/' + id]) dirty.add(c + '/' + id); }));
  cacheLocal(); remoteChanged(); flush();
  sb.channel('docs-live').on('postgres_changes', { event: '*', schema: 'public', table: 'docs' }, p => { if (p.new && p.new.id) { applyRow(p.new); remoteChanged(); } }).subscribe();
}
window.addEventListener('online', () => { online = true; flush(); if (route && route.v === 'me') render(true); });
window.addEventListener('offline', () => { online = false; if (route && route.v === 'me') render(true); });
window.addEventListener('pagehide', () => { if (dirty.size) flush(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (dirty.size) flush(); } else { checkNewDay(); if (USER && ready) loadAll().then(remoteChanged).catch(() => {}); flush(); } });
setInterval(checkNewDay, 30000);
setInterval(() => { if (dirty.size) flush(); }, 20000);
function checkNewDay() { const t = appDay(); if (t !== TODAY) { TODAY = t; route = null; try { CI = null; } catch (e) {} if (USER) boot(); } }
let pendingRender = false;
function remoteChanged() {
  cacheLocal();
  const a = document.activeElement;
  if (a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') && !['range', 'file', 'time', 'date'].includes(a.type)) { pendingRender = true; return; }
  if (route && ['today', 'grow', 'me', 'rtms', 'safety', 'journal', 'saved', 'mydarshan', 'trash', 'sleep'].includes(route.v)) render(true);
}
document.addEventListener('focusout', () => setTimeout(() => { if (pendingRender) { pendingRender = false; remoteChanged(); } }, 50));

/* ---------- error log (kept on the phone, and sent up when possible) ---------- */
let logCount = 0;
function logErr(kind, detail) {
  try {
    const e = { at: new Date().toISOString(), kind: String(kind).slice(0, 80), detail: String(detail || '').slice(0, 600), route: route ? route.v : '', ver: APP_VER };
    const L = JSON.parse(localStorage.getItem('prapti-log') || '[]'); L.push(e); localStorage.setItem('prapti-log', JSON.stringify(L.slice(-100)));
    if (USER && logCount++ < 20) sb.from('docs').upsert({ id: 'logs/' + Date.now().toString(36) + uid(), col: 'logs', data: Object.assign({ ua: navigator.userAgent.slice(0, 140), user: USER.email }, e) }).then(() => {}, () => {});
  } catch (x) {}
}
window.addEventListener('error', e => logErr('js', (e.message || '') + ' @' + (e.lineno || '')));
window.addEventListener('unhandledrejection', e => logErr('promise', (e.reason && (e.reason.message || e.reason.code)) || e.reason));

/* ---------- photos: private Supabase storage, shown through signed links ---------- */
const PHOTO = {};
try { Object.assign(PHOTO, JSON.parse(localStorage.getItem('prapti-photo-urls') || '{}')); } catch (e) {}
function photoSrc(id) { const p = PHOTO[id]; return p && p.exp > Date.now() + 3600e3 ? p.url : ''; }
let signQ = new Set(), signT = null;
function loadPhoto(id) {
  return new Promise(res => {
    const now_ = photoSrc(id); if (now_) return res(now_);
    signQ.add(id); (loadPhoto.waiters = loadPhoto.waiters || []).push({ id, res });
    clearTimeout(signT); signT = setTimeout(signBatch, 30);
  });
}
async function signBatch() {
  const ids = [...signQ]; signQ.clear(); const waiters = loadPhoto.waiters || []; loadPhoto.waiters = [];
  if (!ids.length) return;
  try {
    const { data, error } = await sb.storage.from('media').createSignedUrls(ids, 7 * 86400);
    if (error) throw error;
    (data || []).forEach(d => { if (d.signedUrl) PHOTO[d.path] = { url: d.signedUrl, exp: Date.now() + 7 * 86400e3 }; });
    try { localStorage.setItem('prapti-photo-urls', JSON.stringify(PHOTO)); } catch (e) {}
  } catch (e) { logErr('photo-sign', e.message); }
  waiters.forEach(w => w.res(photoSrc(w.id)));
}
function fillPhotos(root) { (root || document).querySelectorAll('img[data-photo]').forEach(async img => { const id = img.dataset.photo; const src = await loadPhoto(id); if (src && img.isConnected) { img.src = src; img.removeAttribute('data-photo'); } }); }
async function compressImage(file, max) {
  max = max || 1600;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read that photo')); i.src = url; });
    const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), cv = document.createElement('canvas');
    cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s); cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    return await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.82));
  } finally { URL.revokeObjectURL(url); }
}
async function storePhoto(file) {
  if (viewOnly()) throw new Error('View only: this is her screen');
  const blob = await compressImage(file, 1600), path = 'photos/' + TODAY + '-' + Date.now().toString(36) + uid() + '.jpg';
  for (let a = 0; a < 3; a++) {
    const { error } = await sb.storage.from('media').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (!error) { const { data } = await sb.storage.from('media').createSignedUrl(path, 7 * 86400); if (data) PHOTO[path] = { url: data.signedUrl, exp: Date.now() + 7 * 86400e3 }; return path; }
    logErr('photo-upload', error.message); await new Promise(r => setTimeout(r, 1500 * (a + 1)));
  }
  throw new Error('Photo could not upload. Check your signal and try again.');
}

/* ---------- toast / sheet ---------- */
let toastT;
function toast(msg) { const old = $('.toast'); if (old) old.remove(); const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600); }
function sheet(html) { closeSheet(); const s = document.createElement('div'); s.className = 'sheet'; s.innerHTML = '<div class="p" role="dialog" aria-modal="true">' + html + '</div>'; s.addEventListener('click', e => { if (e.target === s) closeSheet(); }); document.body.appendChild(s); }
function closeSheet() { const s = $('.sheet'); if (s) s.remove(); }
async function copy(text) { try { await navigator.clipboard.writeText(text); toast('Copied'); } catch (e) { sheet('<div class="h2">Copy this</div><textarea readonly style="width:100%;height:200px;border:none;border-radius:16px;background:var(--card);padding:14px;font-size:14px">' + esc(text) + '</textarea><button class="btn soft" data-a="closeSheet">Done</button>'); setTimeout(() => { const t = $('.sheet textarea'); if (t) t.select(); }, 50); } }

/* ---------- content helpers ---------- */
const DAILY_MURTIS = C.murtis.filter(m => !['09', '10', '11', '13', '14', '15', '16', '17', '38', '40'].includes(m));
function dailyPair(d) {
  const n = dayNum(d);
  const m = DAILY_MURTIS[((n % DAILY_MURTIS.length) + DAILY_MURTIS.length) % DAILY_MURTIS.length];
  const ti = ((n * 7) % C.thoughts.length + C.thoughts.length) % C.thoughts.length;
  return { m, ti };
}
function quoteSize(t) { const n = t.length; return n <= 60 ? 'clamp(23px,6.8vw,27px)' : n <= 140 ? 'clamp(19px,5.6vw,22px)' : 'clamp(18px,5vw,20px)'; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function showThought(ti) {
  const q = C.thoughts[ti];
  sheet('<div class="between"><span class="eyebrow">' + esc(q.by) + '</span><button class="iconbtn" data-a="closeSheet" aria-label="Close">' + I.close + '</button></div>'
    + '<p class="quote" style="font-size:22px">“' + esc(q.t) + '”</p><div class="small">' + esc(q.src) + '</div>'
    + (q.scan ? '<img src="' + q.scan + '" alt="The original in his own handwriting" style="width:100%;border-radius:16px;background:#fff">' : ''));
}

/* ---------- router ---------- */
let route = null, stack = [], lastViewKey = '';
function go(v, p, opts) {
  opts = opts || {};
  if (route && !opts.replace) stack.push(route);
  route = { v, p: p || {} };
  stopBreath();
  render();
  window.scrollTo(0, 0);
}
function back(fallback) { const r = stack.pop(); if (r) { route = r; stopBreath(); render(); window.scrollTo(0, 0); } else go(fallback || 'today', null, { replace: true }); }
const V = {};
function render(keepScroll) {
  const y = window.scrollY;
  const html = V[route.v](route.p), app = $('#app');
  const key = route.v + '|' + JSON.stringify(route.p || {}), same = key === lastViewKey; lastViewKey = key;
  const still = !!keepScroll || same;
  app.classList.toggle('still', still);
  // looping background motion carries on from where it was instead of restarting
  app.style.setProperty('--t', (-performance.now() / 1000).toFixed(2) + 's');
  app.innerHTML = html;
  app.classList.remove('pagein');
  if (!still) { void app.offsetWidth; app.classList.add('pagein'); }
  const withNav = ['today', 'grow', 'me'].includes(route.v);
  $('#nav').hidden = !withNav;
  if (withNav) $('#nav').innerHTML = navHTML(route.v);
  if (keepScroll) window.scrollTo(0, y);
  const after = V[route.v + '_after']; if (after) after(route.p);
}
function navHTML(on) {
  const b = (k, l, a) => '<button class="' + (on === k ? 'on' : '') + '" data-a="' + a + '"' + (on === k ? ' aria-current="page"' : '') + '>' + I[k] + l + '</button>';
  return '<div class="in">' + b('today', 'Today', 'goToday') + b('darshan', 'Darshan', 'goFeed') + '<button class="lotus" data-a="goCalm" aria-label="Calm space">' + iconLotus(false) + '</button>' + b('grow', 'Grow', 'goGrow') + b('me', 'Me', 'goMe') + '</div>';
}
const closeBtn = (a, label) => '<button class="iconbtn" data-a="' + (a || 'back') + '" aria-label="' + (label || 'Close') + '">' + I.close + '</button>';

/* ---------- actions ---------- */
const A = {
  closeSheet: () => closeSheet(),
  back: () => back(),
  goToday: () => { stack = []; go('today', null, { replace: true }); },
  goFeed: () => go('feed'), goCalm: () => go('calm'), goGrow: () => { stack = []; go('grow', null, { replace: true }); }, goMe: () => { stack = []; go('me', null, { replace: true }); },
  go: el => go(el.dataset.v, el.dataset.p ? JSON.parse(el.dataset.p) : null),
  thought: el => showThought(+el.dataset.i),
};
const INP = {};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  const f = A[el.dataset.a]; if (f) { e.preventDefault(); f(el, e); }
});
document.addEventListener('change', e => { const el = e.target; if (el.type === 'file' && el.dataset.in && INP[el.dataset.in]) INP[el.dataset.in](el, e); });
document.addEventListener('input', e => { if (e.target.type === 'file') return; const el = e.target.closest('[data-in]'); if (el && INP[el.dataset.in]) INP[el.dataset.in](el, e); });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { const el = e.target.closest('[data-enter]'); if (el && A[el.dataset.enter]) { e.preventDefault(); A[el.dataset.enter](el, e); } } if (e.key === 'Escape') closeSheet(); });
