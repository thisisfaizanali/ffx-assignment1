import { useEffect } from 'react'
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

function TruckMarker() {
  const point = useCurrentPoint()
  if (!point) return null
  return (
    <Marker position={[point.position.lat, point.position.lng]} icon={truckIcon} keyboard={false} />
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

      <TruckMarker />
    </MapContainer>
  )
}
