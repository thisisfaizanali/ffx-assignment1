import { useEffect } from 'react'
import { useSimulationStore } from '../store/simulationStore'

// Full route at 1x playback speed takes this long. Deliberately compressed
// from route.averageSpeedKmh (real-world pace, used only for ETA display) so
// the animation is watchable rather than literally 30-40 real minutes long.
const BASE_DURATION_MS = 20_000

// requestAnimationFrame stops firing entirely while the tab is backgrounded.
// Without a cap, the first frame after the tab regains visibility sees a
// huge deltaMs and teleports the truck straight to wherever it "should" be -
// clamping treats a long gap as an implicit pause instead.
const MAX_FRAME_MS = 100

/**
 * Drives the store's `progress` forward while status is 'running', using
 * wall-clock elapsed time (not a fixed tick), so pausing freezes progress
 * exactly and a speed change never jumps the truck.
 */
export function useTruckSimulation() {
  const status = useSimulationStore((s) => s.status)
  const route = useSimulationStore((s) => s.route)

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
