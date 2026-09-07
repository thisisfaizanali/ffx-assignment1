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
  setRoute: (route) => set({ route, progress: 0, status: 'running' }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setSpeed: (speed) => set({ speed }),
  reset: () => set({ progress: 0, status: 'running' }),
}))
