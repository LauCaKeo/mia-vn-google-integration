// Service Worker for MIA.vn Google Integration - Enhanced Performance Optimization
const CACHE_NAME = "mia-vn-cache-v3";
const STATIC_CACHE_NAME = "mia-vn-static-v3";
const DYNAMIC_CACHE_NAME = "mia-vn-dynamic-v3";
const IMAGE_CACHE_NAME = "mia-vn-images-v3";

// Cache strategies configuration
const CACHE_CONFIG = {
  // Static assets to cache immediately
  staticAssets: [
    "/",
    "/static/js/bundle.js",
    "/static/css/main.css",
    "/manifest.json",
    "/favicon.ico",
    "/logo192.png",
    "/logo512.png",
  ],

  // Cache durations (in milliseconds)
  durations: {
    static: 30 * 24 * 60 * 60 * 1000, // 30 days
    dynamic: 7 * 24 * 60 * 60 * 1000, // 7 days
    images: 30 * 24 * 60 * 60 * 1000, // 30 days
    api: 5 * 60 * 1000, // 5 minutes
  },

  // Network timeout for cache fallback
  networkTimeout: 3000,

  // Maximum cache sizes (bytes)
  maxSizes: {
    static: 50 * 1024 * 1024, // 50MB
    dynamic: 30 * 1024 * 1024, // 30MB
    images: 100 * 1024 * 1024, // 100MB
  },
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Installing v3...");

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log("[ServiceWorker] Caching static assets");
        return cache.addAll(CACHE_CONFIG.staticAssets);
      }),

      // Initialize other caches
      caches.open(DYNAMIC_CACHE_NAME),
      caches.open(IMAGE_CACHE_NAME),
    ])
      .then(() => {
        console.log("[ServiceWorker] Installation complete");
      })
      .catch((error) => {
        console.error("[ServiceWorker] Installation failed:", error);
      })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activating v3...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old cache versions
            if (
              !Object.values({
                CACHE_NAME,
                STATIC_CACHE_NAME,
                DYNAMIC_CACHE_NAME,
                IMAGE_CACHE_NAME,
              }).includes(cacheName)
            ) {
              console.log("[ServiceWorker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[ServiceWorker] Cache cleanup complete");
        return self.clients.claim();
      })
  );
});

// Fetch event - implement advanced caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Route different request types to appropriate strategies
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isImage(url)) {
    event.respondWith(handleImage(request));
  } else if (isGoogleAPI(url)) {
    event.respondWith(handleGoogleAPI(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleDynamicContent(request));
  }
});

// Check if request is for static asset
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/static/") ||
    url.pathname.match(/\.(css|js|woff|woff2)$/i) ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/favicon.ico"
  );
}

// Check if request is for image
function isImage(url) {
  return (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i) ||
    url.searchParams.has("image")
  );
}

// Check if request is for Google API
function isGoogleAPI(url) {
  return (
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("google.com")
  );
}

// Check if request is for API
function isAPIRequest(url) {
  return url.pathname.startsWith("/api/");
}

// Strategy 1: Cache First (for static assets)
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (
      cachedResponse &&
      !isExpired(cachedResponse, CACHE_CONFIG.durations.static)
    ) {
      return cachedResponse;
    }

    // Fetch from network and cache
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      await cache.put(request, addTimestamp(networkResponse.clone()));
    }

    return networkResponse;
  } catch (error) {
    console.error("[ServiceWorker] Static asset fetch failed:", error);

    // Return cached version even if expired as fallback
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    return (
      cachedResponse || new Response("Asset not available", { status: 503 })
    );
  }
}

// Strategy 2: Stale While Revalidate (for images)
async function handleImage(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Fetch from network in background
    const fetchPromise = fetch(request)
      .then(async (networkResponse) => {
        if (networkResponse.ok) {
          await cleanupCache(IMAGE_CACHE_NAME, CACHE_CONFIG.maxSizes.images);
          await cache.put(request, addTimestamp(networkResponse.clone()));
        }
        return networkResponse;
      })
      .catch(() => null);

    // Return cached version immediately if available and not expired
    if (
      cachedResponse &&
      !isExpired(cachedResponse, CACHE_CONFIG.durations.images)
    ) {
      fetchPromise.catch(() => {}); // Update cache in background
      return cachedResponse;
    }

    // Wait for network response
    return fetchPromise || new Response("Image not available", { status: 503 });
  } catch (error) {
    console.error("[ServiceWorker] Image fetch failed:", error);
    return new Response("Image not available", { status: 503 });
  }
}

// Strategy 3: Network First with Timeout (for Google APIs)
async function handleGoogleAPI(request) {
  try {
    // Try network first with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CACHE_CONFIG.networkTimeout
    );

    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      // Cache successful responses with short TTL
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, addTimestamp(networkResponse.clone()));
      return networkResponse;
    }

    throw new Error("Network response not ok");
  } catch (error) {
    console.log(
      "[ServiceWorker] Network failed for Google API, trying cache:",
      error.name
    );

    // Fallback to cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (
      cachedResponse &&
      !isExpired(cachedResponse, CACHE_CONFIG.durations.api)
    ) {
      return cachedResponse;
    }

    // Return error response
    return new Response(
      JSON.stringify({
        error: "Google API unavailable",
        offline: true,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Strategy 4: Network First with Cache Fallback (for API requests)
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache API responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cleanupCache(DYNAMIC_CACHE_NAME, CACHE_CONFIG.maxSizes.dynamic);
      await cache.put(request, addTimestamp(networkResponse.clone()));
      return networkResponse;
    }

    throw new Error("Network response not ok");
  } catch (error) {
    console.log("[ServiceWorker] API request failed, trying cache:", error);

    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (
      cachedResponse &&
      !isExpired(cachedResponse, CACHE_CONFIG.durations.api)
    ) {
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({
        error: "API unavailable",
        offline: true,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Strategy 5: Network First (for dynamic content)
async function handleDynamicContent(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache dynamic content
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, addTimestamp(networkResponse.clone()));
    }

    return networkResponse;
  } catch (error) {
    console.log("[ServiceWorker] Dynamic content failed, trying cache:", error);

    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    return (
      cachedResponse ||
      new Response(
        "<!DOCTYPE html><html><body><h1>Offline</h1><p>Content not available</p></body></html>",
        {
          status: 503,
          headers: { "Content-Type": "text/html" },
        }
      )
    );
  }
}

// Utility: Add timestamp to response for expiration tracking
function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set("sw-cache-timestamp", Date.now().toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

// Utility: Check if cached response is expired
function isExpired(response, maxAge) {
  const cacheTime = response.headers.get("sw-cache-timestamp");
  if (!cacheTime) return true;

  const age = Date.now() - parseInt(cacheTime);
  return age > maxAge;
}

// Utility: Clean up cache to stay within size limits
async function cleanupCache(cacheName, maxSize) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    let totalSize = 0;
    const entries = [];

    // Calculate total size and collect entries with timestamps
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        const timestamp = parseInt(
          response.headers.get("sw-cache-timestamp") || "0"
        );

        entries.push({
          request,
          size: blob.size,
          timestamp,
        });

        totalSize += blob.size;
      }
    }

    // Remove oldest entries if over size limit
    if (totalSize > maxSize) {
      entries.sort((a, b) => a.timestamp - b.timestamp);

      for (const entry of entries) {
        if (totalSize <= maxSize) break;

        await cache.delete(entry.request);
        totalSize -= entry.size;
      }

      console.log(
        `[ServiceWorker] Cleaned up cache ${cacheName}, reduced by ${entries.length - entries.filter((e) => totalSize >= 0).length} entries`
      );
    }
  } catch (error) {
    console.error("[ServiceWorker] Cache cleanup failed:", error);
  }
}

// Background sync for failed requests
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("[ServiceWorker] Background sync triggered");
    event.waitUntil(handleBackgroundSync());
  }
});

// Enhanced background sync handler
async function handleBackgroundSync() {
  try {
    // Retry failed API calls
    console.log("[ServiceWorker] Handling background sync");

    // You can implement retry logic here
    // For example, retry failed POST/PUT requests stored in IndexedDB

    // Preload critical resources
    const cache = await caches.open(STATIC_CACHE_NAME);
    const criticalUrls = ["/api/health"];

    for (const url of criticalUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      } catch (error) {
        console.log(`[ServiceWorker] Failed to preload ${url}:`, error);
      }
    }
  } catch (error) {
    console.error("[ServiceWorker] Background sync failed:", error);
  }
}
