export interface GeocodeResult {
  label: string
  lat: number
  lng: number
}

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) {
    return []
  }

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '6',
    addressdetails: '0',
    polygon_geojson: '0',
    accept_language: 'es,en',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`)
  if (!response.ok) {
    throw new Error('No se pudo buscar la dirección. Intenta de nuevo más tarde.')
  }

  const results = (await response.json()) as Array<Record<string, any>>
  return results.map((item) => ({
    label: item.display_name,
    lat: Number(item.lat),
    lng: Number(item.lon),
  }))
}
