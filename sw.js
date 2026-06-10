// Service Worker – macht die App offline-fähig (App-in-Taskleiste ohne Internet)
const CACHE = 'tt10-v4';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './css/style.css',
  './js/app.js', './js/data.js', './js/audio.js', './js/storage.js',
  './js/engine.js', './js/game.js', './js/keyboard.js', './js/tmux.js',
  './assets/favicon.svg', './assets/icon-192.png', './assets/icon-512.png',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Code & Seiten: network-first (immer aktuell, offline aus Cache als Fallback).
// Bilder/Fonts: cache-first (schnell, ändern sich kaum).
function isCode(req) {
  return req.mode === 'navigate' || /\.(?:js|css|webmanifest)$/.test(new URL(req.url).pathname) ||
    new URL(req.url).pathname.endsWith('/');
}
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (isCode(e.request)) {
    // network-first
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
  } else {
    // cache-first
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html')))
    );
  }
});
