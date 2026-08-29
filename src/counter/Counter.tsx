import { inject } from '#src/di/di.js'
import { Store } from '#src/store/store.js'
import type { JSX } from 'solid-js'

export function Counter(): JSX.Element {
  const store = inject(Store)

  return (
    <button
      type="button"
      onClick={() => {
        store.update('count', (prev) => prev + 1)
      }}
    >
      count is {store.get('count')}
    </button>
  )
}
