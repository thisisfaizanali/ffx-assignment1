import type { CSSProperties } from 'react'
import { useStopsProgress } from '../selectors/derived'
import { useSimulationStore } from '../store/simulationStore'

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--op-text-muted)"
      strokeWidth="2.2"
    >
      <path d="M5 12l4 4L19 6" />
    </svg>
  )
}

export function StopList() {
  const route = useSimulationStore((s) => s.route)
  const stops = useStopsProgress()

  if (!route) return null

  return (
    <div className="flex-1 overflow-auto px-5 py-5">
      <div
        className="mb-3 text-[11px] font-medium tracking-[0.08em] uppercase"
        style={{ color: 'var(--op-text-muted)' }}
      >
        Stops
      </div>

      <div className="flex flex-col gap-0.5">
        <div
          className="flex items-center gap-3 px-3 py-2.5"
          style={{ background: 'var(--op-panel-alt)', borderLeft: '3px solid transparent' }}
        >
          <CheckIcon />
          <div className="flex-1 text-[13px]" style={{ color: 'var(--op-text-dim)' }}>
            Origin · {route.origin.label}
          </div>
          <span className="font-mono text-[11px]" style={{ color: 'var(--op-text-muted)' }}>
            DEPARTED
          </span>
        </div>

        {stops.map(({ stop, status, etaMinutes }) => {
          const rowStyle: CSSProperties = {
            borderLeft: '3px solid transparent',
            ...(status === 'active' && {
              background: 'var(--op-accent-soft)',
              borderLeftColor: 'var(--op-accent)',
            }),
          }
          return (
            <div key={stop.id} className="flex items-center gap-3 px-3 py-2.5" style={rowStyle}>
              {status === 'done' ? (
                <CheckIcon />
              ) : status === 'active' ? (
                <div
                  className="h-[15px] w-[15px] shrink-0 rounded-full"
                  style={{ background: 'var(--op-accent)' }}
                />
              ) : (
                <div
                  className="h-[15px] w-[15px] shrink-0 rounded-full"
                  style={{ border: '1.5px solid var(--op-border)' }}
                />
              )}
              <div
                className="flex-1 text-[13px]"
                style={{
                  color: status === 'active' ? 'var(--op-text)' : 'var(--op-text-dim)',
                  fontWeight: status === 'active' ? 600 : 400,
                }}
              >
                {stop.id} · {stop.label}
              </div>
              <span
                className="font-mono text-[11px]"
                style={{
                  color: status === 'active' ? 'var(--op-accent-text)' : 'var(--op-text-muted)',
                  fontWeight: status === 'active' ? 500 : 400,
                }}
              >
                {status === 'done' ? 'ARRIVED' : `ETA ${String(etaMinutes).padStart(2, '0')} MIN`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
