/** Lowercases `value` and collapses everything that is not a letter or digit into single dashes. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}
