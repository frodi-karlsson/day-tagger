import styles from './BackupMenu.module.scss'
import {
  backupFilename,
  buildBackup,
  describeBackup,
  readBackup,
  type Backup,
} from '#src/backup/backup.js'
import { Button } from '#src/button/Button.js'
import type { DayLog } from '#src/day/day.model.js'
import { ConfirmDialog } from '#src/dialog/ConfirmDialog.js'
import { Dialog } from '#src/dialog/Dialog.js'
import type { TagConfig } from '#src/tag/tag.model.js'
import { createSignal, Show, type JSX } from 'solid-js'

/** Takes a copy of everything, and puts one back. */
export function BackupMenu(props: BackupMenuProps): JSX.Element {
  const [problem, setProblem] = createSignal<string | undefined>()
  const [pending, setPending] = createSignal<Backup | undefined>()

  function save(): void {
    const now = new Date()
    const backup = buildBackup(props.config, props.log, now)
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = backupFilename(now)
    anchor.click()

    URL.revokeObjectURL(url)
  }

  async function choose(file: File | undefined): Promise<void> {
    if (file === undefined) {
      return
    }

    const result = readBackup(await file.text())

    if (result.status === 'invalid') {
      setProblem(`That file could not be used, because ${result.reason}.`)
      setPending(undefined)

      return
    }

    setProblem(undefined)
    setPending(result.backup)
  }

  function restore(): void {
    const backup = pending()

    if (backup === undefined) {
      return
    }

    setPending(undefined)
    props.onRestore(backup)
  }

  return (
    <>
      <Dialog open={props.open} title="Backup" onClose={props.onClose}>
        <section class={styles.section}>
          <h3 class={styles.heading}>Save a copy</h3>

          <p class={styles.body}>
            Everything, as one file. Keep it wherever you keep things, and note that nothing here
            leaves this device on its own.
          </p>

          <div class={styles.actions}>
            <Button onClick={save}>Save a copy</Button>
          </div>
        </section>

        <section class={styles.section}>
          <h3 class={styles.heading}>Put one back</h3>

          <p class={styles.body}>
            This replaces every tag and every tagged day with what is in the file.
          </p>

          <input
            type="file"
            class={styles.file}
            aria-label="Backup file"
            accept="application/json,.json"
            onChange={(event) => {
              void choose(event.currentTarget.files?.[0])
            }}
          />

          <Show when={problem()}>{(reason) => <p class={styles.problem}>{reason()}</p>}</Show>
        </section>
      </Dialog>

      <ConfirmDialog
        open={pending() !== undefined}
        title="Put this backup back"
        message={summarise(pending())}
        detail="Everything currently on this device is replaced. Save a copy first if you might want it."
        confirmLabel="Replace everything"
        onConfirm={restore}
        onCancel={() => {
          setPending(undefined)
        }}
      />
    </>
  )
}

function summarise(backup: Backup | undefined): string {
  return backup === undefined ? '' : `This file holds ${describeBackup(backup)}.`
}

export interface BackupMenuProps {
  open: boolean
  config: TagConfig
  log: DayLog
  onRestore: (backup: Backup) => void
  onClose: () => void
}
