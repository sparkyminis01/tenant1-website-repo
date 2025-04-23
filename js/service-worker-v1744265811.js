// service-worker.js
const CACHE_NAME = 'v1'; // Use a static version or dynamic version if needed
const urlsToCache = ['/']; // Only cache the root page

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opening cache:', CACHE_NAME);
                return cache.addAll(urlsToCache)
                    .catch(error => {
                        console.error('Cache addAll failed:', error);
                        throw error; // Ensure install fails on error
                    });
            })
    );
});

self.addEventListener('fetch', event => {
    // No caching for other requests, just proxy to network
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                // Fallback to cache only for '/' if network fails
                if (event.request.url.endsWith('/')) {
                    return caches.match('/');
                }
                return new Response('Offline', { status: 503 });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            ).then(() => console.log('Old caches cleared'));
        })
    );
});