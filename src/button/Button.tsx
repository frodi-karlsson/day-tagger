import styles from './Button.module.scss'
import { splitProps, type JSX } from 'solid-js'

export function Button(props: ButtonProps): JSX.Element {
  const [local, rest] = splitProps(props, ['variant', 'size', 'class', 'children'])

  function classes(): string {
    const variant = styles[local.variant ?? 'primary']
    const size = styles[local.size ?? 'md']
    const classNames = [styles.button, variant, size, local.class]

    return classNames.filter(Boolean).join(' ')
  }

  return (
    <button type="button" {...rest} class={classes()}>
      {local.children}
    </button>
  )
}

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  variant?: ButtonVariant
}

export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
