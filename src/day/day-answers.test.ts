import type { IsoDate } from '#src/date/iso-date.js'
import { setAnswers } from '#src/day/day-answers.js'
import type { DayEntry } from '#src/day/day.model.js'
import type { ChoiceId, TagId } from '#src/tag/tag.model.js'
import { expect, test } from 'vitest'

const today = '2026-08-30' as IsoDate
const alcohol = 'alcohol' as TagId
const walked = 'walked' as TagId
const wine = 'wine' as ChoiceId

test('should apply a tag with its answers', () => {
  const next = setAnswers(empty(), alcohol, [wine])

  expect(next.answers[alcohol]).toEqual([wine])
})

test('should apply a tag with no answers', () => {
  const next = setAnswers(empty(), walked, [])

  expect(next.answers[walked]).toEqual([])
})

test('should replace answers already set', () => {
  const applied = setAnswers(empty(), alcohol, [wine])

  expect(setAnswers(applied, alcohol, []).answers[alcohol]).toEqual([])
})

test('should remove the tag when answers are undefined', () => {
  const applied = setAnswers(empty(), alcohol, [wine])

  expect(setAnswers(applied, alcohol, undefined).answers).toEqual({})
})

test('should leave other tags alone when removing', () => {
  const applied = setAnswers(setAnswers(empty(), alcohol, [wine]), walked, [])

  expect(setAnswers(applied, alcohol, undefined).answers).toEqual({ walked: [] })
})

test('should keep the date', () => {
  expect(setAnswers(empty(), alcohol, [wine]).date).toBe(today)
})

test('should not mutate the entry it is given', () => {
  const entry = empty()

  setAnswers(entry, alcohol, [wine])

  expect(entry.answers).toEqual({})
})

function empty(): DayEntry {
  return { date: today, answers: {} }
}
