'use client'

import { Crosshair, AlertTriangle } from 'lucide-react'

interface MapFloatingControlsProps {
  onReport: () => void
  onGeolocate: () => void
  locating: boolean
  reportActive?: boolean
  sidePanelOpen?: boolean
}

export default function MapFloatingControls({
  onReport,
  onGeolocate,
  locating,
  reportActive = false,
  sidePanelOpen = false,
}: MapFloatingControlsProps) {
  const iconBtn =
    'w-9 h-9 flex items-center justify-center rounded-md border border-border shadow-md transition-colors'

  const panelOffset = sidePanelOpen
    ? 'md:right-[calc(0.75rem+min(22rem,calc(100%-1.5rem)))] lg:right-[calc(0.75rem+24rem)]'
    : 'md:right-3'

  return (
    <>
      {/* Móvil: columna compacta encima del zoom */}
      <div className="absolute right-2.5 bottom-[5.5rem] z-50 flex flex-col gap-1.5 md:hidden">
        <button
          type="button"
          onClick={onReport}
          className={`${iconBtn} ${
            reportActive
              ? 'bg-orange-600 text-white ring-2 ring-orange-300'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
          title="Reportar zona afectada"
          aria-label="Reportar zona"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onGeolocate}
          disabled={locating}
          className={`${iconBtn} bg-card hover:bg-secondary disabled:opacity-50`}
          title="Mi ubicación"
          aria-label="Mi ubicación"
        >
          <Crosshair className={`w-4 h-4 ${locating ? 'text-accent animate-pulse' : 'text-foreground'}`} />
        </button>
      </div>

      {/* Desktop: fila compacta arriba a la derecha del mapa */}
      <div className={`absolute top-3 z-50 hidden md:flex items-center gap-1.5 ${panelOffset}`}>
        <button
          type="button"
          onClick={onReport}
          className={`${iconBtn} ${
            reportActive
              ? 'bg-orange-600 text-white ring-2 ring-orange-300'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
          title="Reportar zona afectada"
          aria-label="Reportar zona"
        >
          <AlertTriangle className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onGeolocate}
          disabled={locating}
          className={`${iconBtn} bg-card hover:bg-secondary disabled:opacity-50`}
          title="Mi ubicación"
          aria-label="Mi ubicación"
        >
          <Crosshair className={`w-4 h-4 ${locating ? 'text-accent animate-pulse' : 'text-foreground'}`} />
        </button>
      </div>
    </>
  )
}
