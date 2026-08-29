/** A value that may or may not arrive asynchronously. */
export type Promisable<T> = T | Promise<T>;
