import styles from './Comparison.module.scss'
import { ratioOf, type Association, type AssociationSide } from '#src/analysis/association.js'
import { percent } from '#src/analysis/percent.js'
import { sightingsCaveat, verdictOf, verdictSentence, type Verdict } from '#src/analysis/verdict.js'
import { swatchColor } from '#src/tag/tag-swatch.js'
import { Show, type JSX } from 'solid-js'

/** One pairing, as a claim with its evidence underneath. */
export function Comparison(props: ComparisonProps): JSX.Element {
  function verdict(): Verdict {
    return verdictOf(props.association)
  }

  function caveat(): string | undefined {
    return sightingsCaveat(props.association, props.causeName)
  }

  return (
    <section class={styles.comparison}>
      <div class={styles.claim}>
        <p class={styles.verdict}>
          {verdictSentence(verdict(), props.causeName, props.effectName)}
        </p>

        <Show when={caveat()}>{(text) => <p class={styles.caveat}>{text()}</p>}</Show>
      </div>

      <Show when={verdict().kind !== 'none'}>
        <div class={styles.bars}>
          <Bar
            label={`After ${props.causeName}`}
            side={props.association.withCause}
            color={swatchColor(props.effectHue)}
          />

          <Bar
            label="Otherwise"
            side={props.association.withoutCause}
            color="var(--color-border-strong)"
          />
        </div>

        <p class={styles.note}>
          Counted over {props.association.observedDays} days that could be seen through the whole
          window.
        </p>
      </Show>
    </section>
  )
}

function Bar(props: BarProps): JSX.Element {
  function ratio(): number {
    return ratioOf(props.side)
  }

  return (
    <div class={styles.bar}>
      <span class={styles.label}>{props.label}</span>

      <span class={styles.figures}>
        <span class={styles.percent}>{percent(ratio())}</span>

        <span class={styles.count}>
          {props.side.withEffect} of {props.side.total} days
        </span>
      </span>

      <div class={styles.track} aria-hidden="true">
        <div
          class={styles.fill}
          style={{ width: percent(ratio()), 'background-color': props.color }}
        />
      </div>
    </div>
  )
}

export interface ComparisonProps {
  association: Association
  causeName: string
  effectName: string
  /** The effect's tag hue, since both bars measure the effect. */
  effectHue: number
}

interface BarProps {
  label: string
  side: AssociationSide
  color: string
}
