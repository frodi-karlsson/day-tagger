/** Successive multiples of this land far apart on the colour wheel. */
const goldenAngle = 137.508

/**
 * Picks a hue for a new tag. Walking the wheel by the golden angle keeps tags created in a
 * row visibly distinct, rather than the near duplicates a hash tends to produce.
 */
export function nextHue(existingTagCount: number): number {
  return Math.round((existingTagCount * goldenAngle) % 360)
}

export function isHue(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value < 360
}
