# Logistics Truck Route Visualizer

A frontend application that simulates a delivery truck moving through a real
route in Bengaluru: from Whitefield Hub through three delivery points, with
a live map, real-time status readout, and playback controls.

**Live demo:** https://ffx-assignment1.vercel.app/

Built with React, TypeScript, Vite, Zustand and Leaflet.

---

## Running locally

Requires [Node.js](https://nodejs.org) 20.19+ (or 22.12+) and npm.

1. Clone the repository and move into it:

   ```bash
   git clone https://github.com/thisisfaizanali/truck-route-visualizer.git
   cd truck-route-visualizer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open the URL Vite prints in the terminal (`http://localhost:5173` by
   default).

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Start the dev server                          |
| `npm run build`   | Typecheck (`tsc -b`) and build for production |
| `npm run preview` | Serve the production build locally            |
| `npm test`        | Run the unit tests                            |
| `npm run lint`    | Lint the project                              |

No API keys, environment variables or accounts are needed: the map uses
keyless OpenStreetMap tiles.

---

## What it does

The truck departs automatically on load and drives Whitefield Hub → D1
Marathahalli → D2 Koramangala → D3 Jayanagar, a 17.6 km route using real
coordinates. As it moves, the sidebar updates live with its position,
distance covered, next stop and completed count, and each stop's ETA counts
down until it's marked as arrived.

Playback controls sit at the bottom of the sidebar: pause and resume, reset
to the origin, or run at 1×, 2× or 4×. The theme toggle is in the header.

The route is fetched through a mock service with realistic latency and a
deliberate failure rate, so the loading and error states are reachable
behaviour rather than code that never runs. If you land on the error card,
Retry re-fetches.

---

## Requirements checklist

**Core**

- [x] Map showing the origin location
- [x] Map showing 3 delivery points (D1, D2, D3)
- [x] Route path drawn between them
- [x] Truck marker animating Origin → D1 → D2 → D3
- [x] Live truck status: current location
- [x] Live truck status: distance covered
- [x] Live truck status: next stop
- [x] Live truck status: completed stops

**Bonus**

- [x] Pause / resume tracking (plus reset and 1× / 2× / 4× playback speed)
- [x] ETA calculation, per stop
- [x] Dark mode, with system-preference detection and persistence

---

## Architecture

```
src/
  api/           routeService.ts  mock fetch: latency + failure rate
                 routeFixture.ts  the route data
  types.ts       Stop, Route, SimStatus
  store/         zustand store: status, progress, speed, route
  selectors/     derived.ts  position, distance, next stop, completed
                 count, per-stop status and ETA - all computed, never stored
  hooks/         useRoute       data fetching (loading / error / retry)
                 useTruckSimulation  the animation engine
                 useTheme       light / dark with persistence
  lib/           geo.ts     haversine, leg distances, point-along-path
                 format.ts  coordinate and ETA formatting
  components/    RouteMap, StatusPanel, StopList, PlaybackControls,
                 ThemeToggle
```

### State: one small store, everything else derived

The Zustand store holds exactly four fields: `status`, `progress` (0..1
along the whole path), `speed` and `route`. Nothing about the truck's
position, distance, ETA or stop states is stored anywhere.

All of it is computed on demand in `selectors/derived.ts` from
`route + progress` using pure functions, exposed through thin memoised hooks
that components call directly. Adding a new piece of status information
means deriving it, not adding another field to keep in sync.

This is the main design decision in the project. Storing position and
distance alongside progress would mean three values that can disagree with
each other; deriving them means they cannot.

### Simulation engine

`useTruckSimulation` advances `progress` with `requestAnimationFrame`, using
the wall-clock time elapsed between frames rather than a fixed tick. Two
consequences fall out of that:

- **Pausing is exact.** When status isn't `running` the effect simply
  doesn't run, so progress freezes where it was rather than drifting.
- **Changing speed never jumps.** The loop reads `speed` and `progress`
  fresh from the store each frame instead of closing over stale values, so a
  1× → 4× switch takes effect on the next frame from the current position.

A `visibilitychange` listener pauses a run in progress the moment the tab is
backgrounded, and never auto-resumes. This matters because
`requestAnimationFrame` gets throttled long before it stops firing outright.
Without an explicit pause, a backgrounded tab doesn't freeze: it crawls, and
progress silently desyncs from wall clock.

### Map

Real Leaflet with OpenStreetMap tiles: no API key, no billing. The origin,
delivery points and animated truck all use real Bengaluru coordinates.

A few details worth noting:

- **Dark mode** is a CSS filter over the tile pane rather than a second tile
  provider, because the free keyless dark basemaps (CartoDB and similar) now
  require a key. Leaflet's own tooltips, zoom controls and attribution are
  themed against the same custom properties as the rest of the app, so they
  invert with it.
- **`MapContainer` only applies `className` at creation time**, so a theme
  change after mount can't go through props. A small child component toggles
  the class on the live container via `useMap()` instead.
- **Leaflet only listens for the browser window's resize event**, not its
  own container's. The layout moves the map between full width and a shared
  row at the `lg` breakpoint without the window changing size, so a
  `ResizeObserver` calls `invalidateSize()` to keep tiles from being drawn
  at a stale size.
- **The truck glyph mirrors rather than rotates.** It's a side-view icon, so
  rotating it to a compass bearing would flip it upside down past ±90°, and
  on a westbound route, that's the entire journey. Westward legs get a
  horizontal flip; the badge around it stays square.

### Theme

`useTheme` reads a stored preference, falling back to
`prefers-color-scheme`, persists the choice to `localStorage`, and sets a
`data-theme` attribute on `<html>`. CSS custom properties key off it in
three layers: `:root` as the light base, a `prefers-color-scheme` block for
system dark, and an explicit `[data-theme="dark"]` block so a manual choice
always wins over the system setting.

---

## Key decisions and trade-offs

**Animation pace is decoupled from real-world speed.** ETA maths uses a
realistic 30 km/h average, so the numbers in the status panel are
believable. The on-screen animation instead completes the full route in a
fixed 20 seconds at 1×. Animating at the literal real-world pace would make
the demo take 30 to 40 actual minutes.

**Zustand is scoped to simulation state only.** Data fetching lives in a
plain hook (`useRoute`), theme in another (`useTheme`). Neither needs to be
shared across the tree, so neither belongs in a global store.

**The mock API fails 5% of the time.** Rather than always resolving, the
service has a genuine failure rate, which means the loading skeleton, error
card and retry path are real, reachable behaviour instead of code nobody
ever sees run. The route data is isolated behind an async boundary
(`getRoute(): Promise<Route>`), so nothing downstream knows or cares that
it's local: swapping in a real backend is a change to one function body.

**No component library.** Everything is built against a small set of CSS
custom property tokens (an "operations console" system with IBM Plex
Sans/Mono and an amber accent for active states, in light and dark) to
avoid the generic look of default component kits.

**The route is straight-line legs over real roads**, not road-following, so
the polyline cuts across Bellandur Lake rather than routing around it. Real
road-network routing needs a keyed service (OSRM, Mapbox or Google
Directions), which would mean either a paid key or a self-hosted OSRM
instance, which is out of scope for a map that deliberately needs neither.
Worth adding with a key in hand.

---

## Accessibility

- Keyboard-operable controls throughout, with themed `focus-visible` rings
- `aria-pressed` on the playback speed selector, `aria-current="step"` on the
  active stop
- `aria-live` on the status pill only, deliberately _not_ on the distance
  and ETA figures, which change every frame and would flood a screen reader
- A labelled map region, and semantic list markup for the stops
- Decorative map markers are kept out of the tab order
- `prefers-reduced-motion` respected on cosmetic transitions and the loading
  skeleton's pulse. The truck's own motion is the app's content rather than
  decoration, so it isn't disabled

---

## Testing

```bash
npm test
```

Unit tests cover the pure logic the rest of the app depends on: haversine
distance, per-leg and total route distance, point-along-path interpolation
including clamping at both ends, and the coordinate and ETA formatters.

The geometry is the right thing to test here: both the animated map marker
and every derived status value are computed from it, so an error there would
surface everywhere at once.

---

## Responsive layout

Above the `lg` breakpoint the map and sidebar sit side by side. Below it,
the map takes the upper portion of the viewport with the status panel, stop
list and controls stacked in a scrollable column beneath. The header drops
the origin → destination subtitle below `sm` to keep the title, status pill
and theme toggle on one line.
