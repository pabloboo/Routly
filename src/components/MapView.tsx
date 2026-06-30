import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet'
import type { LatLng } from '../types'
import type { LeafletMouseEvent } from 'leaflet'

interface MapViewProps {
  origin: LatLng | null
  routeCoords: LatLng[]
  onOriginChange: (position: LatLng) => void
}

const MapClickHandler = ({ onOriginChange }: { onOriginChange: (position: LatLng) => void }) => {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onOriginChange([event.latlng.lat, event.latlng.lng])
    },
  })
  return null
}

function MapUpdater({ center }: { center: LatLng }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 13, { animate: true })
  }, [center, map])

  return null
}

export default function MapView({ origin, routeCoords, onOriginChange }: MapViewProps) {
  const center: LatLng = origin || [40.4168, -3.7038]
  const polylinePositions = routeCoords.map(([lat, lng]) => [lat, lng] as [number, number])

  return (
    <div className="relative h-[420px] lg:h-full rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-100">
      <MapContainer center={center} zoom={origin ? 13 : 5} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onOriginChange={onOriginChange} />
        {origin && <MapUpdater center={center} />}

        {origin && (
          <Marker
            position={origin}
            draggable={true}
            eventHandlers={{
              dragend(event: any) {
                const marker = event.target
                const position = marker.getLatLng()
                onOriginChange([position.lat, position.lng])
              },
            }}
          />
        )}

        {routeCoords.length > 1 && <Polyline pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.85 }} positions={polylinePositions} />}
      </MapContainer>
      <div className="absolute left-4 top-4 rounded-2xl bg-white/90 border border-slate-200 px-4 py-3 shadow">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selecciona el punto de partida</p>
        <p className="mt-1 text-sm text-slate-700">Haz click en el mapa o arrastra el marcador.</p>
      </div>
    </div>
  )
}
