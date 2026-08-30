import { slugify } from '#src/string/slugify.js'

/**
 * Turns a label into an id that nothing else is using. Collisions get a numeric suffix, so
 * two tags both called "Coffee" become coffee and coffee-2.
 */
export function allocateId(label: string, taken: Iterable<string>, fallback = 'item'): string {
  const slug = slugify(label)
  const base = slug === '' ? fallback : slug
  const used = new Set(taken)

  if (!used.has(base)) {
    return base
  }

  let suffix = 2

  while (used.has(`${base}-${String(suffix)}`)) {
    suffix += 1
  }

  return `${base}-${String(suffix)}`
}
