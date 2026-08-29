/** Throws when `condition` is false, and narrows it for everything after the call. */
export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? 'Assertion failed.')
  }
}
