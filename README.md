# Logistics Truck Route Visualizer

A frontend app that simulates a delivery truck moving through a real route on
a map, built with React, TypeScript, Zustand and Leaflet.

## Setup

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` start the dev server
- `npm run build` typecheck and build for production
- `npm test` run the unit tests
- `npm run lint` lint the project

## Demo

The truck starts moving automatically on load, from Whitefield Hub through
D1 (Marathahalli), D2 (Koramangala) to D3 (Jayanagar) in Bengaluru. Use the
controls in the bottom right of the sidebar to pause, resume, reset or
change playback speed. The theme toggle is in the header. About 15% of page
loads simulate a failed route fetch, to exercise the loading/error/retry
states genuinely rather than leaving them as dead code; Retry re-fetches.

## Architecture

```
src/
  api/            mock route fetch (simulated latency + failure rate)
  types.ts        Stop, Route, SimStatus
  store/          zustand: status, progress, speed, route
  selectors/      derived.ts: current location, leg, next stop, distance,
                  completed stops, ETA - computed from route + progress,
                  never stored
  hooks/          useRoute (data fetching), useTruckSimulation (the
                  animation engine), useTheme (light/dark)
  lib/geo.ts       haversine distance, cumulative leg distances,
                  point-along-path interpolation
  components/     RouteMap, StatusPanel, StopList, PlaybackControls,
                  ThemeToggle
```

**State.** A single small Zustand store holds only `status`, `progress`
(0..1 along the full path), `speed` and `route`. Everything else - current
position, current leg, distance covered, next stop, completed stops, ETA
per stop - is computed on demand in `selectors/derived.ts` from
`route + progress`, so there is nothing to keep in sync by hand. Components
read the store and the selectors directly with narrow hooks, so each one
only re-renders on the slice it actually uses.

**Simulation engine.** `useTruckSimulation` drives `progress` forward with
`requestAnimationFrame`, using wall-clock elapsed time rather than a fixed
tick. That means pausing freezes progress exactly where it was, and changing
the speed multiplier never causes a jump, since the next frame just resumes
computing from the current, unchanged progress value.

**Map.** Real Leaflet + OpenStreetMap tiles (no API key, no billing). The
route, delivery points and the animated truck marker all use real Bengaluru
coordinates and real road-network tiles, not a mock. Dark mode is a CSS
filter on the tile layer rather than a second, paid/key-gated tile provider
(CartoDB's free dark tiles now require a key, so this was a real fallback,
not a preemptive choice).

**Theme.** `useTheme` reads a stored preference or falls back to
`prefers-color-scheme`, persists the choice to `localStorage`, and sets a
`data-theme` attribute that CSS custom properties key off. The map's dark
filter is applied by watching that same value.

## Key decisions and tradeoffs

- **Animation pace is decoupled from the route's real-world speed.** ETA
  math uses a realistic average speed (30 km/h) so the numbers in the status
  panel and stop list are believable. The on-screen animation instead
  completes a full route in a fixed ~20 seconds at 1x, because animating at
  the literal real-world pace made the demo take 30-40 real minutes to
  finish - discovered by actually watching it run, not assumed.
- **Zustand is scoped to simulation state only.** Data fetching stays in a
  plain hook (`useRoute`), and theme stays in another (`useTheme`). Neither
  needed a shared store.
- **The mock API has a genuine, non-zero failure rate** (15%) instead of
  always succeeding, so the loading/error/retry UI is real, reachable
  behavior rather than code nobody ever sees run.
- **No component library.** Everything is hand-built against a small set of
  CSS custom property tokens (an "operations console" system: IBM Plex
  Sans/Mono, an amber accent for "active", light and dark palettes) to avoid
  the generic look of default Tailwind components.

## Accessibility

Keyboard-operable controls with themed focus rings, `aria-pressed` on the
speed selector, `aria-live` on the status pill (not on the constantly
updating distance/ETA numbers, to avoid spamming screen readers every
frame), a labelled map region, semantic list markup for the stop list, and
`prefers-reduced-motion` support on cosmetic CSS transitions. The truck's
motion itself is the app's core content, not decorative, so it is not
disabled under reduced motion.

## Known limitation

Mobile/tablet responsive layout (map stacked above a scrollable sidebar
below the `lg` breakpoint) is implemented and structurally verified, but
could not be visually verified in a real narrow viewport in this
environment - the browser automation available here does not resize the
actual viewport. Worth a manual check on a real device or DevTools before
final submission.
