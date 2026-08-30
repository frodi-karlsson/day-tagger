/** The colour a tag is shown in. Lightness and chroma come from the theme, the hue from the tag. */
export function swatchColor(hue: number): string {
  return `oklch(var(--tag-lightness) var(--tag-chroma) ${String(hue)})`
}
