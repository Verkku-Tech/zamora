'use client'

import { Marker } from 'react-map-gl/maplibre'
import { PuntoInteres, POI_COLORS, POI_ICONS, POI_LABELS } from '@/lib/mock-data'

interface PoiMarkersProps {
  puntos: PuntoInteres[]
  onPoiClick: (punto: PuntoInteres) => void
  disabled?: boolean
}

export default function PoiMarkers({ puntos, onPoiClick, disabled = false }: PoiMarkersProps) {
  return (
    <>
      {puntos.map((p) => (
        <Marker
          key={p.id}
          longitude={p.longitud}
          latitude={p.latitud}
          onClick={(e) => {
            if (disabled) return
            e.originalEvent.stopPropagation()
            onPoiClick(p)
          }}
        >
          <div
            className={`flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform ${
              disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:scale-125'
            }`}
            style={{
              width: 36,
              height: 36,
              backgroundColor: POI_COLORS[p.tipo],
              fontSize: 18,
            }}
            title={POI_LABELS[p.tipo]}
          >
            {POI_ICONS[p.tipo]}
          </div>
        </Marker>
      ))}
    </>
  )
}
