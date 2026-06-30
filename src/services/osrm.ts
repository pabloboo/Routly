import type { LatLng } from '../types'

export interface OsrmRoute {
  coords: LatLng[]
  distance: number
  duration: number
}

const PROFILE = 'foot'

function formatOsrmCoordinate([lat, lng]: LatLng): string {
  return `${lng.toFixed(6)},${lat.toFixed(6)}`
}

function roundCoord(value: number): number {
  return Math.round(value * 100000) / 100000
}

export function normalizeRouteCoordinates(coords: Array<[number, number]>): LatLng[] {
  return coords.map(([lng, lat]) => [roundCoord(lat), roundCoord(lng)])
}

export async function fetchOsrmRoute(coordinates: LatLng[]): Promise<OsrmRoute> {
  if (coordinates.length < 2) {
    throw new Error('No hay suficientes puntos para generar la ruta.')
  }

  const path = coordinates.map(formatOsrmCoordinate).join(';')
  const url = `https://router.project-osrm.org/route/v1/${PROFILE}/${path}?overview=full&geometries=geojson&steps=false&annotations=distance`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('El servicio de rutas no respondió. Intenta de nuevo en unos segundos.')
  }

  const payload = await response.json()
  const route = payload.routes?.[0]
  if (!route || !route.geometry?.coordinates) {
    throw new Error('No se pudo generar la ruta solicitada. Prueba con otro punto de partida o distancia.')
  }

  return {
    coords: normalizeRouteCoordinates(route.geometry.coordinates),
    distance: Number(route.distance || 0),
    duration: Number(route.duration || 0),
  }
}

export interface SegmentInfo {
  key: string
  length: number
}

export function routeSegments(coords: LatLng[]): SegmentInfo[] {
  return coords.slice(1).map(([lat, lng], index) => {
    const [prevLat, prevLng] = coords[index]
    const key = normalizeSegmentKey([prevLat, prevLng], [lat, lng])
    return { key, length: haversineDistance(prevLat, prevLng, lat, lng) }
  })
}

function normalizeSegmentKey(a: LatLng, b: LatLng): string {
  const first = `${a[0].toFixed(5)},${a[1].toFixed(5)}`
  const second = `${b[0].toFixed(5)},${b[1].toFixed(5)}`
  return first < second ? `${first}|${second}` : `${second}|${first}`
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function compareRouteDistinctness(a: LatLng[], b: LatLng[]): number {
  const segmentsA = routeSegments(a)
  const keysB = new Set(routeSegments(b).map((segment) => segment.key))
  const sharedLength = segmentsA.reduce((sum, segment) => {
    return sum + (keysB.has(segment.key) ? segment.length : 0)
  }, 0)

  const minTotalLength = Math.min(
    segmentsA.reduce((sum, segment) => sum + segment.length, 0),
    routeSegments(b).reduce((sum, segment) => sum + segment.length, 0),
  )

  if (minTotalLength === 0) {
    return 1
  }

  return 1 - sharedLength / minTotalLength
}
