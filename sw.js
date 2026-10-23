// TrueCount – Service Worker: alles offline verfügbar.
// Bei jeder Änderung CACHE hochzählen, sonst sehen installierte Apps die neue Version nicht.
const CACHE = 'truecount-4';
const DATEIEN = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/ui.js', 'js/karten.js', 'js/strategie.js', 'js/tisch.js', 'js/tische.js',
  'js/figuren.js', 'js/szene.js', 'js/profil.js', 'js/sound.js', 'js/training.js', 'js/musik.js', 'js/tutorial.js',
  'icons/favicon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  // cache: 'reload' holt jede Datei frisch vom Server und nicht aus dem Browser-Cache
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(DATEIEN.map(d => fetch(d, { cache: 'reload' }).then(r => c.put(d, r))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Schrift von Google: einmal laden, dann aus dem Cache
  if (url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(r => r || fetch(e.request).then(n => { c.put(e.request, n.clone()); return n; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
