import styles from './ConfirmDialog.module.scss'
import { Button } from '#src/button/Button.js'
import { Dialog } from '#src/dialog/Dialog.js'
import { createEffect, createSignal, on, onCleanup, Show, type JSX } from 'solid-js'

const defaultCountdown = 3

/**
 * Asks before something that cannot be undone from the app. The confirm button waits out a
 * countdown, so it cannot be dismissed by a reflex click on the way to somewhere else.
 */
export function ConfirmDialog(props: ConfirmDialogProps): JSX.Element {
  const [remaining, setRemaining] = createSignal(0)

  createEffect(
    on(
      () => props.open,
      () => {
        if (!props.open) {
          return
        }

        const seconds = props.countdownSeconds ?? defaultCountdown

        setRemaining(seconds)

        if (seconds === 0) {
          return
        }

        const timer = setInterval(() => {
          setRemaining((left) => Math.max(left - 1, 0))
        }, 1000)

        onCleanup(() => {
          clearInterval(timer)
        })
      },
    ),
  )

  function label(): string {
    return remaining() > 0 ? `${props.confirmLabel} (${String(remaining())})` : props.confirmLabel
  }

  return (
    <Dialog
      open={props.open}
      title={props.title}
      onClose={props.onCancel}
      footer={
        <Button disabled={remaining() > 0} onClick={props.onConfirm}>
          {label()}
        </Button>
      }
    >
      <p class={styles.message}>{props.message}</p>

      <Show when={props.detail !== undefined}>
        <p class={styles.detail}>{props.detail}</p>
      </Show>
    </Dialog>
  )
}

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  detail?: string
  confirmLabel: string
  /** Seconds before the confirm button becomes usable. */
  countdownSeconds?: number
  onConfirm: () => void
  onCancel: () => void
}
