/**
 * Registers the service worker that makes the app work offline. Skipped in development, where
 * a cache sitting in front of the dev server only hides changes.
 */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return
  }

  void navigator.serviceWorker.register('/sw.js')
}
