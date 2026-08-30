// Hand written rather than generated. The app is one static page, so a precache list plus
// runtime caching covers offline use without pulling in a toolchain.
//
// __BUILD_ID__ is replaced at build time. That is what makes this file's bytes change between
// deploys, which is the only thing that makes a browser reinstall the worker and refresh the
// precache. Without it the first install would be the last one.
const cacheName = 'day-tagger-__BUILD_ID__'

self.addEventListener('install', (event) => {
  event.waitUntil(precache())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map(deleteCache)))
      .then(() => self.clients.claim()),
  )
})

// The page asks for this once the reader has agreed to take the update.
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    void self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  // Build assets carry a content hash, so a name never points at different bytes.
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(cacheFirst(request))

    return
  }

  event.respondWith(networkFirst(request))
})

async function precache() {
  const cache = await caches.open(cacheName)
  const response = await fetch('/precache-manifest.json', { cache: 'no-store' })
  const urls = response.ok ? await response.json() : ['/']

  // One at a time rather than addAll, which is atomic: a single missing file there would
  // reject the install and leave the app with no offline support at all, silently.
  await Promise.all(urls.map((url) => cache.add(url).catch(() => undefined)))
}

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

    // Every built page is precached, so reaching here means a page that never existed. Serving
    // the home page for it would be a lie, so let the browser report the failure.
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
