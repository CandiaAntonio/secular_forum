import { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Attempt to fetch from backend
    axios.get('http://localhost:8000/api/outlooks')
      .then(response => {
        setData(response.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch data", err)
        setError("Failed to connect to backend")
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Secular Forum Dashboard</h1>
          <p className="text-slate-600 mt-2">Financial Outlooks & Trends</p>
        </header>

        {loading && <div className="text-blue-600">Loading outlooks...</div>}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error} <br/>
            <span className="text-sm opacity-75">Make sure backend is running on port 8000</span>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.slice(0, 9).map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {item.Theme || 'No Theme'}
                  </span>
                  <span className="text-xs text-slate-400">{item.Year}</span>
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">{item.Institution}</h3>
                <p className="text-slate-600 text-sm line-clamp-4">{item.Call_text}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-500">
                  <span>Rank: {item.Rank}</span>
                  <span>{item.Sub_theme}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
