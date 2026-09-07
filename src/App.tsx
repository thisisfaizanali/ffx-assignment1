import { useRoute } from './hooks/useRoute'

// Temporary scaffold view. Replaced with the real map and status UI in M3-M5.
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

  return <pre className="p-6 text-sm">{JSON.stringify(data, null, 2)}</pre>
}

export default App
