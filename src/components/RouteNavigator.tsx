import type { RouteCandidate } from '../types'
import { createGpxDownloadUrl, buildGoogleMapsUrl } from '../services/gpx'

interface RouteNavigatorProps {
  route: RouteCandidate
  index: number
  total: number
  onPrevious: () => void
  onNext: () => void
  onGenerateMore: () => void
  isGenerating: boolean
}

export default function RouteNavigator({ route, index, total, onPrevious, onNext, onGenerateMore, isGenerating }: RouteNavigatorProps) {
  const googleMapsUrl = buildGoogleMapsUrl(route.coords)
  const gpxUrl = createGpxDownloadUrl(route.coords)

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white/95 p-5 shadow-xl ring-1 ring-slate-100">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Ruta {index + 1} de {total}</p>
          <h3 className="text-2xl font-semibold text-slate-900">{route.title}</h3>
          <p className="text-sm text-slate-500">{route.note}</p>
        </div>

        <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-50 p-3">
          <button
            type="button"
            onClick={onPrevious}
            disabled={index === 0}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Anterior
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index === total - 1}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Distancia</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{(route.distance / 1000).toFixed(1)} km</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Desnivel</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{Math.round(route.elevationGain)} m</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tipo</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{route.title}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Exportar a Google Maps
        </a>
        <a
          href={gpxUrl}
          download="ruta-running.gpx"
          className="inline-flex justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300"
        >
          Descargar GPX
        </a>
        <button
          type="button"
          onClick={onGenerateMore}
          disabled={isGenerating}
          className="inline-flex justify-center rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          {isGenerating ? 'Generando...' : 'Generar más alternativas'}
        </button>
      </div>
    </div>
  )
}
