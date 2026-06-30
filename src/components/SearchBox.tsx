import { useEffect, useState } from 'react'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { searchAddress } from '../services/geocoding'
import type { GeocodeResult } from '../services/geocoding'
import type { LatLng } from '../types'

interface SearchBoxProps {
  onSelect: (position: LatLng) => void
}

export default function SearchBox({ onSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 350)
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setError(null)
      return
    }

    let isMounted = true
    const controller = new AbortController()

    setLoading(true)
    searchAddress(debouncedQuery)
      .then((items) => {
        if (isMounted) {
          setResults(items)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error al buscar la dirección.')
          setResults([])
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [debouncedQuery])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-900" htmlFor="search-address">
        Buscar dirección
      </label>
      <div className="relative">
        <input
          id="search-address"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ej. Madrid, Puerta del Sol"
          className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
        {loading && <span className="absolute right-4 top-3 text-slate-500">Buscando...</span>}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {results.length > 0 && (
        <ul className="max-h-60 overflow-auto rounded-3xl border border-slate-200 bg-white p-2 text-sm shadow-sm">
          {results.map((item) => (
            <li
              key={`${item.lat}-${item.lng}`}
              className="cursor-pointer rounded-2xl px-3 py-2 hover:bg-slate-100"
              onClick={() => {
                onSelect([item.lat, item.lng])
                setQuery(item.label)
                setResults([])
              }}
            >
              <span className="block font-medium text-slate-900">{item.label.split(',')[0]}</span>
              <span className="block text-xs text-slate-500">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
