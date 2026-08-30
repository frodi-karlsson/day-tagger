/** A ratio from 0 to 1 as a whole number percentage. */
export function percent(ratio: number): string {
  return `${String(Math.round(ratio * 100))}%`
}
