import type { LatLng, Route } from '../types'

const EARTH_RADIUS_KM = 6371

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/** Great-circle distance between two points, in kilometers. */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/** All points on the route in path order: origin, then each stop. */
export function pathPoints(route: Route): LatLng[] {
  return [route.origin, ...route.stops]
}

/** Distance of each leg (origin to D1, D1 to D2, ...), in kilometers. */
export function legDistancesKm(route: Route): number[] {
  const points = pathPoints(route)
  const legs: number[] = []
  for (let i = 1; i < points.length; i++) {
    legs.push(haversineKm(points[i - 1], points[i]))
  }
  return legs
}

/** Total path length, in kilometers. */
export function totalDistanceKm(route: Route): number {
  return legDistancesKm(route).reduce((sum, d) => sum + d, 0)
}

export interface PointOnPath {
  position: LatLng
  legIndex: number
  distanceCoveredKm: number
}

/**
 * Point at fraction `progress` (0..1) along the full path, interpolated
 * linearly within the leg it falls on.
 */
export function pointAlongPath(route: Route, progress: number): PointOnPath {
  const points = pathPoints(route)
  const legs = legDistancesKm(route)
  const total = legs.reduce((sum, d) => sum + d, 0)
  const clamped = Math.min(Math.max(progress, 0), 1)
  const targetKm = clamped * total

  let distanceSoFar = 0
  for (let i = 0; i < legs.length; i++) {
    const legLength = legs[i]
    if (targetKm <= distanceSoFar + legLength || i === legs.length - 1) {
      const legProgress = legLength === 0 ? 1 : (targetKm - distanceSoFar) / legLength
      const from = points[i]
      const to = points[i + 1]
      return {
        position: {
          lat: from.lat + (to.lat - from.lat) * legProgress,
          lng: from.lng + (to.lng - from.lng) * legProgress,
        },
        legIndex: i,
        distanceCoveredKm: targetKm,
      }
    }
    distanceSoFar += legLength
  }

  // Unreachable when legs.length > 0, kept for type safety.
  return { position: points[0], legIndex: 0, distanceCoveredKm: 0 }
}
