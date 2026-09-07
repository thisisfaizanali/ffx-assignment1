import L from 'leaflet'

// ponytail: inline SVG divIcons, no external marker image assets to wire up.
function svgIcon(html: string, size: number): L.DivIcon {
  return L.divIcon({
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export const originIcon = svgIcon(
  `<div style="width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #334155;box-shadow:0 1px 3px rgba(0,0,0,.4)"></div>`,
  14,
)

export function stopIcon(label: string): L.DivIcon {
  return svgIcon(
    `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:#ef4444;color:#fff;font:600 11px system-ui,sans-serif;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)">${label}</div>`,
    26,
  )
}
