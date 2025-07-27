/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { precacheAndRoute } from 'workbox-precaching';

// Précacher les ressources essentielles
precacheAndRoute(self.__WB_MANIFEST);

// Plugin de synchronisation en arrière-plan pour le temps
const timeSyncPlugin = new BackgroundSyncPlugin('time-sync-queue', {
  maxRetentionTime: 24 * 60, // 24 heures en minutes
});

// Route pour la synchronisation du temps
registerRoute(
  ({ url }) => url.pathname.includes('worldtimeapi.org'),
  new NetworkFirst({
    cacheName: 'time-api-cache',
    plugins: [
      timeSyncPlugin,
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
    ],
  })
);

// Cache pour les ressources statiques
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache pour les images avec politique de mise en cache agressive
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
      }),
    ],
  })
);

// Cache pour les fichiers audio
registerRoute(
  ({ request }) => request.destination === 'audio',
  new CacheFirst({
    cacheName: 'audio',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
      }),
    ],
  })
);

// Gestionnaire d'installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Précharger les fichiers audio essentiels
      caches.open('audio').then((cache) => {
        return cache.addAll([
          '/assets/audio/countdown.mp3',
          '/assets/audio/next.mp3',
          '/assets/audio/fini.mp3',
        ]);
      }),
      // Précharger les images essentielles
      caches.open('images').then((cache) => {
        return cache.addAll([
          '/assets/images/logo.png',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png',
        ]);
      }),
    ])
  );
});

// Gestionnaire de messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestionnaire de synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  if (event.tag === 'time-sync') {
    event.waitUntil(
      fetch('http://worldtimeapi.org/api/timezone/UTC')
        .then(response => response.json())
        .then(data => {
          // Stocker le temps synchronisé
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'TIME_SYNCED',
                time: data.datetime
              });
            });
          });
        })
    );
  }
});