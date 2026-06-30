export interface ElevationSummary {
  gain: number
  profile: number[]
}

const MAX_SAMPLE_POINTS = 30

export async function fetchElevationProfile(coords: Array<[number, number]>): Promise<ElevationSummary> {
  if (!coords.length) {
    return { gain: 0, profile: [] }
  }

  const sample = coords.length <= MAX_SAMPLE_POINTS ? coords : downsample(coords, MAX_SAMPLE_POINTS)
  const locations = sample.map(([lat, lng]) => `${lat},${lng}`).join('|')
  const endpoint = `https://api.open-elevation.com/api/v1/lookup?locations=${encodeURIComponent(locations)}`

  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error('Error al consultar la elevación. Intenta de nuevo más tarde.')
  }

  const body = await response.json()
  const elevations = Array.isArray(body.results) ? body.results.map((item: any) => Number(item.elevation || 0)) : []
  const gain = elevations.reduce((sum: number, height: number, index: number) => {
    if (index === 0) return 0
    const diff = height - elevations[index - 1]
    return sum + Math.max(0, diff)
  }, 0)

  return { gain, profile: elevations }
}

function downsample(coords: Array<[number, number]>, limit: number): Array<[number, number]> {
  const step = Math.max(1, Math.floor(coords.length / limit))
  return coords.filter((_, index) => index % step === 0 || index === coords.length - 1)
}
