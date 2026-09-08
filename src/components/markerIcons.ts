import L from 'leaflet'

// ponytail: inline SVG divIcons, no external marker image assets to wire up.
function svgIcon(
  html: string,
  size: number,
  anchor: [number, number] = [size / 2, size / 2],
): L.DivIcon {
  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: anchor,
  })
}

// Green, matching the brief's mock (origin = green, delivery points = red).
export const originIcon = svgIcon(
  `<div style="width:20px;height:20px;border-radius:50%;background:#22c55e;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
  20,
)

export function stopIcon(label: string): L.DivIcon {
  return svgIcon(
    `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#ef4444;color:#fff;font:600 11px system-ui,sans-serif;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)">${label}</div>`,
    26,
  )
}

const TRUCK_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
  <rect x="1" y="7" width="13" height="9" rx="1"/>
  <path d="M14 10h4l3 3v3h-7z"/>
  <circle cx="6" cy="18" r="1.6"/>
  <circle cx="17" cy="18" r="1.6"/>
</svg>`

// Anchored a few pixels off-center so the truck never fully eclipses the
// pin it's arriving at or departing from (origin included, at progress 0).
// The .truck-body div is rotated per-leg by RouteMap to face the direction
// of travel (drawn facing east, so the rotation offset is bearing - 90).
export const truckIcon = svgIcon(
  `<div class="truck-body" style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;background:#1e293b;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)">${TRUCK_SVG}</div>`,
  28,
  [4, 24],
)
