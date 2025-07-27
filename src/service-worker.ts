/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import './serviceWorkerConfig';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Précache tous les assets listés par workbox-webpack-plugin
precacheAndRoute(self.__WB_MANIFEST);

// Force le nouveau service worker à prendre le contrôle immédiatement
self.skipWaiting();

// Gérer les notifications push
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body ?? 'Nouvelle mise à jour de l\'application disponible',
    icon: '/logo192.png',
    badge: '/logo192.png',
    lang: 'fr',
    vibrate: [200, 100, 200],
    tag: 'tiforama-update',
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title ?? 'Tiforama - Mise à jour',
      options
    )
  );
});