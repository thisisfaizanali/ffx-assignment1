import { useEffect } from 'react'
import { RouteMap } from './components/RouteMap'
import { useRoute } from './hooks/useRoute'
import { useTruckSimulation } from './hooks/useTruckSimulation'
import { useSimulationStore } from './store/simulationStore'

function App() {
  const { data, loading, error, retry } = useRoute()
  const storeRoute = useSimulationStore((s) => s.route)
  const setRoute = useSimulationStore((s) => s.setRoute)
  useTruckSimulation()

  useEffect(() => {
    if (data && !storeRoute) setRoute(data)
  }, [data, storeRoute, setRoute])

  if (loading) return <p className="p-6">Loading route...</p>

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
        <button onClick={retry} className="mt-2 rounded border px-3 py-1">
          Retry
        </button>
      </div>
    )
  }

  if (!storeRoute) return null

  return (
    <div className="h-screen w-screen">
      <RouteMap />
    </div>
  )
}

export default App
