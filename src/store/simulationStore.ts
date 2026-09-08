import { create } from 'zustand'
import type { Route, SimStatus } from '../types'

interface SimulationState {
  status: SimStatus
  progress: number // 0..1 along the full path
  speed: number // playback multiplier
  route: Route | null
  setRoute: (route: Route) => void
  setStatus: (status: SimStatus) => void
  setProgress: (progress: number) => void
  setSpeed: (speed: number) => void
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  status: 'idle',
  progress: 0,
  speed: 1,
  route: null,
  // Autoplay on load - the one case where forcing 'running' is correct.
  setRoute: (route) => set({ route, progress: 0, status: 'running' }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setSpeed: (speed) => set({ speed }),
  // Returns to the origin without implying "reset" also means "play": it
  // preserves whatever status the truck was in, except 'complete' (nothing
  // to preserve there), which becomes 'paused'. The Restart control wants
  // reset-and-play; it calls setStatus('running') itself after this.
  reset: () =>
    set((state) => ({
      progress: 0,
      status: state.status === 'complete' ? 'paused' : state.status,
    })),
}))
