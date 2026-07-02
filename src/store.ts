import { create } from 'zustand'
import type { RouteFilters } from './types'

const defaultFilters: RouteFilters = {
  type: 'circular',
  distance: 8,
  avoidRepeats: false,
  terrain: 'flat',
  maxElevation: 200,
}

interface RouteStore {
  filters: RouteFilters
  setFilters: (filters: Partial<RouteFilters>) => void
  resetFilters: () => void
}

const useRouteStore = create<RouteStore>((set) => ({
  filters: defaultFilters,
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
}))

export default useRouteStore
