/**
 * The outcome of reading something out of storage. `unreadable` carries the raw text, because
 * the data is still on the device at that point and must not be written over until the person
 * has had a chance to keep it.
 */
export type LoadResult<T> =
  | { status: 'ok'; value: T }
  | { status: 'empty' }
  | { status: 'unreadable'; raw: string; reason: string }
