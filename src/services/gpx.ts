import type { LatLng } from '../types'

export function buildGpx(coords: LatLng[]): string {
  const trackPoints = coords
    .map(([lat, lng]) => `    <trkpt lat="${lat.toFixed(6)}" lon="${lng.toFixed(6)}"><ele>0</ele></trkpt>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Routly" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>Ruta de running</name>
    <desc>Exportada desde Routly</desc>
  </metadata>
  <trk>
    <name>Ruta</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`
}

export function createGpxDownloadUrl(coords: LatLng[]): string {
  const gpx = buildGpx(coords)
  const blob = new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8' })
  return URL.createObjectURL(blob)
}

export function buildGoogleMapsUrl(coords: LatLng[]): string {
  if (coords.length < 2) {
    return 'https://www.google.com/maps'
  }

  const sample = simplifyCoordinates(coords, 12)
  const origin = sample[0]
  const destination = sample[sample.length - 1]
  const waypoints = sample.slice(1, -1).map(([lat, lng]) => `${lat.toFixed(6)},${lng.toFixed(6)}`)
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin[0].toFixed(6)},${origin[1].toFixed(6)}`,
    destination: `${destination[0].toFixed(6)},${destination[1].toFixed(6)}`,
    travelmode: 'walking',
  })
  if (waypoints.length) {
    params.set('waypoints', waypoints.join('|'))
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

function simplifyCoordinates(coords: LatLng[], maxPoints: number): LatLng[] {
  if (coords.length <= maxPoints) {
    return coords
  }

  const step = Math.max(1, Math.floor((coords.length - 1) / (maxPoints - 1)))
  const sampled = coords.filter((_, index) => index % step === 0)
  if (sampled[sampled.length - 1] !== coords[coords.length - 1]) {
    sampled.push(coords[coords.length - 1])
  }
  return sampled
}
