import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { PlaybackControls } from './components/PlaybackControls'
import { RouteMap } from './components/RouteMap'
import { StatusPanel } from './components/StatusPanel'
import { StopList } from './components/StopList'
import { ThemeToggle } from './components/ThemeToggle'
import { useRoute } from './hooks/useRoute'
import { useTheme } from './hooks/useTheme'
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
      role="status"
      aria-live="polite"
      className="flex items-center gap-1.5 rounded px-2.5 py-1"
      style={{ background: 'var(--op-accent-soft)', border: '1px solid var(--op-accent-border)' }}
    >
      <div
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: 'var(--op-accent)' }}
      />
      <span
        className="font-mono text-[11px] font-medium tracking-[0.03em]"
        style={{ color: 'var(--op-accent-text)' }}
      >
        {STATUS_LABEL[status]}
      </span>
    </div>
  )
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center gap-3 px-6 text-center"
      style={{
        background: 'var(--op-bg)',
        color: 'var(--op-text)',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
      }}
    >
      {children}
    </div>
  )
}

function App() {
  const { data, loading, error, retry } = useRoute()
  const { theme, toggle: toggleTheme } = useTheme()
  const status = useSimulationStore((s) => s.status)
  const storeRoute = useSimulationStore((s) => s.route)
  const setRoute = useSimulationStore((s) => s.setRoute)
  useTruckSimulation()

  useEffect(() => {
    if (data && !storeRoute) setRoute(data)
  }, [data, storeRoute, setRoute])

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm" style={{ color: 'var(--op-text-muted)' }}>
          Loading route...
        </p>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={retry}
          className="rounded border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ borderColor: 'var(--op-border)', outlineColor: 'var(--op-accent)' }}
        >
          Retry
        </button>
      </AppShell>
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
        className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6"
        style={{ borderColor: 'var(--op-border)' }}
      >
        <div className="flex min-w-0 items-center gap-4">
          <span className="truncate text-[15px] font-semibold tracking-[-0.01em]">
            Route Visualizer
          </span>
          <div
            className="hidden h-5 w-px shrink-0 sm:block"
            style={{ background: 'var(--op-border)' }}
          />
          <span
            className="hidden font-mono text-xs whitespace-nowrap sm:block"
            style={{ color: 'var(--op-text-muted)' }}
          >
            ROUTE-2847 · BENGALURU
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <StatusPill status={status} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          role="region"
          aria-label="Route map showing truck position and delivery stops"
          className="relative h-[45vh] min-h-[280px] w-full shrink-0 lg:h-auto lg:min-h-0 lg:flex-1"
        >
          <RouteMap dark={theme === 'dark'} />
        </div>
        <aside
          className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border-t lg:w-[380px] lg:flex-none lg:border-t-0 lg:border-l"
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
