import type { Route } from '../types'

// Real Bengaluru coordinates, roughly along the Whitefield to Jayanagar corridor.
export const routeFixture: Route = {
  origin: { id: 'origin', label: 'Whitefield Hub', lat: 12.9698, lng: 77.75 },
  stops: [
    { id: 'D1', label: 'Marathahalli', lat: 12.9569, lng: 77.7011 },
    { id: 'D2', label: 'Koramangala', lat: 12.9352, lng: 77.6245 },
    { id: 'D3', label: 'Jayanagar', lat: 12.925, lng: 77.5938 },
  ],
  averageSpeedKmh: 30,
}
