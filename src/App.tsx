import { useState } from 'react'
import MapView from './components/MapView'
import SearchBox from './components/SearchBox'
import FiltersPanel from './components/FiltersPanel'
import RouteNavigator from './components/RouteNavigator'
import { useRouteGenerator } from './hooks/useRouteGenerator'
import useRouteStore from './store'
import type { LatLng } from './types'

function App() {
  const [origin, setOrigin] = useState<LatLng | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const { routes, loading, error, generate, setError } = useRouteGenerator()
  const filters = useRouteStore((state) => state.filters)

  const activeRoute = routes[activeIndex] || routes[0] || null
  const hasRoutes = routes.length > 0

  const handleOriginChange = (position: LatLng) => {
    setOrigin(position)
    setError(null)
  }

  const handleGenerate = async () => {
    if (!origin) {
      setError('Selecciona un punto de partida con el buscador o tocando el mapa.')
      return
    }
    setActiveIndex(0)
    await generate(origin, filters, false)
  }

  const handleGenerateMore = async () => {
    if (!origin) {
      setError('Selecciona un punto de partida antes de generar más rutas.')
      return
    }
    setActiveIndex(0)
    await generate(origin, filters, true)
  }

  const handlePrevious = () => setActiveIndex((current) => Math.max(current - 1, 0))
  const handleNext = () => setActiveIndex((current) => Math.min(current + 1, routes.length - 1))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[36px] border border-slate-200 bg-white/95 p-8 shadow-xl shadow-slate-200/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600">Routly</p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">Crea rutas para correr con mapas reales.</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">Selecciona tu punto de inicio, ajusta distancia y perfil, y genera rutas basadas en OpenStreetMap y OSRM sin necesidad de backend.</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white/95 p-5 shadow-xl backdrop-blur">
              <SearchBox onSelect={handleOriginChange} />
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Punto de partida</p>
                {origin ? (
                  <p className="mt-2 text-sm text-slate-600">Lat: {origin[0].toFixed(5)}, Lon: {origin[1].toFixed(5)}</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-600">Usa el buscador o toca el mapa para elegir un punto.</p>
                )}
              </div>
            </div>

            <FiltersPanel
              onGenerate={handleGenerate}
              onGenerateMore={handleGenerateMore}
              isGenerating={loading}
              hasRoutes={hasRoutes}
            />

            {error && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                {error}
              </div>
            )}

            {activeRoute && (
              <RouteNavigator
                route={activeRoute}
                index={activeIndex}
                total={routes.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
          </div>

          <div className="space-y-6">
            <MapView origin={origin} routeCoords={activeRoute?.coords ?? []} onOriginChange={handleOriginChange} />

            {loading && (
              <div className="rounded-[32px] border border-slate-200 bg-white/95 p-6 text-center shadow-xl backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Generando rutas…</p>
                <p className="mt-2 text-sm text-slate-500">Esto puede tardar unos segundos mientras OSRM y OpenElevation responden.</p>
              </div>
            )}

            {hasRoutes && !loading && (
              <div className="rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Rutas generadas</p>
                <p className="mt-2 text-sm text-slate-600">Navega entre rutas distintas y exporta la que prefieras.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
