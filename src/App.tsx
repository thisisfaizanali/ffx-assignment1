import { useEffect } from 'react'
import { PlaybackControls } from './components/PlaybackControls'
import { RouteMap } from './components/RouteMap'
import { StatusPanel } from './components/StatusPanel'
import { StopList } from './components/StopList'
import { useRoute } from './hooks/useRoute'
import { useTruckSimulation } from './hooks/useTruckSimulation'
import { useSimulationStore } from './store/simulationStore'
import type { SimStatus } from './types'

const STATUS_LABEL: Record<SimStatus, string> = {
  idle: 'STANDBY',
  loading: 'STANDBY',
  running: 'IN TRANSIT',
  paused: 'PAUSED',
  complete: 'DELIVERED',
}

function StatusPill({ status }: { status: SimStatus }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded px-2.5 py-1"
      style={{ background: 'var(--op-accent-soft)', border: '1px solid var(--op-accent-border)' }}
    >
      <div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--op-accent)' }} />
      <span
        className="font-mono text-[11px] font-medium tracking-[0.03em]"
        style={{ color: 'var(--op-accent-text)' }}
      >
        {STATUS_LABEL[status]}
      </span>
    </div>
  )
}

function App() {
  const { data, loading, error, retry } = useRoute()
  const status = useSimulationStore((s) => s.status)
  const storeRoute = useSimulationStore((s) => s.route)
  const setRoute = useSimulationStore((s) => s.setRoute)
  useTruckSimulation()

  useEffect(() => {
    if (data && !storeRoute) setRoute(data)
  }, [data, storeRoute, setRoute])

  if (loading) return <p className="p-6">Loading route...</p>

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={retry} className="mt-2 rounded border px-3 py-1">
          Retry
        </button>
      </div>
    )
  }

  if (!storeRoute) return null

  return (
    <div
      className="flex h-screen w-screen flex-col"
      style={{
        background: 'var(--op-bg)',
        color: 'var(--op-text)',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}
    >
      <header
        className="flex h-16 shrink-0 items-center justify-between border-b px-6"
        style={{ borderColor: 'var(--op-border)' }}
      >
        <div className="flex items-center gap-4">
          <span className="text-[15px] font-semibold tracking-[-0.01em]">Route Visualizer</span>
          <div className="h-5 w-px" style={{ background: 'var(--op-border)' }} />
          <span className="font-mono text-xs" style={{ color: 'var(--op-text-muted)' }}>
            ROUTE-2847 · BENGALURU
          </span>
        </div>
        <StatusPill status={status} />
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="relative flex-1">
          <RouteMap />
        </div>
        <aside
          className="flex w-[380px] shrink-0 flex-col overflow-hidden border-l"
          style={{ borderColor: 'var(--op-border)' }}
        >
          <StatusPanel />
          <StopList />
          <PlaybackControls />
        </aside>
      </div>
    </div>
  )
}

export default App
