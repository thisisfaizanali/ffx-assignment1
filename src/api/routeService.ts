import type { Route } from '../types'
import { routeFixture } from './routeFixture'

const LATENCY_MS = 600
const FAILURE_RATE = 0.05

/**
 * Simulates fetching the route from a backend: real latency, and a real
 * (random) failure rate so the app's loading/error/retry UI is genuinely
 * exercised rather than dead code.
 */
export function getRoute(): Promise<Route> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < FAILURE_RATE) {
        reject(new Error('Failed to load route. Check your connection and try again.'))
        return
      }
      resolve(routeFixture)
    }, LATENCY_MS)
  })
}
