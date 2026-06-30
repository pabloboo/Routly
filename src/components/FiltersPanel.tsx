import useRouteStore from '../store'
import type { RouteType } from '../types'

interface FiltersPanelProps {
  onGenerate: () => void
  onGenerateMore: () => void
  isGenerating: boolean
  hasRoutes: boolean
}

const routeOptions: Array<{ value: RouteType; label: string; description: string }> = [
  { value: 'circular', label: 'Circular', description: 'Vuelve al punto de inicio o cerca de él.' },
  { value: 'out-and-back', label: 'Ida y vuelta', description: 'Va y regresa por el mismo camino.' },
  { value: 'different-out-and-back', label: 'Ida y vuelta distinto', description: 'Vuelve por una trayectoria diferente.' },
  { value: 'linear', label: 'Lineal', description: 'Una sola dirección desde el punto de salida.' },
]

export default function FiltersPanel({ onGenerate, onGenerateMore, isGenerating, hasRoutes }: FiltersPanelProps) {
  const { filters, setFilters, resetFilters } = useRouteStore()

  return (
    <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Controles</p>
        <h2 className="text-2xl font-semibold text-slate-900">Ajusta tu ruta</h2>
        <p className="text-sm text-slate-500">Elige el tipo, distancia y perfil para crear rutas reales con OSRM.</p>
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
                className={`rounded-3xl border px-4 py-3 text-left transition ${filters.type === option.value ? 'border-sky-500 bg-white shadow-sm' : 'border-slate-200 bg-transparent hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-slate-900">{option.label}</span>
                  {filters.type === option.value && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Activo</span>}
                </div>
                <p className="mt-1 text-sm text-slate-500">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm font-medium text-slate-900">
              <span>Distancia objetivo</span>
              <span>{filters.distance.toFixed(1)} km</span>
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
            <input
              type="number"
              min="1"
              max="42"
              step="0.5"
              value={filters.distance}
              onChange={(event) => setFilters({ distance: Number(event.target.value) || 1 })}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <label className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm font-medium text-slate-900">
              <span>Elevación máxima</span>
              <span>{filters.maxElevation} m</span>
            </div>
            <input
              type="range"
              min="0"
              max="1200"
              step="25"
              value={filters.maxElevation}
              onChange={(event) => setFilters({ maxElevation: Number(event.target.value) })}
              className="w-full accent-sky-500"
            />
            <input
              type="number"
              min="0"
              max="1200"
              step="25"
              value={filters.maxElevation}
              onChange={(event) => setFilters({ maxElevation: Number(event.target.value) || 0 })}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
            <p className="text-xs text-slate-500">Si "Mayormente plano" está activo, se prioriza menor desnivel aunque el límite exacto pueda relajarse.</p>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300">
            <input
              type="checkbox"
              checked={filters.avoidRepeats}
              onChange={(event) => setFilters({ avoidRepeats: event.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <div>
              <p className="font-medium text-slate-900">No repetir tramos</p>
              <p className="text-sm text-slate-500">Prioriza rutas con menor coincidencia de calles.</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4 transition hover:border-slate-300">
            <input
              type="checkbox"
              checked={filters.mostlyFlat}
              onChange={(event) => setFilters({ mostlyFlat: event.target.checked })}
              className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <div>
              <p className="font-medium text-slate-900">Recorrido mayormente plano</p>
              <p className="text-sm text-slate-500">Reduce la ganancia de elevación cuando sea posible.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isGenerating}
          onClick={onGenerate}
          className="inline-flex justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isGenerating ? 'Generando rutas...' : 'Generar rutas'}
        </button>
        <button
          type="button"
          disabled={!hasRoutes || isGenerating}
          onClick={onGenerateMore}
          className="inline-flex justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Generar más alternativas
        </button>
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
      >
        Restablecer filtros
      </button>
    </div>
  )
}
