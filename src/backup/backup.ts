import { toIsoDate } from '#src/date/iso-date.js'
import { isDayLog } from '#src/day/day.guard.js'
import type { DayLog } from '#src/day/day.model.js'
import { isRecord } from '#src/object/is-record.js'
import { isTagConfig } from '#src/tag/tag.guard.js'
import type { TagConfig } from '#src/tag/tag.model.js'

const formatVersion = 1

/** Everything the app knows, in one file the reader owns and can keep wherever they like. */
export function buildBackup(tagConfig: TagConfig, dayLog: DayLog, now: Date): Backup {
  return { formatVersion, exportedAt: now.toISOString(), tagConfig, dayLog }
}

export function backupFilename(now: Date): string {
  return `day-tagger-${toIsoDate(now)}.json`
}

/**
 * Reads a file back. Anything it cannot vouch for is refused with a reason rather than half
 * applied, because restoring a backup replaces what is already there.
 */
export function readBackup(text: string): BackupResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    return { status: 'invalid', reason: 'it is not valid JSON' }
  }

  if (!isRecord(parsed)) {
    return { status: 'invalid', reason: 'it is not a backup file' }
  }

  if (parsed.formatVersion !== formatVersion) {
    return {
      status: 'invalid',
      reason: `it is format ${String(parsed.formatVersion)}, and this version reads ${String(formatVersion)}`,
    }
  }

  if (!isTagConfig(parsed.tagConfig)) {
    return { status: 'invalid', reason: 'the tags in it could not be read' }
  }

  if (!isDayLog(parsed.dayLog)) {
    return { status: 'invalid', reason: 'the days in it could not be read' }
  }

  return {
    status: 'ok',
    backup: {
      formatVersion,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
      tagConfig: parsed.tagConfig,
      dayLog: parsed.dayLog,
    },
  }
}

/** How much a restore would replace, so it can be said out loud before it happens. */
export function describeBackup(backup: Backup): string {
  const tags = backup.tagConfig.tags.length
  const days = Object.keys(backup.dayLog.days).length

  return `${String(tags)} ${tags === 1 ? 'tag' : 'tags'} and ${String(days)} tagged ${days === 1 ? 'day' : 'days'}`
}

export interface Backup {
  formatVersion: number
  exportedAt: string
  tagConfig: TagConfig
  dayLog: DayLog
}

export type BackupResult = { status: 'ok'; backup: Backup } | { status: 'invalid'; reason: string }
