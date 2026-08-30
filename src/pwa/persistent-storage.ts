/**
 * Asks the browser to keep this site's storage.
 *
 * Without it Safari clears everything, local storage included, after seven days without a
 * visit for a site that has not been installed to the home screen. For an app whose whole
 * point is a record kept over time, that is the likeliest way to lose it.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator) || typeof navigator.storage.persist !== 'function') {
    return false
  }

  if (await navigator.storage.persisted()) {
    return true
  }

  return navigator.storage.persist()
}
