// Service Worker for GrooveLeads PWA
const CACHE_NAME = 'grooveleads-v2'
const urlsToCache = [
  '/',
  '/projects',
  '/contacts',
  '/campaigns',
  '/offline',
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await Promise.all(
        urlsToCache.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' })
            if (response.ok) {
              await cache.put(url, response)
            }
          } catch {
            // Ignore cache failures for missing routes
          }
        })
      )
    })()
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return (
        response ||
        fetch(event.request).catch(() => {
          // If offline and request is a page, return offline page
          if (event.request.destination === 'document') {
            return caches.match('/offline')
          }
        })
      )
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-email-activity') {
    event.waitUntil(syncEmailActivity())
  }
})

async function syncEmailActivity() {
  // Sync pending email activities when back online
  // Implementation depends on your offline queue system
}

