// Enhanced Service Worker với tiered caching strategy
const CACHE_NAME = 'mia-vn-v1';
const VENDOR_CACHE = 'vendor-v1';
const APP_CACHE = 'app-v1';
const ASSET_CACHE = 'assets-v1';

// Cache strategies cho different file types
const CACHE_STRATEGIES = {
  // Vendor files - Cache first (30 ngày)
  vendor: {
    pattern: /\/assets\/vendor\//,
    strategy: 'CacheFirst',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  },

  // App chunks - Stale while revalidate (7 ngày)
  app: {
    pattern: /\/assets\/chunks\//,
    strategy: 'StaleWhileRevalidate',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  // Static assets - Cache first (90 ngày)
  assets: {
    pattern: /\.(png|jpg|jpeg|gif|svg|webp|css|woff2?)$/,
    strategy: 'CacheFirst',
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
  },

  // API calls - Network first với fallback
  api: {
    pattern: /\/api\//,
    strategy: 'NetworkFirst',
    maxAge: 5 * 60 * 1000 // 5 minutes
  }
};

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, VENDOR_CACHE, APP_CACHE, ASSET_CACHE].includes(cacheName)) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Determine cache strategy based on URL pattern
  let strategy = null;
  let cacheName = CACHE_NAME;

  for (const [key, config] of Object.entries(CACHE_STRATEGIES)) {
    if (config.pattern.test(url.pathname)) {
      strategy = config;
      cacheName = key === 'vendor' ? VENDOR_CACHE :
                  key === 'app' ? APP_CACHE :
                  key === 'assets' ? ASSET_CACHE : CACHE_NAME;
      break;
    }
  }

  if (strategy) {
    event.respondWith(handleRequest(event.request, strategy, cacheName));
  }
});

async function handleRequest(request, strategy, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  switch (strategy.strategy) {
    case 'CacheFirst':
      if (cachedResponse && !isExpired(cachedResponse, strategy.maxAge)) {
        return cachedResponse;
      }
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        return cachedResponse || new Response('Offline', { status: 503 });
      }

    case 'StaleWhileRevalidate':
      const networkPromise = fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      });

      return cachedResponse || networkPromise;

    case 'NetworkFirst':
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        return cachedResponse || new Response('Offline', { status: 503 });
      }

    default:
      return fetch(request);
  }
}

function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;

  const responseTime = new Date(dateHeader).getTime();
  return Date.now() - responseTime > maxAge;
}