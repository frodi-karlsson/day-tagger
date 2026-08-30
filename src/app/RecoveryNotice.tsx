import styles from './RecoveryNotice.module.scss'
import { Button } from '#src/button/Button.js'
import { ConfirmDialog } from '#src/dialog/ConfirmDialog.js'
import { createSignal, type JSX } from 'solid-js'

/**
 * Shown instead of the app when stored data cannot be read. Nothing is written while this is
 * up, so the data is still on the device and can be copied out before anything replaces it.
 */
export function RecoveryNotice(props: RecoveryNoticeProps): JSX.Element {
  const [confirming, setConfirming] = createSignal(false)

  function discard(): void {
    setConfirming(false)
    props.onDiscard()
  }

  return (
    <section class={styles.notice}>
      <h1 class={styles.title}>Your saved data could not be read</h1>

      <p class={styles.body}>
        The {props.what} on this device could not be read, because {props.reason}. Nothing has been
        changed or deleted. Copy the text below and send it on before starting again, and it may be
        possible to recover.
      </p>

      <pre class={styles.raw}>{props.raw}</pre>

      <div class={styles.actions}>
        <Button
          variant="secondary"
          onClick={() => {
            setConfirming(true)
          }}
        >
          Start again
        </Button>
      </div>

      <ConfirmDialog
        open={confirming()}
        title="Start again"
        message="This erases the data that could not be read."
        detail="Make sure you have copied it somewhere first. This cannot be undone."
        confirmLabel="Erase and start again"
        onConfirm={discard}
        onCancel={() => {
          setConfirming(false)
        }}
      />
    </section>
  )
}

export interface RecoveryNoticeProps {
  what: string
  reason: string
  raw: string
  onDiscard: () => void
}
