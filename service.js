const urlB64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

// You can change cache version to disable old cache.
// However, this is not necesary since fetch handler below, updates caches regularily.
const version = "0.0.1";
const cacheName = `patatap-${version}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        '/',
        // Here we try to pre-fetch all the files to ensure the app will work offline on first load.
        /*
        * NOTE: This is not necessary if the app has been loaded while online at least once after service worker install, since cache handler below caches all files anyway.
        * You can remove this list but that would require at least two page loads to enable offline mode - once for sw install and once more to fill up the cache through fetch handler.
        */
        '/images/cornelius-logo-192x192.png',
        '/images/cornelius-logo.png',
        '/images/favicon.ico',
        '/images/glow.jpg',
        '/images/icons/sync.svg',
        '/manifest.json',
        '/src/gpgpu.js',
        '/src/sequencer.js',
        '/src/simulation.js',
        '/third-party/equalizer.js',
        '/third-party/has.js',
        '/third-party/sound.js',
        '/third-party/three-r90dev.js',
        '/third-party/to-half.js',
        '/third-party/two-v0.7.0.js',
        '/third-party/url.js',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M01_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M02_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M03_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M04_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M05_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M06_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M07_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M08_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M09_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M10_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M11_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M12_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M13_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M14_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M15_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M16_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M17_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M18_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M19_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M20_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M21_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M22_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M23_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M24_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M25_1.mp3',
        '//storage.googleapis.com/cdn.patatap.com/mellow-waves/assets/sounds/M26_1.mp3',
      ])
      .then(() => {
        self.skipWaiting();
        console.log('sw installed');
      });
    })
  );
});

// Following fetch handler always returns cached file if available.
// Subsequently, it fetches the requested url and updates the cache if successful.
// This ensures that files are always serverved as fast as possible (cached).
// However, remotely updated files will take two page reloads to reach the client.

self.addEventListener('fetch', (event) => {

  // Following serices break when served from local cache.
  // Let's serve them from the server always.
  if (/fonts.googleapis/.test(event.request.url)) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (/google-analytics/.test(event.request.url)) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (/googletagmanager/.test(event.request.url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.open(cacheName)
    .then(cache => {
      setTimeout(() => {
        cache.addAll([event.request]);
      });
      return cache.match(event.request, {ignoreSearch: event.request.url.indexOf('?') != -1});
    })
    .then(response => {
      if (response && response.redirected) {
        return fetch(event.request);
      }
      if (!response) {
        caches.open(cacheName)
        .then(cache => {
          cache.addAll([event.request.url]);
        });
      }
      return response || fetch(event.request);
    }).catch(console.error)
  );
});

self.addEventListener('activate', async (event) => {
  event.waitUntil(self.clients.claim());
  console.log('sw activated');
});
