import { useEffect, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { pathPoints } from '../lib/geo'
import type { Route } from '../types'
import { originIcon, stopIcon } from './markerIcons'

// Single free, keyless tile source (OSM). Dark mode is a CSS filter on the
// tile pane rather than a second (paid/key-gated) tile provider.
const TILES = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
}

interface RouteMapProps {
  route: Route
  dark?: boolean
}

function FitToRoute({ route }: { route: Route }) {
  const map = useMap()
  useEffect(() => {
    const points = pathPoints(route).map((p) => [p.lat, p.lng] as [number, number])
    map.fitBounds(points, { padding: [48, 48] })
  }, [map, route])
  return null
}

export function RouteMap({ route, dark }: RouteMapProps) {
  const [isDark] = useState(
    () => dark ?? window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )
  const points = pathPoints(route).map((p) => [p.lat, p.lng] as [number, number])

  return (
    <MapContainer
      center={points[0]}
      zoom={12}
      className={`h-full w-full ${isDark ? 'map-dark' : ''}`}
    >
      <FitToRoute route={route} />
      <TileLayer url={TILES.url} attribution={TILES.attribution} />
      <Polyline
        positions={points}
        pathOptions={{ color: '#ef4444', weight: 3, dashArray: '6 8' }}
      />

      <Marker position={[route.origin.lat, route.origin.lng]} icon={originIcon}>
        <Tooltip permanent direction="top" offset={[0, -8]} className="!text-xs">
          {route.origin.label}
        </Tooltip>
      </Marker>

      {route.stops.map((stop) => (
        <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon(stop.id)}>
          <Tooltip permanent direction="top" offset={[0, -14]} className="!text-xs">
            {stop.id} &middot; {stop.label}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}
