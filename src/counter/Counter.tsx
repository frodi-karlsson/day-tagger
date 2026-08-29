import { Button } from '#src/button/Button.js'
import { inject } from '#src/di/di.js'
import { Store } from '#src/store/store.js'
import type { JSX } from 'solid-js'

export function Counter(): JSX.Element {
  const store = inject(Store)

  function increment(): void {
    store.update('count', (prev) => prev + 1)
  }

  return <Button onClick={increment}>count is {store.get('count')}</Button>
}
