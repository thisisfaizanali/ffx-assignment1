import type { Marker as LeafletMarker } from 'leaflet'
import { useEffect, useRef } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { pathPoints } from '../lib/geo'
import { useCurrentPoint } from '../selectors/derived'
import { useSimulationStore } from '../store/simulationStore'
import type { Route } from '../types'
import { originIcon, stopIcon, truckIcon } from './markerIcons'

// Single free, keyless tile source (OSM). Dark mode is a CSS filter on the
// tile pane rather than a second (paid/key-gated) tile provider.
const TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
}

interface RouteMapProps {
  dark: boolean
}

function FitToRoute({ route }: { route: Route }) {
  const map = useMap()
  useEffect(() => {
    const points = pathPoints(route).map((p) => [p.lat, p.lng] as [number, number])
    map.fitBounds(points, { padding: [48, 48] })
  }, [map, route])
  return null
}

// MapContainer only applies `className` at creation, so a later theme
// change needs to toggle the class on the live container directly.
function MapTheme({ dark }: { dark: boolean }) {
  const map = useMap()
  useEffect(() => {
    map.getContainer().classList.toggle('map-dark', dark)
  }, [map, dark])
  return null
}

// Leaflet 1.9's built-in resize handling only listens for the browser
// window's resize event, not its own container - a pure layout-driven
// container resize (the lg breakpoint moving the map between full width
// and a shared row) never fires that, leaving tiles positioned for the
// stale size until something calls invalidateSize().
function MapResize() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])
  return null
}

// Bearing of the current leg, in degrees clockwise from north. A flat
// lat/lng atan2 (not true great-circle bearing) is plenty accurate at this
// route's scale, and matches Math.atan2 being the only new math needed.
function legBearingDeg(route: Route, legIndex: number): number {
  const points = pathPoints(route)
  const from = points[legIndex]
  const to = points[legIndex + 1] ?? from
  return (Math.atan2(to.lng - from.lng, to.lat - from.lat) * 180) / Math.PI
}

function TruckMarker({ route }: { route: Route }) {
  const point = useCurrentPoint()
  const markerRef = useRef<LeafletMarker>(null)

  useEffect(() => {
    if (!point) return
    // Icon is drawn facing east, so rotation 0 needs bearing 90 (east).
    const rotation = legBearingDeg(route, point.legIndex) - 90
    const body = markerRef.current?.getElement()?.querySelector<HTMLElement>('.truck-body')
    if (body) body.style.transform = `rotate(${rotation}deg)`
  }, [point, route])

  if (!point) return null
  return (
    <Marker
      ref={markerRef}
      position={[point.position.lat, point.position.lng]}
      icon={truckIcon}
      keyboard={false}
    />
  )
}

export function RouteMap({ dark }: RouteMapProps) {
  const route = useSimulationStore((s) => s.route)

  if (!route) return null
  const points = pathPoints(route).map((p) => [p.lat, p.lng] as [number, number])

  return (
    <MapContainer center={points[0]} zoom={12} className="h-full w-full">
      <FitToRoute route={route} />
      <MapTheme dark={dark} />
      <MapResize />
      <TileLayer url={TILES.url} attribution={TILES.attribution} />
      <Polyline
        positions={points}
        pathOptions={{ color: '#ef4444', weight: 3, dashArray: '6 8' }}
      />

      <Marker position={[route.origin.lat, route.origin.lng]} icon={originIcon} keyboard={false}>
        <Tooltip direction="top" offset={[0, -8]} className="!text-xs">
          {route.origin.label}
        </Tooltip>
      </Marker>

      {route.stops.map((stop) => (
        <Marker
          key={stop.id}
          position={[stop.lat, stop.lng]}
          icon={stopIcon(stop.id)}
          keyboard={false}
        >
          <Tooltip direction="top" offset={[0, -14]} className="!text-xs">
            {stop.id} &middot; {stop.label}
          </Tooltip>
        </Marker>
      ))}

      <TruckMarker route={route} />
    </MapContainer>
  )
}
