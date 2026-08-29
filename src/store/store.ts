import { registerDI } from '#src/di/di.js'
import { createStore, type SetStoreFunction } from 'solid-js/store'

/** Reactive state keyed by name. Reads stay fine grained, one key does not wake another. */
export class Store {
  private readonly state: StoreState
  private readonly setState: SetStoreFunction<StoreState>

  constructor(initial: StoreState = defaultState) {
    const [state, setState] = createStore<StoreState>({ ...initial })
    this.state = state
    this.setState = setState
  }

  get<K extends keyof StoreState>(key: K): StoreState[K] {
    return this.state[key]
  }

  set<K extends keyof StoreState>(key: K, value: StoreState[K]): void {
    this.setState({ [key]: value } as Partial<StoreState>)
  }

  update<K extends keyof StoreState>(key: K, next: (prev: StoreState[K]) => StoreState[K]): void {
    this.setState((prev) => ({ [key]: next(prev[key]) }))
  }
}

registerDI(Store, () => new Store())

const defaultState: StoreState = {
  count: 0,
}

export interface StoreState {
  count: number
}
