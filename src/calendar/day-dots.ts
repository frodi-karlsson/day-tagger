import type { DayEntry } from '#src/day/day.model.js'
import type { Tag } from '#src/tag/tag.model.js'

const defaultLimit = 4

/**
 * The dots a calendar cell should show for a day. A cell is too small for a dot per tag, so
 * the rest are reported as an overflow count rather than dropped silently.
 */
export function dayDots(tags: Tag[], entry: DayEntry | undefined, limit = defaultLimit): DayDots {
  if (entry === undefined) {
    return { hues: [], overflow: 0 }
  }

  const applied = tags.filter((tag) => tag.id in entry.answers)

  return {
    hues: applied.slice(0, limit).map((tag) => tag.hue),
    overflow: Math.max(applied.length - limit, 0),
  }
}

export interface DayDots {
  hues: number[]
  overflow: number
}
