// Hand written rather than generated. The app is one static page, so runtime caching covers
// offline use without a build step that has to know every hashed asset name.

const cacheName = 'day-tagger-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

/**
 * Caches the shell and the assets it names. The worker usually activates after the page has
 * already fetched those assets, so waiting to catch them in flight leaves the first offline
 * visit with a page that renders but never hydrates.
 */
async function precache() {
  const cache = await caches.open(cacheName)
  const response = await fetch('/precache-manifest.json', { cache: 'no-store' })
  const urls = response.ok ? await response.json() : ['/']

  await cache.addAll(urls)
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map(deleteCache)))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return
  }

  // Build assets carry a content hash, so a name never points at different bytes.
  if (new URL(request.url).pathname.startsWith('/_astro/')) {
    event.respondWith(cacheFirst(request))

    return
  }

  event.respondWith(networkFirst(request))
})

function deleteCache(key) {
  return caches.delete(key)
}

async function cacheFirst(request) {
  // Astro retries a failed module with a cache busting query, and the static server varies on
  // encoding, so a plain match against the stored request misses both times.
  const cached = await caches.match(request, { ignoreSearch: true, ignoreVary: true })

  if (cached) {
    return cached
  }

  const response = await fetch(request)

  await store(request, response)

  return response
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)

    await store(request, response)

    return response
  } catch (error) {
    const cached = await caches.match(request, { ignoreVary: true })

    if (cached) {
      return cached
    }

    if (request.mode === 'navigate') {
      const shell = await caches.match('/', { ignoreVary: true })

      if (shell) {
        return shell
      }
    }

    throw error
  }
}

async function store(request, response) {
  if (!response.ok) {
    return
  }

  const cache = await caches.open(cacheName)

  await cache.put(request, response.clone())
}
