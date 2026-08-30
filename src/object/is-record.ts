/** Narrows an unknown value to a plain keyed object. Arrays and null are rejected. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
