import { useEffect } from 'react'
import { useSimulationStore } from '../store/simulationStore'

// Full route at 1x playback speed takes this long. Deliberately compressed
// from route.averageSpeedKmh (real-world pace, used only for ETA display) so
// the animation is watchable rather than literally 30-40 real minutes long.
const BASE_DURATION_MS = 20_000

// Secondary guard against a long, non-hidden stall (e.g. a heavy main-thread
// task) contributing one huge delta. The primary defense against a
// backgrounded tab is the visibilitychange pause below - rAF itself gets
// throttled well before it stops firing, so relying on this clamp alone
// would just make the truck crawl at a fraction of real speed instead of
// jumping, which silently desyncs progress from wall clock.
const MAX_FRAME_MS = 100

/**
 * Drives the store's `progress` forward while status is 'running', using
 * wall-clock elapsed time (not a fixed tick), so pausing freezes progress
 * exactly and a speed change never jumps the truck.
 */
export function useTruckSimulation() {
  const status = useSimulationStore((s) => s.status)
  const route = useSimulationStore((s) => s.route)

  // Pause outright when the tab is backgrounded, rather than let a
  // throttled/stopped rAF desync progress from wall clock. Only pauses a
  // run in progress - never overrides a pause the user already made, and
  // never auto-resumes on return, so the truck stays exactly where it was.
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && useSimulationStore.getState().status === 'running') {
        useSimulationStore.getState().setStatus('paused')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    if (status !== 'running' || !route) return

    let rafId: number
    let last = performance.now()

    const tick = (now: number) => {
      const deltaMs = Math.min(now - last, MAX_FRAME_MS)
      last = now

      const { speed, progress } = useSimulationStore.getState()
      const next = Math.min(progress + (deltaMs * speed) / BASE_DURATION_MS, 1)
      useSimulationStore.getState().setProgress(next)

      if (next >= 1) {
        useSimulationStore.getState().setStatus('complete')
        return
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [status, route])
}
