import { RouteMap } from './components/RouteMap'
import { useRoute } from './hooks/useRoute'

function App() {
  const { data, loading, error, retry } = useRoute()

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

  if (!data) return null

  return (
    <div className="h-screen w-screen">
      <RouteMap route={data} />
    </div>
  )
}

export default App
