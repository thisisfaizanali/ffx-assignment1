export function formatCoord(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`
}

/** For a stop not yet reached. Callers handle the `null` (already arrived) case themselves. */
export function formatEta(etaMinutes: number): string {
  if (etaMinutes <= 0) return 'ARRIVING'
  return `ETA ${String(etaMinutes).padStart(2, '0')} MIN`
}
