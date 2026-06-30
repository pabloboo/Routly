import type { RouteCandidate, RouteFilters, LatLng, RouteType } from '../types'
import { fetchOsrmRoute as osrmRoute, compareRouteDistinctness } from './osrm'
import { fetchElevationProfile } from './elevation'

const ROUTE_VARIANTS = 5
const MAX_ROUTE_DEVIATION = 0.5
const DISTINCT_THRESHOLD = 0.25

const routeLabels: Record<RouteType, string> = {
  circular: 'Circular',
  'out-and-back': 'Ida y vuelta mismo camino',
  'different-out-and-back': 'Ida y vuelta distinto',
  linear: 'Lineal',
}

export async function generateRouteCandidates(
  origin: LatLng,
  filters: RouteFilters,
  count = 4,
): Promise<RouteCandidate[]> {
  const targetMeters = filters.distance * 1000
  const seedAngles = Array.from({ length: ROUTE_VARIANTS }, (_, index) => (index * 360) / ROUTE_VARIANTS)
  const rawCandidates: RouteCandidate[] = []

  for (const angle of seedAngles) {
    try {
      const waypoints = buildWaypointSequence(origin, targetMeters, filters.type, angle)
      const route = await osrmRoute(waypoints)
      const elevation = await fetchElevationProfile(route.coords)
      const deviation = Math.abs(route.distance - targetMeters) / targetMeters
      const isTooFar = deviation > MAX_ROUTE_DEVIATION
      const isTooSteep = filters.maxElevation > 0 && elevation.gain > filters.maxElevation

      if (isTooFar || isTooSteep) {
        rawCandidates.push({
          id: `candidate-${angle}`,
          title: routeLabels[filters.type],
          type: filters.type,
          coords: route.coords,
          distance: route.distance,
          duration: route.duration,
          elevationGain: elevation.gain,
          deviation,
          note: buildDeviationNote(route.distance, targetMeters, elevation.gain),
          shapeSummary: filters.type,
        })
        continue
      }

      rawCandidates.push({
        id: `candidate-${angle}`,
        title: routeLabels[filters.type],
        type: filters.type,
        coords: route.coords,
        distance: route.distance,
        duration: route.duration,
        elevationGain: elevation.gain,
        deviation,
        note: buildDeviationNote(route.distance, targetMeters, elevation.gain),
        shapeSummary: filters.type,
      })
    } catch (error) {
      continue
    }
  }

  if (!rawCandidates.length) {
    throw new Error('No se pudo generar ninguna ruta con los parámetros actuales. Intenta revisar la distancia o cambiar el tipo de recorrido.')
  }

  const scored = rawCandidates
    .map((candidate) => ({
      candidate,
      score: scoreRoute(candidate, filters),
    }))
    .sort((a, b) => a.score - b.score)

  const selected: RouteCandidate[] = []
  for (const item of scored) {
    if (selected.length >= count) break
    const enoughDistinct = selected.every((existing) => compareRouteDistinctness(item.candidate.coords, existing.coords) >= DISTINCT_THRESHOLD)
    if (enoughDistinct || selected.length === 0) {
      selected.push(item.candidate)
    }
  }

  return selected.slice(0, count)
}

function buildWaypointSequence(origin: LatLng, targetMeters: number, type: RouteType, baseBearing: number): LatLng[] {
  const thirdDistance = Math.max(500, targetMeters / 3)
  const adjustRadius = (fraction: number) => targetMeters * fraction * (0.85 + 0.2 * Math.sin((baseBearing * Math.PI) / 180))

  switch (type) {
    case 'circular': {
      const radius = Math.min(10000, adjustRadius(0.5))
      const point = destinationPoint(origin, radius, baseBearing)
      return [origin, point, origin]
    }
    case 'out-and-back': {
      const radius = Math.min(10000, adjustRadius(0.5))
      const point = destinationPoint(origin, radius, baseBearing)
      return [origin, point]
    }
    case 'different-out-and-back': {
      const first = destinationPoint(origin, thirdDistance, baseBearing)
      const second = destinationPoint(first, thirdDistance, baseBearing + 90)
      const third = destinationPoint(origin, thirdDistance, baseBearing + 180)
      return [origin, first, second, third, origin]
    }
    case 'linear': {
      const point = destinationPoint(origin, targetMeters, baseBearing)
      return [origin, point]
    }
    default:
      return [origin]
  }
}

function destinationPoint([latitude, longitude]: LatLng, distance: number, bearing: number): LatLng {
  const radius = 6371000
  const radLat = toRadians(latitude)
  const radLon = toRadians(longitude)
  const radBearing = toRadians(bearing)
  const angularDistance = distance / radius

  const lat = Math.asin(
    Math.sin(radLat) * Math.cos(angularDistance) + Math.cos(radLat) * Math.sin(angularDistance) * Math.cos(radBearing),
  )
  const lon = radLon +
    Math.atan2(
      Math.sin(radBearing) * Math.sin(angularDistance) * Math.cos(radLat),
      Math.cos(angularDistance) - Math.sin(radLat) * Math.sin(lat),
    )

  return [toDegrees(lat), toDegrees(lon)]
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function toDegrees(value: number): number {
  return (value * 180) / Math.PI
}

function scoreRoute(route: RouteCandidate, filters: RouteFilters): number {
  const deviationScore = route.deviation
  const elevationPenalty = filters.mostlyFlat ? Math.max(0, route.elevationGain - 100) / 1000 : 0
  const repeatPenalty = filters.avoidRepeats && route.type === 'circular' ? 0 : 0
  return deviationScore + elevationPenalty + repeatPenalty
}

function buildDeviationNote(distance: number, targetMeters: number, elevationGain: number): string {
  const delta = distance - targetMeters
  const distanceNote = delta === 0 ? 'Coincide con el objetivo' : `${(distance / 1000).toFixed(1)} km, ${delta > 0 ? '+' : ''}${(delta / 1000).toFixed(1)} km sobre el objetivo`
  const elevationNote = `Elevación ${Math.round(elevationGain)} m`
  return `${distanceNote} • ${elevationNote}`
}
