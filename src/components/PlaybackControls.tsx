import { useSimulationStore } from '../store/simulationStore'

const SPEEDS = [1, 2, 4] as const

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="4" width="5" height="16" rx="1" />
      <rect x="14" y="4" width="5" height="16" rx="1" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--op-text-dim)"
      strokeWidth="2"
    >
      <path d="M3 12a9 9 0 1 1 3 6.7" />
      <path d="M3 4v6h6" />
    </svg>
  )
}

export function PlaybackControls() {
  const status = useSimulationStore((s) => s.status)
  const speed = useSimulationStore((s) => s.speed)
  const setStatus = useSimulationStore((s) => s.setStatus)
  const setSpeed = useSimulationStore((s) => s.setSpeed)
  const reset = useSimulationStore((s) => s.reset)

  const isRunning = status === 'running'
  const isComplete = status === 'complete'

  const togglePlay = () => {
    if (isRunning) setStatus('paused')
    else if (isComplete) reset()
    else setStatus('running')
  }

  return (
    <div
      className="flex items-center gap-2.5 border-t px-5 py-4"
      style={{ borderColor: 'var(--op-border)' }}
    >
      <button
        onClick={togglePlay}
        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded text-[13px] font-semibold"
        style={{ background: 'var(--op-accent)', color: 'var(--op-accent-ink)' }}
      >
        {isRunning ? (
          <>
            <PauseIcon /> Pause
          </>
        ) : isComplete ? (
          <>
            <PlayIcon /> Restart
          </>
        ) : (
          <>
            <PlayIcon /> Play
          </>
        )}
      </button>

      <button
        onClick={reset}
        aria-label="Reset to origin"
        className="flex h-9 w-9 items-center justify-center rounded border"
        style={{ borderColor: 'var(--op-border)' }}
      >
        <ResetIcon />
      </button>

      <div
        className="flex overflow-hidden rounded border"
        style={{ borderColor: 'var(--op-border)' }}
      >
        {SPEEDS.map((s, i) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            aria-pressed={speed === s}
            className="px-2.5 py-2.5 font-mono text-[11px]"
            style={{
              background: speed === s ? 'var(--op-accent-soft)' : 'transparent',
              color: speed === s ? 'var(--op-accent-text)' : 'var(--op-text-muted)',
              fontWeight: speed === s ? 600 : 400,
              borderLeft: i === 0 ? 'none' : '1px solid var(--op-border)',
            }}
          >
            {s}×
          </button>
        ))}
      </div>
    </div>
  )
}
