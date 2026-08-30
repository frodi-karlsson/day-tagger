/**
 * Registers the worker that makes the app work offline, and reports when a newer one is ready.
 *
 * The new worker deliberately waits rather than taking over on its own. Swapping it under a
 * page that is already running the previous build is how you end up serving one version's
 * assets to another version's code.
 */
export function registerServiceWorker(onUpdateReady: () => void): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  void navigator.serviceWorker.register('/sw.js').then((registration) => {
    if (registration.waiting !== null) {
      onUpdateReady()
    }

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing

      if (installing === null) {
        return
      }

      installing.addEventListener('statechange', () => {
        // A worker that installs while another controls the page is an update, not a first run.
        if (installing.state === 'installed' && navigator.serviceWorker.controller !== null) {
          onUpdateReady()
        }
      })
    })
  })
}

/** Tells the waiting worker to take over, then reloads once it has. */
export function applyUpdate(): void {
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })

  void navigator.serviceWorker.ready.then((registration) => {
    registration.waiting?.postMessage('skip-waiting')
  })
}
