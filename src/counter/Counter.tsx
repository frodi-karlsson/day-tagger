import { createSignal, type JSX } from 'solid-js'

export function Counter(): JSX.Element {
  const [count, setCount] = createSignal(0)

  return (
    <button type="button" onClick={() => setCount(count() + 1)}>
      count is {count()}
    </button>
  )
}
