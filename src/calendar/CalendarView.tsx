import styles from './CalendarView.module.scss'
import { Button } from '#src/button/Button.js'
import {
  buildMonth,
  type CalendarDay,
  type CalendarMonth,
  type MonthRef,
} from '#src/calendar/calendar.js'
import { dayDots, type DayDots } from '#src/calendar/day-dots.js'
import { fromIsoDate, type IsoDate } from '#src/date/iso-date.js'
import type { DayEntry } from '#src/day/day.model.js'
import type { Tag } from '#src/tag/tag.model.js'
import { For, Show, type JSX } from 'solid-js'

/** A month of days, each carrying a dot for every tag applied to it. */
export function CalendarView(props: CalendarViewProps): JSX.Element {
  function month(): CalendarMonth {
    return buildMonth(props.month)
  }

  function weekdays(): string[] {
    const week = month().weeks[0] ?? []

    return week.map((day) => weekdayFormat.format(fromIsoDate(day.date)))
  }

  function dotsFor(date: IsoDate): DayDots {
    return dayDots(props.tags, props.days[date])
  }

  function cellClass(day: CalendarDay): string {
    const names = [styles.cell]

    if (!day.inMonth) {
      names.push(styles.outside)
    }

    if (day.date === props.today) {
      names.push(styles.today)
    }

    return names.join(' ')
  }

  return (
    <section class={styles.calendar}>
      <header class={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Previous month"
          onClick={() => {
            props.onShiftMonth(-1)
          }}
        >
          ‹
        </Button>

        <h2 class={styles.title}>{monthFormat.format(fromIsoDate(firstDay(props.month)))}</h2>

        <Button
          variant="ghost"
          size="sm"
          aria-label="Next month"
          onClick={() => {
            props.onShiftMonth(1)
          }}
        >
          ›
        </Button>
      </header>

      <div class={styles.weekdays}>
        <For each={weekdays()}>{(label) => <span class={styles.weekday}>{label}</span>}</For>
      </div>

      <div class={styles.grid}>
        <For each={month().weeks.flat()}>
          {(day) => (
            <button
              type="button"
              class={cellClass(day)}
              onClick={() => {
                props.onSelectDay(day.date)
              }}
            >
              <span>{day.dayOfMonth}</span>

              <span class={styles.dots}>
                <For each={dotsFor(day.date).hues}>
                  {(hue) => (
                    <span class={styles.dot} style={{ 'background-color': dotColor(hue) }} />
                  )}
                </For>

                <Show when={dotsFor(day.date).overflow > 0}>
                  <span class={styles.overflow}>+{dotsFor(day.date).overflow}</span>
                </Show>
              </span>
            </button>
          )}
        </For>
      </div>
    </section>
  )
}

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })

function firstDay(month: MonthRef): IsoDate {
  const padded = String(month.month).padStart(2, '0')

  return `${String(month.year)}-${padded}-01` as IsoDate
}

function dotColor(hue: number): string {
  return `oklch(var(--tag-lightness) var(--tag-chroma) ${String(hue)})`
}

export interface CalendarViewProps {
  month: MonthRef
  tags: Tag[]
  days: Record<IsoDate, DayEntry>
  today: IsoDate
  onSelectDay: (date: IsoDate) => void
  onShiftMonth: (delta: number) => void
}
