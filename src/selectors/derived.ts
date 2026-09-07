import { useMemo } from 'react'
import { legDistancesKm, pointAlongPath, totalDistanceKm } from '../lib/geo'
import { useSimulationStore } from '../store/simulationStore'
import type { Route, Stop } from '../types'

export type StopStatus = 'done' | 'active' | 'pending'

export interface StopProgress {
  stop: Stop
  status: StopStatus
  distanceFromStartKm: number
  etaMinutes: number | null // null once done
}

/** Number of stops the truck has fully reached. */
export function getCompletedCount(route: Route, progress: number): number {
  const { distanceCoveredKm } = pointAlongPath(route, progress)
  const legs = legDistancesKm(route)
  let completed = 0
  let cumulative = 0
  for (const leg of legs) {
    cumulative += leg
    if (distanceCoveredKm >= cumulative - 1e-9) completed++
  }
  return completed
}

export function getNextStop(route: Route, progress: number): Stop | null {
  return route.stops[getCompletedCount(route, progress)] ?? null
}

/** Per-stop status, cumulative distance and ETA, in route order. */
export function getStopsProgress(route: Route, progress: number): StopProgress[] {
  const legs = legDistancesKm(route)
  const completed = getCompletedCount(route, progress)
  const { distanceCoveredKm } = pointAlongPath(route, progress)

  let cumulative = 0
  return route.stops.map((stop, i) => {
    cumulative += legs[i]
    const status: StopStatus = i < completed ? 'done' : i === completed ? 'active' : 'pending'
    const remainingKm = Math.max(cumulative - distanceCoveredKm, 0)
    const etaMinutes =
      status === 'done' ? null : Math.round((remainingKm / route.averageSpeedKmh) * 60)
    return { stop, status, distanceFromStartKm: cumulative, etaMinutes }
  })
}

function useRouteAndProgress() {
  const route = useSimulationStore((s) => s.route)
  const progress = useSimulationStore((s) => s.progress)
  return { route, progress }
}

export function useCurrentPoint() {
  const { route, progress } = useRouteAndProgress()
  return useMemo(() => (route ? pointAlongPath(route, progress) : null), [route, progress])
}

export function useDistanceCovered() {
  const { route, progress } = useRouteAndProgress()
  return useMemo(
    () => ({
      coveredKm: route ? pointAlongPath(route, progress).distanceCoveredKm : 0,
      totalKm: route ? totalDistanceKm(route) : 0,
    }),
    [route, progress],
  )
}

export function useCompletedCount() {
  const { route, progress } = useRouteAndProgress()
  return useMemo(() => (route ? getCompletedCount(route, progress) : 0), [route, progress])
}

export function useNextStop() {
  const { route, progress } = useRouteAndProgress()
  return useMemo(() => (route ? getNextStop(route, progress) : null), [route, progress])
}

export function useStopsProgress() {
  const { route, progress } = useRouteAndProgress()
  return useMemo(() => (route ? getStopsProgress(route, progress) : []), [route, progress])
}
