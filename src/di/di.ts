interface Registration {
  factory: () => unknown
  instance: unknown
  resolved: boolean
}

/** A class used as a lookup key. Never constructed by the container itself. */
export type Injectable<T> = abstract new (...args: never[]) => T

const registry = new Map<Injectable<unknown>, Registration>()

/** Registers how to build `token`. Registering again replaces the previous entry. */
export function registerDI<T>(token: Injectable<T>, factory: () => T): void {
  registry.set(token, { factory, instance: undefined, resolved: false })
}

/** Returns the single instance of `token`, building it on first use. */
export function inject<T>(token: Injectable<T>): T {
  const registration = registry.get(token)

  if (registration === undefined) {
    throw new Error(`No DI registration for ${token.name}`)
  }

  if (!registration.resolved) {
    registration.instance = registration.factory()
    registration.resolved = true
  }

  return registration.instance as T
}

/** Drops every registration. Tests should call this between cases. */
export function resetDI(): void {
  registry.clear()
}
