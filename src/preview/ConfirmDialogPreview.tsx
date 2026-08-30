import { ConfirmDialog } from '#src/dialog/ConfirmDialog.js'
import { createSignal, type JSX } from 'solid-js'

/** Holds the open state ConfirmDialog needs, so the preview page passes plain props. */
export function ConfirmDialogPreview(props: ConfirmDialogPreviewProps): JSX.Element {
  const [open, setOpen] = createSignal(true)

  function close(): void {
    setOpen(false)
  }

  return (
    <ConfirmDialog
      open={open()}
      title={props.title}
      message={props.message}
      detail={props.detail}
      confirmLabel={props.confirmLabel}
      countdownSeconds={props.countdownSeconds}
      onConfirm={close}
      onCancel={close}
    />
  )
}

export interface ConfirmDialogPreviewProps {
  title: string
  message: string
  detail?: string
  confirmLabel: string
  countdownSeconds?: number
}
