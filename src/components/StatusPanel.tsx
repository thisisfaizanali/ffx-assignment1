import type { ReactNode } from 'react'
import {
  useCompletedCount,
  useCurrentPoint,
  useDistanceCovered,
  useNextStop,
} from '../selectors/derived'
import { useSimulationStore } from '../store/simulationStore'

function formatCoord(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b py-3" style={{ borderColor: 'var(--op-border-soft)' }}>
      <div
        className="mb-1 text-[11px] font-medium tracking-[0.08em] uppercase"
        style={{ color: 'var(--op-text-muted)' }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

export function StatusPanel() {
  const route = useSimulationStore((s) => s.route)
  const point = useCurrentPoint()
  const { coveredKm, totalKm } = useDistanceCovered()
  const nextStop = useNextStop()
  const completed = useCompletedCount()

  if (!route || !point) return null

  const percent = totalKm > 0 ? Math.min((coveredKm / totalKm) * 100, 100) : 0

  return (
    <div className="px-5 pt-5">
      <div
        className="mb-3.5 text-[11px] font-medium tracking-[0.08em] uppercase"
        style={{ color: 'var(--op-text-muted)' }}
      >
        Truck Status
      </div>

      <Row label="Current Location">
        <span className="font-mono text-[15px]">
          {formatCoord(point.position.lat, 'N', 'S')}, {formatCoord(point.position.lng, 'E', 'W')}
        </span>
      </Row>

      <Row label="Distance Covered">
        <div className="mb-2 flex items-baseline gap-1.5">
          <span className="font-mono text-[22px] font-semibold">{coveredKm.toFixed(1)}</span>
          <span className="font-mono text-[13px]" style={{ color: 'var(--op-text-muted)' }}>
            / {totalKm.toFixed(1)} km
          </span>
        </div>
        <div
          className="h-[3px] overflow-hidden rounded-sm"
          style={{ background: 'var(--op-border)' }}
        >
          <div
            className="h-full rounded-sm transition-[width]"
            style={{ width: `${percent}%`, background: 'var(--op-accent)' }}
          />
        </div>
      </Row>

      <div className="flex gap-5 border-b py-3" style={{ borderColor: 'var(--op-border-soft)' }}>
        <div className="flex-1">
          <div
            className="mb-1 text-[11px] font-medium tracking-[0.08em] uppercase"
            style={{ color: 'var(--op-text-muted)' }}
          >
            Next Stop
          </div>
          <div className="text-sm font-medium">
            {nextStop ? `${nextStop.id} · ${nextStop.label}` : 'Route complete'}
          </div>
        </div>
        <div>
          <div
            className="mb-1 text-[11px] font-medium tracking-[0.08em] uppercase"
            style={{ color: 'var(--op-text-muted)' }}
          >
            Completed
          </div>
          <div className="font-mono text-sm font-medium">
            {completed} / {route.stops.length}
          </div>
        </div>
      </div>
    </div>
  )
}
