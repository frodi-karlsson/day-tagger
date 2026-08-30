import { registerDI } from '#src/di/di.js'
import type { MonthRef } from '#src/calendar/calendar.js'
import { toIsoDate, type IsoDate } from '#src/date/iso-date.js'
import { emptyDayLog } from '#src/day/day-log.service.js'
import type { DayLog } from '#src/day/day.model.js'
import { emptyTagConfig } from '#src/tag/tag-config.service.js'
import type { TagConfig } from '#src/tag/tag.model.js'
import { createStore, type SetStoreFunction } from 'solid-js/store'

/** Reactive state keyed by name. Reads stay fine grained, one key does not wake another. */
export class Store {
  private readonly state: StoreState
  private readonly setState: SetStoreFunction<StoreState>

  constructor(initial: StoreState = defaultState()) {
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

export function defaultState(): StoreState {
  const today = toIsoDate(new Date())

  return {
    tagConfig: emptyTagConfig(),
    dayLog: emptyDayLog(),
    month: monthOf(new Date()),
    selectedDate: today,
    openMenu: undefined,
  }
}

function monthOf(date: Date): MonthRef {
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

export interface StoreState {
  tagConfig: TagConfig
  dayLog: DayLog
  month: MonthRef
  selectedDate: IsoDate
  openMenu: OpenMenu
}

/** Which overlay covers the calendar, if any. */
export type OpenMenu = 'day' | 'tags' | 'backup' | undefined

registerDI(Store, () => new Store())
