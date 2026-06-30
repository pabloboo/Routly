import { useCallback, useState } from 'react'
import { generateRouteCandidates } from '../services/routeGenerator'
import type { LatLng, RouteCandidate, RouteFilters } from '../types'

export function useRouteGenerator() {
  const [routes, setRoutes] = useState<RouteCandidate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (origin: LatLng, filters: RouteFilters, append = false) => {
      setLoading(true)
      setError(null)

      try {
        const candidates = await generateRouteCandidates(origin, filters, 4)
        setRoutes((current) => (append ? [...current, ...candidates].slice(-4) : candidates))
        return candidates
      } catch (err) {
        setRoutes((current) => (append ? current : []))
        setError(err instanceof Error ? err.message : 'Error al generar rutas.')
        return []
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    routes,
    loading,
    error,
    generate,
    setRoutes,
    setError,
  }
}
