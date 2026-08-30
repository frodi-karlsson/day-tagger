/** Every window includes the day itself. */
export const windowChoiceList: WindowChoice[] = [
  { days: 0, label: 'on the same day' },
  { days: 1, label: 'by the next day' },
  { days: 3, label: 'within 3 days' },
  { days: 7, label: 'within a week' },
]

export interface WindowChoice {
  days: number
  label: string
}
