import { CalendarView } from '#src/calendar/CalendarView.js'
import { shiftMonth, type MonthRef } from '#src/calendar/calendar.js'
import type { IsoDate } from '#src/date/iso-date.js'
import type { DayEntry } from '#src/day/day.model.js'
import type { Tag } from '#src/tag/tag.model.js'
import { createSignal, type JSX } from 'solid-js'

/** Holds the month state CalendarView needs, so the preview page passes plain props. */
export function CalendarViewPreview(props: CalendarViewPreviewProps): JSX.Element {
  const [month, setMonth] = createSignal<MonthRef>(props.initialMonth)

  function shift(delta: number): void {
    setMonth((current) => shiftMonth(current, delta))
  }

  return (
    <CalendarView
      month={month()}
      tags={props.tags}
      days={props.days}
      today={props.today}
      onSelectDay={() => undefined}
      onShiftMonth={shift}
    />
  )
}

export interface CalendarViewPreviewProps {
  initialMonth: MonthRef
  tags: Tag[]
  days: Record<IsoDate, DayEntry>
  today: IsoDate
}
