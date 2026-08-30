import styles from './App.module.scss'
import { RecoveryNotice } from '#src/app/RecoveryNotice.js'
import { Button } from '#src/button/Button.js'
import { CalendarView } from '#src/calendar/CalendarView.js'
import { shiftMonth } from '#src/calendar/calendar.js'
import { toIsoDate, type IsoDate } from '#src/date/iso-date.js'
import { DayTagMenu } from '#src/day/DayTagMenu.js'
import { DayLogService } from '#src/day/day-log.service.js'
import { readDay, writeDay } from '#src/day/day-log.js'
import type { DayEntry } from '#src/day/day.model.js'
import { inject } from '#src/di/di.js'
import { registerServiceWorker } from '#src/pwa/service-worker.js'
import { Store } from '#src/store/store.js'
import { TagConfigMenu } from '#src/tag/TagConfigMenu.js'
import { TagConfigService } from '#src/tag/tag-config.service.js'
import type { TagConfig } from '#src/tag/tag.model.js'
import { createSignal, onMount, Show, type JSX } from 'solid-js'

/** The whole app. Opens on today's tags, with the calendar behind. */
export function App(): JSX.Element {
  const store = inject(Store)
  const [unreadable, setUnreadable] = createSignal<Unreadable | undefined>()

  onMount(() => {
    registerServiceWorker()

    const tags = inject(TagConfigService).load()
    const days = inject(DayLogService).load()

    if (tags.status === 'unreadable') {
      setUnreadable({ what: 'tag configuration', reason: tags.reason, raw: tags.raw })

      return
    }

    if (days.status === 'unreadable') {
      setUnreadable({ what: 'day log', reason: days.reason, raw: days.raw })

      return
    }

    if (tags.status === 'ok') {
      store.set('tagConfig', tags.value)
    }

    if (days.status === 'ok') {
      store.set('dayLog', days.value)
    }

    store.set('openMenu', 'day')
  })

  function entryFor(date: IsoDate): DayEntry {
    return readDay(store.get('dayLog'), date)
  }

  function saveDay(entry: DayEntry): void {
    const log = writeDay(store.get('dayLog'), entry)

    store.set('dayLog', log)
    inject(DayLogService).save(log)
    store.set('openMenu', undefined)
  }

  function saveTags(config: TagConfig): void {
    store.set('tagConfig', config)
    inject(TagConfigService).save(config)
    store.set('openMenu', undefined)
  }

  function openDay(date: IsoDate): void {
    store.set('selectedDate', date)
    store.set('openMenu', 'day')
  }

  function discard(): void {
    inject(TagConfigService).save(store.get('tagConfig'))
    inject(DayLogService).save(store.get('dayLog'))
    setUnreadable(undefined)
    store.set('openMenu', 'day')
  }

  return (
    <Show
      when={unreadable()}
      fallback={
        <main class={styles.app}>
          <div class={styles.bar}>
            <h1 class={styles.title}>Day Tagger</h1>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                store.set('openMenu', 'tags')
              }}
            >
              Tags
            </Button>
          </div>

          <CalendarView
            month={store.get('month')}
            tags={store.get('tagConfig').tags}
            days={store.get('dayLog').days}
            today={toIsoDate(new Date())}
            onSelectDay={openDay}
            onShiftMonth={(delta) => {
              store.update('month', (current) => shiftMonth(current, delta))
            }}
          />

          <DayTagMenu
            open={store.get('openMenu') === 'day'}
            date={store.get('selectedDate')}
            tags={store.get('tagConfig').tags}
            entry={entryFor(store.get('selectedDate'))}
            onSave={saveDay}
            onClose={() => {
              store.set('openMenu', undefined)
            }}
          />

          <TagConfigMenu
            open={store.get('openMenu') === 'tags'}
            config={store.get('tagConfig')}
            log={store.get('dayLog')}
            onSave={saveTags}
            onClose={() => {
              store.set('openMenu', undefined)
            }}
          />
        </main>
      }
    >
      {(problem) => (
        <RecoveryNotice
          what={problem().what}
          reason={problem().reason}
          raw={problem().raw}
          onDiscard={discard}
        />
      )}
    </Show>
  )
}

interface Unreadable {
  what: string
  reason: string
  raw: string
}
