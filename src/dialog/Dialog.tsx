import styles from './Dialog.module.scss'
import { Button } from '#src/button/Button.js'
import { createEffect, createSignal, Show, type JSX } from 'solid-js'

/**
 * A modal built on the native dialog element, which supplies the backdrop, escape to close
 * and focus containment. Closing by any route reports through onClose, so the caller's state
 * cannot drift out of step with what is on screen.
 */
export function Dialog(props: DialogProps): JSX.Element {
  const [element, setElement] = createSignal<HTMLDialogElement>()

  createEffect(() => {
    const dialog = element()

    if (dialog === undefined) {
      return
    }

    if (props.open && !dialog.open) {
      dialog.showModal()
    }

    if (!props.open && dialog.open) {
      dialog.close()
    }
  })

  function close(): void {
    props.onClose()
  }

  function back(): void {
    props.onBack?.()
  }

  return (
    <dialog
      ref={(dialog) => {
        setElement(dialog)
      }}
      class={styles.dialog}
      onClose={close}
    >
      <div class={styles.header}>
        <Show when={props.onBack !== undefined}>
          <Button variant="ghost" size="sm" aria-label="Back" onClick={back}>
            ‹
          </Button>
        </Show>

        <h2 class={styles.title}>{props.title}</h2>

        <Button variant="ghost" size="sm" aria-label="Close" onClick={close}>
          ✕
        </Button>
      </div>

      <div class={styles.body}>{props.children}</div>

      <Show when={props.footer !== undefined}>
        <div class={styles.footer}>{props.footer}</div>
      </Show>
    </dialog>
  )
}

export interface DialogProps {
  open: boolean
  title: string
  onClose: () => void
  /** When given, the header offers a way back to whatever opened this view. */
  onBack?: () => void
  children?: JSX.Element
  /** Sits below the body and stays put while it scrolls. */
  footer?: JSX.Element
}
