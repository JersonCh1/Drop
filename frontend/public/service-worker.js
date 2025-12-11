// Service Worker for PWA
const CACHE_NAME = 'iphone-cases-v7'; // BYPASS completo para desarrollo
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Caching files silently
        // Use addAll but handle errors gracefully
        return cache.addAll(urlsToCache).catch((error) => {
          // Some files failed to cache (silent)
          // Cache files individually to avoid failing entire batch
          return Promise.all(
            urlsToCache.map(url =>
              cache.add(url).catch(err => {
                // Failed to cache (silent)
              })
            )
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            // Deleting old cache silently
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - BYPASS todo para permitir Izipay funcionar correctamente
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // NUNCA interceptar estos dominios (tracking, pagos, analytics)
  const bypassDomains = [
    'facebook.net',
    'facebook.com',
    'googletagmanager.com',
    'google-analytics.com',
    'izipay',
    'micuentaweb.pe',
    'stripe.com',
    'mercadopago.com'
  ];

  // Si la URL contiene alguno de estos dominios, NO interceptar
  if (bypassDomains.some(domain => url.includes(domain))) {
    return; // Dejar que el navegador maneje la request normalmente
  }

  // Para todo lo demás, hacer bypass simple
  event.respondWith(fetch(event.request));
});

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'iPhone Cases', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Background sync for offline orders
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  }
});

async function syncOrders() {
  try {
    const db = await openDB();
    const orders = await db.getAll('pending-orders');

    for (const order of orders) {
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        await db.delete('pending-orders', order.id);
      } catch (error) {
        console.error('Error syncing order:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('iphone-cases-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-orders')) {
        db.createObjectStore('pending-orders', { keyPath: 'id' });
      }
    };
  });
}

// Service Worker loaded silently
