export type LatLng = [number, number]

export type RouteType = 'circular' | 'out-and-back' | 'different-out-and-back' | 'linear'

export type TerrainType = 'flat' | 'moderate' | 'hard'

export interface RouteFilters {
  type: RouteType
  distance: number
  avoidRepeats: boolean
  terrain: TerrainType
  maxElevation: number
}

export interface RouteCandidate {
  id: string
  title: string
  type: RouteType
  coords: LatLng[]
  distance: number
  duration: number
  elevationGain: number
  deviation: number
  note: string
  shapeSummary: string
}
