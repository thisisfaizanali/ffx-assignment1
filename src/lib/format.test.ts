import { describe, expect, it } from 'vitest'
import { formatCoord, formatEta } from './format'

describe('formatCoord', () => {
  it('formats a positive value with the positive suffix', () => {
    expect(formatCoord(12.9698, 'N', 'S')).toBe('12.9698° N')
  })

  it('formats a negative value with the negative suffix', () => {
    expect(formatCoord(-12.9698, 'N', 'S')).toBe('12.9698° S')
  })
})

describe('formatEta', () => {
  it('shows minutes for a positive ETA', () => {
    expect(formatEta(7)).toBe('ETA 07 MIN')
  })

  it('shows ARRIVING instead of "ETA 00 MIN" once it rounds to zero', () => {
    expect(formatEta(0)).toBe('ARRIVING')
  })

  it('never shows a negative ETA', () => {
    expect(formatEta(-1)).toBe('ARRIVING')
  })
})
