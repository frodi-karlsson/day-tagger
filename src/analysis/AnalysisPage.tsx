import styles from './AnalysisPage.module.scss'
import {
  allAspects,
  aspectKey,
  describeAspect,
  sameAspect,
  type Aspect,
} from '#src/analysis/aspect.js'
import { associate, ratioOf, type Association } from '#src/analysis/association.js'
import { frequencyOf, frequencyWithinTag } from '#src/analysis/frequency.js'
import { buildSeries, type Observation } from '#src/analysis/series.js'
import { loadPersistedState, type Unreadable } from '#src/app/load-state.js'
import { Button } from '#src/button/Button.js'
import { RecoveryNotice } from '#src/app/RecoveryNotice.js'
import { toIsoDate } from '#src/date/iso-date.js'
import { inject } from '#src/di/di.js'
import { assert } from '#src/error/assert.js'
import { Store } from '#src/store/store.js'
import { classNames } from '#src/string/class-names.js'
import type { Tag } from '#src/tag/tag.model.js'
import { createSignal, For, onMount, Show, type JSX } from 'solid-js'

/** Days below this carry no weight, so the row is shown but played down. */
const thinEvidence = 5

/** How often each tag happens, and what tends to follow it. */
export function AnalysisPage(): JSX.Element {
  const store = inject(Store)
  const [unreadable, setUnreadable] = createSignal<Unreadable | undefined>()
  const [causeKey, setCauseKey] = createSignal<string | undefined>()
  const [effectKey, setEffectKey] = createSignal<string | undefined>()
  const [windowDays, setWindowDays] = createSignal(0)

  onMount(() => {
    setUnreadable(loadPersistedState(store))
  })

  function tags(): Tag[] {
    return store.get('tagConfig').tags
  }

  function aspects(): Aspect[] {
    return allAspects(tags())
  }

  function series(): Observation[] {
    return buildSeries(store.get('dayLog'), toIsoDate(new Date()))
  }

  function cause(): Aspect | undefined {
    return aspects().find((aspect) => aspectKey(aspect) === causeKey()) ?? aspects().at(0)
  }

  function effect(): Aspect | undefined {
    const chosen = aspects().find((aspect) => aspectKey(aspect) === effectKey())

    return chosen ?? aspects().find((aspect) => !isCause(aspect))
  }

  function isCause(aspect: Aspect): boolean {
    const current = cause()

    return current !== undefined && sameAspect(aspect, current)
  }

  function pairing(): Association | undefined {
    const from = cause()
    const to = effect()

    return from === undefined || to === undefined
      ? undefined
      : associate(from, to, series(), windowDays())
  }

  function ranked(): Ranked[] {
    if (cause() === undefined) {
      return []
    }

    return aspects()
      .filter((aspect) => !isCause(aspect))
      .map((aspect) => ({ aspect, association: associateWith(aspect) }))
      .sort((left, right) => strength(right.association) - strength(left.association))
  }

  function associateWith(aspect: Aspect): Association {
    const from = cause()

    assert(from !== undefined, 'Ranking asked for without a first tag.')

    return associate(from, aspect, series(), windowDays())
  }

  function swap(): void {
    const from = cause()
    const to = effect()

    if (from === undefined || to === undefined) {
      return
    }

    setCauseKey(aspectKey(to))
    setEffectKey(aspectKey(from))
  }

  function causeName(): string {
    const aspect = cause()

    return aspect === undefined ? '' : describeAspect(aspect, tags())
  }

  function effectName(): string {
    const aspect = effect()

    return aspect === undefined ? '' : describeAspect(aspect, tags())
  }

  return (
    <Show
      when={unreadable()}
      fallback={
        <main class={styles.page}>
          <div class={styles.bar}>
            <h1 class={styles.title}>Analysis</h1>

            <a class={styles.link} href="/">
              Calendar
            </a>
          </div>

          <Show
            when={aspects().length > 0 && series().length > 0}
            fallback={
              <p class={styles.empty}>
                Tag a few days first, then there will be something to read here.
              </p>
            }
          >
            <div class={styles.controls}>
              <div class={styles.control}>
                <span class={styles.label}>How does</span>

                <select
                  class={styles.field}
                  aria-label="First tag"
                  onInput={(event) => {
                    setCauseKey(event.currentTarget.value)
                  }}
                >
                  <For each={aspects()}>
                    {(aspect) => (
                      <option value={aspectKey(aspect)} selected={isCause(aspect)}>
                        {describeAspect(aspect, tags())}
                      </option>
                    )}
                  </For>
                </select>
              </div>

              <div class={styles.control}>
                <span class={styles.label}>relate to</span>

                <select
                  class={styles.field}
                  aria-label="Second tag"
                  onInput={(event) => {
                    setEffectKey(event.currentTarget.value)
                  }}
                >
                  <For each={aspects()}>
                    {(aspect) => (
                      <option
                        value={aspectKey(aspect)}
                        selected={aspectKey(aspect) === aspectKey(effect() ?? aspect)}
                      >
                        {describeAspect(aspect, tags())}
                      </option>
                    )}
                  </For>
                </select>
              </div>

              <div class={styles.control}>
                <span class={styles.label} />

                <Button variant="ghost" size="sm" onClick={swap}>
                  Swap them
                </Button>
              </div>

              <div class={styles.control}>
                <span class={styles.label}>within</span>

                <input
                  type="number"
                  class={styles.field}
                  aria-label="Days to look ahead"
                  min="0"
                  max="14"
                  value={String(windowDays())}
                  onInput={(event) => {
                    setWindowDays(Math.max(Number(event.currentTarget.value), 0))
                  }}
                />
              </div>
            </div>

            <p class={styles.summary}>{summarise(cause(), series(), tags())}</p>

            <Show when={pairing()}>
              {(association) => (
                <>
                  <p class={styles.headline}>
                    {headline(association(), cause(), effect(), tags())}
                  </p>

                  <table class={styles.table}>
                    <thead>
                      <tr>
                        <th />
                        <th>{effectName()}</th>
                        <th>not</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th>{causeName()}</th>
                        <td>{association().withCause.withEffect}</td>
                        <td>
                          {association().withCause.total - association().withCause.withEffect}
                        </td>
                      </tr>
                      <tr>
                        <th>not</th>
                        <td>{association().withoutCause.withEffect}</td>
                        <td>
                          {association().withoutCause.total - association().withoutCause.withEffect}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p class={styles.note}>
                    Counted over {association().observedDays} days that could be seen through the
                    whole window.
                  </p>
                </>
              )}
            </Show>

            <h2 class={styles.heading}>Everything else</h2>

            <ul class={styles.rows}>
              <For each={ranked()}>
                {(entry) => (
                  <li
                    class={classNames(
                      styles.row,
                      entry.association.withCause.total < thinEvidence && styles.thin,
                    )}
                  >
                    <button
                      type="button"
                      class={styles.pick}
                      onClick={() => {
                        setEffectKey(aspectKey(entry.aspect))
                      }}
                    >
                      {describeAspect(entry.aspect, tags())}
                    </button>

                    <span class={styles.difference}>{signed(entry.association.difference)}</span>
                    <span class={styles.detail}>{explain(entry.association)}</span>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </main>
      }
    >
      {(problem) => (
        <RecoveryNotice
          what={problem().what}
          reason={problem().reason}
          raw={problem().raw}
          onDiscard={() => {
            window.location.assign('/')
          }}
        />
      )}
    </Show>
  )
}

function strength(association: Association): number {
  return Math.abs(association.difference)
}

function summarise(aspect: Aspect | undefined, series: Observation[], tags: Tag[]): string {
  if (aspect === undefined) {
    return ''
  }

  const overall = frequencyOf(aspect, series)
  const withinTag = frequencyWithinTag(aspect, series)
  const name = describeAspect(aspect, tags)
  const base = `${name} on ${String(overall.days)} of ${String(overall.total)} days, ${percent(overall.ratio)}.`

  if (withinTag === undefined || withinTag.total === 0) {
    return base
  }

  return `${base} On the days that tag applied, ${percent(withinTag.ratio)}.`
}

function headline(
  association: Association,
  cause: Aspect | undefined,
  effect: Aspect | undefined,
  tags: Tag[],
): string {
  if (cause === undefined || effect === undefined) {
    return ''
  }

  const after = percent(ratioOf(association.withCause))
  const otherwise = percent(ratioOf(association.withoutCause))

  return `After ${describeAspect(cause, tags)}, ${describeAspect(effect, tags)} ${after} of the time. Otherwise ${otherwise}.`
}

function explain(association: Association): string {
  const after = percent(ratioOf(association.withCause))
  const otherwise = percent(ratioOf(association.withoutCause))
  const counts = `${String(association.withCause.withEffect)} of ${String(association.withCause.total)}`

  return `${after} after, ${otherwise} otherwise (${counts} days)`
}

function percent(ratio: number): string {
  return `${String(Math.round(ratio * 100))}%`
}

function signed(difference: number): string {
  const points = Math.round(difference * 100)

  return `${points > 0 ? '+' : ''}${String(points)}`
}

interface Ranked {
  aspect: Aspect
  association: Association
}
