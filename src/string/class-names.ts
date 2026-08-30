/** Joins class names, dropping the ones that are absent or switched off. */
export function classNames(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}
