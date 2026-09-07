import { useCallback, useEffect, useState } from 'react'
import { getRoute } from '../api/routeService'
import type { Route } from '../types'

export interface UseRouteResult {
  data: Route | null
  loading: boolean
  error: string | null
  retry: () => void
}

export function useRoute(): UseRouteResult {
  const [data, setData] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    getRoute()
      .then((route) => {
        if (cancelled) return
        setData(route)
        setError(null)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => {
    setLoading(true)
    setAttempt((n) => n + 1)
  }, [])

  return { data, loading, error, retry }
}
