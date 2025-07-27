 export const TIME_SYNC_INTERVAL = 30000; // 30 seconds
export const ANIMATION_TICK_INTERVAL = 1000; // 1 second
export const CACHE_VERSION = '1.0.0';
export const MIN_CACHE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
export const DEFAULT_NOTIFICATION_OPTIONS = {
  icon: '/icons/icon-192x192.png',
  badge: '/icons/icon-72x72.png',
  silent: true,
};

export const AUDIO_FILES = {
  countdown: '/assets/audio/countdown.mp3',
  next: '/assets/audio/next.mp3',
  finish: '/assets/audio/fini.mp3',
} as const;

export const PWA_ASSETS = {
  icons: [
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
  ],
  splashScreens: [
    '/splash/apple-splash-2048-2732.jpg',
    '/splash/apple-splash-1668-2388.jpg',
    '/splash/apple-splash-1536-2048.jpg',
    '/splash/apple-splash-1125-2436.jpg',
    '/splash/apple-splash-1242-2688.jpg',
  ],
} as const;