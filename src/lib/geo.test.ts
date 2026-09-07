import { describe, expect, it } from 'vitest'
import { routeFixture } from '../api/routeFixture'
import { haversineKm, legDistancesKm, pointAlongPath, totalDistanceKm } from './geo'

describe('haversineKm', () => {
  it('is zero for the same point', () => {
    expect(haversineKm(routeFixture.origin, routeFixture.origin)).toBe(0)
  })

  it('matches a known distance (Whitefield to Marathahalli, ~6km)', () => {
    const km = haversineKm(routeFixture.origin, routeFixture.stops[0])
    expect(km).toBeGreaterThan(4)
    expect(km).toBeLessThan(8)
  })
})

describe('legDistancesKm / totalDistanceKm', () => {
  it('sums leg distances to the total', () => {
    const legs = legDistancesKm(routeFixture)
    const total = totalDistanceKm(routeFixture)
    expect(legs.reduce((a, b) => a + b, 0)).toBeCloseTo(total, 6)
  })

  it('has one leg per stop', () => {
    expect(legDistancesKm(routeFixture)).toHaveLength(routeFixture.stops.length)
  })
})

describe('pointAlongPath', () => {
  it('is the origin at progress 0', () => {
    const { position, legIndex, distanceCoveredKm } = pointAlongPath(routeFixture, 0)
    expect(position).toEqual({ lat: routeFixture.origin.lat, lng: routeFixture.origin.lng })
    expect(legIndex).toBe(0)
    expect(distanceCoveredKm).toBe(0)
  })

  it('is the last stop at progress 1', () => {
    const lastStop = routeFixture.stops[routeFixture.stops.length - 1]
    const { position, distanceCoveredKm } = pointAlongPath(routeFixture, 1)
    expect(position.lat).toBeCloseTo(lastStop.lat, 6)
    expect(position.lng).toBeCloseTo(lastStop.lng, 6)
    expect(distanceCoveredKm).toBeCloseTo(totalDistanceKm(routeFixture), 6)
  })

  it('clamps out-of-range progress', () => {
    expect(pointAlongPath(routeFixture, -1).distanceCoveredKm).toBe(0)
    expect(pointAlongPath(routeFixture, 2).distanceCoveredKm).toBeCloseTo(
      totalDistanceKm(routeFixture),
      6,
    )
  })
})
