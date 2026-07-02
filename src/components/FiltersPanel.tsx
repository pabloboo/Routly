import { useMemo } from 'react'
import useRouteStore from '../store'
import type { RouteType } from '../types'

interface FiltersPanelProps {
  onGenerate: () => void
  isGenerating: boolean
}

const routeOptions: Array<{ value: RouteType; icon: string; label: string; description: string }> = [
  { value: 'circular', icon: '↻', label: 'Circular', description: 'Vuelves al inicio' },
  { value: 'out-and-back', icon: '⇄', label: 'Ida y vuelta', description: 'Mismo camino' },
  { value: 'different-out-and-back', icon: '⤴', label: 'Alternativa', description: 'Vuelta distinta' },
  { value: 'linear', icon: '→', label: 'Lineal', description: 'Sin volver al origen' },
]

const terrainOptions = [
  { value: 'flat', icon: '─', label: 'Llano' },
  { value: 'moderate', icon: '↗', label: 'Moderado' },
  { value: 'hard', icon: '⬆', label: 'Exigente' },
]

function formatEstimate(distance: number) {
  const totalMinutes = Math.round(distance * 6)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0) {
    return `~${hours}h ${String(minutes).padStart(2, '0')}min a ritmo moderado · 6 min/km`
  }

  return `~${minutes} min a ritmo moderado · 6 min/km`
}

export default function FiltersPanel({ onGenerate, isGenerating }: FiltersPanelProps) {
  const { filters, setFilters, resetFilters } = useRouteStore()

  const elevationVisible = filters.terrain !== 'flat'
  const timeEstimate = useMemo(() => formatEstimate(filters.distance), [filters.distance])

  return (
    <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Tu ruta</h2>
        <p className="text-sm text-slate-500">Elige cómo quieres correr hoy</p>
      </div>

      <div className="space-y-5 rounded-3xl bg-slate-50 p-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Tipo de recorrido</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {routeOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setFilters({ type: option.value })}
                className={`rounded-3xl border px-4 py-4 text-left transition ${filters.type === option.value ? 'border-sky-500 bg-white shadow-sm' : 'border-slate-200 bg-transparent hover:border-slate-300'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-slate-100 text-lg text-slate-700">{option.icon}</span>
                  <div>
                    <p className={`font-medium ${filters.type === option.value ? 'text-sky-700' : 'text-slate-900'}`}>{option.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{option.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900">Distancia</p>
              <p className="text-xs text-slate-500">{timeEstimate}</p>
            </div>
            <p className="text-2xl font-semibold text-slate-900">{filters.distance.toFixed(1)} km</p>
          </div>
          <input
            type="range"
            min="1"
            max="42"
            step="0.5"
            value={filters.distance}
            onChange={(event) => setFilters({ distance: Number(event.target.value) })}
            className="w-full accent-sky-500"
          />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Terreno</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {terrainOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setFilters({ terrain: option.value as any })}
                className={`rounded-3xl border px-3 py-4 text-center transition ${filters.terrain === option.value ? 'border-sky-500 bg-white text-sky-700 shadow-sm' : 'border-slate-200 bg-transparent text-slate-700 hover:border-slate-300'}`}
              >
                <div className="mb-1 text-lg">{option.icon}</div>
                <p className="text-sm font-medium">{option.label}</p>
              </button>
            ))}
          </div>
        </div>

        {elevationVisible && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-slate-900">
              <span>Desnivel máximo</span>
              <span>{filters.maxElevation} m</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="25"
              value={filters.maxElevation}
              onChange={(event) => setFilters({ maxElevation: Number(event.target.value) })}
              className="w-full accent-sky-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-4 py-4">
          <div>
            <p className="font-medium text-slate-900">Sin calles repetidas</p>
            <p className="text-sm text-slate-500">Evita repetir el mismo camino.</p>
          </div>
          <button
            type="button"
            onClick={() => setFilters({ avoidRepeats: !filters.avoidRepeats })}
            className={`inline-flex h-10 w-16 items-center rounded-full p-1 transition ${filters.avoidRepeats ? 'bg-sky-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-8 w-8 rounded-full bg-white shadow transition ${filters.avoidRepeats ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-slate-500 underline underline-offset-2 hover:text-slate-700"
          >
            Restablecer filtros
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={isGenerating}
        onClick={onGenerate}
        className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isGenerating ? 'Generando rutas...' : 'Generar rutas'}
      </button>
    </div>
  )
}
