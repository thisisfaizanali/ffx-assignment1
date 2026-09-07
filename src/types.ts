export interface LatLng {
  lat: number
  lng: number
}

export interface Stop extends LatLng {
  id: string
  label: string
}

export interface Route {
  origin: Stop
  stops: Stop[]
  averageSpeedKmh: number
}

export type SimStatus = 'idle' | 'loading' | 'running' | 'paused' | 'complete'
