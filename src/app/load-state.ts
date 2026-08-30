import { DayLogService } from '#src/day/day-log.service.js'
import { inject } from '#src/di/di.js'
import type { Store } from '#src/store/store.js'
import { TagConfigService } from '#src/tag/tag-config.service.js'

/**
 * Fills the store from storage. Returns a description of anything that could not be read, in
 * which case nothing is written and the caller should say so rather than carry on.
 */
export function loadPersistedState(store: Store): Unreadable | undefined {
  const tags = inject(TagConfigService).load()
  const days = inject(DayLogService).load()

  if (tags.status === 'unreadable') {
    return { what: 'tag configuration', reason: tags.reason, raw: tags.raw }
  }

  if (days.status === 'unreadable') {
    return { what: 'day log', reason: days.reason, raw: days.raw }
  }

  if (tags.status === 'ok') {
    store.set('tagConfig', tags.value)
  }

  if (days.status === 'ok') {
    store.set('dayLog', days.value)
  }

  return undefined
}

export interface Unreadable {
  what: string
  reason: string
  raw: string
}
