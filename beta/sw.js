// Prapti service worker. Pages are network-first so updates arrive; images, audio and the library are cache-first.
const CACHE = 'praptib-375b85b7';
const CORE = ['./', 'index.html', '../vendor/supabase.js', 'manifest.webmanifest', '../icons/icon-180.png', '../icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('praptib-') && k !== CACHE && k !== 'prapti-media').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // Supabase, YouTube, fonts: straight to network
  if (req.headers.has('range')) return;        // let audio seeking go to the network normally
  const p = url.pathname;
  const media = /\/(m|audio|icons|vendor)\//.test(p) || /\.(jpg|png|mp3)$/.test(p);
  if (media) {
    e.respondWith(caches.open('prapti-media').then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok && res.status === 200) c.put(req, res.clone());
      return res;
    }));
    return;
  }
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});

// Push reminders
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Prapti', { body: d.body || '', icon: '../icons/icon-192.png', badge: '../icons/icon-192.png', tag: d.tag || 'prapti', data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => { for (const c of list) { if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus(); } return self.clients.openWindow(url); }));
});
