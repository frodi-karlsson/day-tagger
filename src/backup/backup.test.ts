import { backupFilename, buildBackup, describeBackup, readBackup } from '#src/backup/backup.js'
import type { IsoDate } from '#src/date/iso-date.js'
import type { DayEntry, DayLog } from '#src/day/day.model.js'
import type { ChoiceId, Tag, TagConfig, TagId } from '#src/tag/tag.model.js'
import { describe, expect, test } from 'vitest'

const now = new Date(2026, 7, 30, 14, 30)

describe('buildBackup', () => {
  test('should carry the tags and the days', () => {
    const backup = buildBackup(config(), log(), now)

    expect(backup.tagConfig).toEqual(config())
    expect(backup.dayLog).toEqual(log())
  })

  test('should stamp the format version', () => {
    expect(buildBackup(config(), log(), now).formatVersion).toBe(1)
  })

  test('should record when it was taken', () => {
    expect(buildBackup(config(), log(), now).exportedAt).toBe(now.toISOString())
  })
})

describe('backupFilename', () => {
  test('should name the file after the day it was taken', () => {
    expect(backupFilename(now)).toBe('day-tagger-2026-08-30.json')
  })
})

describe('readBackup', () => {
  test('should read back what was written', () => {
    const text = JSON.stringify(buildBackup(config(), log(), now))

    expect(readBackup(text)).toEqual({ status: 'ok', backup: buildBackup(config(), log(), now) })
  })

  test('should refuse text that is not json', () => {
    expect(readBackup('{')).toEqual({ status: 'invalid', reason: 'it is not valid JSON' })
  })

  test('should refuse json that is not an object', () => {
    expect(readBackup('[]')).toMatchObject({ status: 'invalid' })
  })

  test('should refuse a format it does not read', () => {
    const text = JSON.stringify({ ...buildBackup(config(), log(), now), formatVersion: 99 })

    expect(readBackup(text)).toEqual({
      status: 'invalid',
      reason: 'it is format 99, and this version reads 1',
    })
  })

  test('should refuse tags it cannot read', () => {
    const broken = {
      ...buildBackup(config(), log(), now),
      tagConfig: { schemaVersion: 1, tags: 'no' },
    }
    const text = JSON.stringify(broken)

    expect(readBackup(text)).toEqual({
      status: 'invalid',
      reason: 'the tags in it could not be read',
    })
  })

  test('should refuse days it cannot read', () => {
    const broken = { ...buildBackup(config(), log(), now), dayLog: { schemaVersion: 1, days: [] } }
    const text = JSON.stringify(broken)

    expect(readBackup(text)).toEqual({
      status: 'invalid',
      reason: 'the days in it could not be read',
    })
  })

  test('should tolerate a missing timestamp', () => {
    const { exportedAt, ...rest } = buildBackup(config(), log(), now)

    expect(exportedAt).not.toBe('')
    expect(readBackup(JSON.stringify(rest))).toMatchObject({ status: 'ok' })
  })
})

describe('describeBackup', () => {
  test('should count tags and days', () => {
    expect(describeBackup(buildBackup(config(), log(), now))).toBe('1 tag and 1 tagged day')
  })

  test('should say it in the plural', () => {
    const two = { ...config(), tags: [tag('a'), tag('b')] }

    expect(describeBackup(buildBackup(two, emptyLog(), now))).toBe('2 tags and 0 tagged days')
  })
})

function tag(id: string): Tag {
  return { id: id as TagId, label: id, hue: 40, active: true }
}

function config(): TagConfig {
  return { schemaVersion: 1, tags: [tag('walked')] }
}

function log(): DayLog {
  const entry: DayEntry = {
    date: '2026-08-30' as IsoDate,
    answers: { walked: [] } as Record<TagId, ChoiceId[]>,
  }

  return { schemaVersion: 1, days: { '2026-08-30': entry } as Record<IsoDate, DayEntry> }
}

function emptyLog(): DayLog {
  return { schemaVersion: 1, days: {} }
}
