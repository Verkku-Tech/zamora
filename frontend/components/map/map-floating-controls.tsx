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
  const btnClass =
    'flex items-center justify-center rounded-lg border border-border shadow-lg transition-colors'

  const sideOffset = sidePanelOpen
    ? 'md:right-[calc(1rem+min(22rem,calc(100%-1.5rem)))] lg:right-[calc(1rem+24rem)]'
    : 'md:right-4'

  return (
    <div
      className={`absolute right-3 bottom-[5.75rem] z-50 flex flex-col gap-2 ${sideOffset} md:bottom-8`}
    >
      <button
        type="button"
        onClick={onReport}
        className={`${btnClass} w-10 h-10 md:w-auto md:h-auto md:px-3 md:py-2 md:gap-2 ${
          reportActive
            ? 'bg-orange-600 text-white ring-2 ring-orange-300'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
        title="Reportar zona afectada"
        aria-label="Reportar zona"
      >
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span className="hidden md:inline text-sm font-medium whitespace-nowrap">Reportar</span>
      </button>
      <button
        type="button"
        onClick={onGeolocate}
        disabled={locating}
        className={`${btnClass} w-10 h-10 md:w-auto md:h-auto md:px-3 md:py-2 md:gap-2 bg-card hover:bg-secondary disabled:opacity-50`}
        title="Mi ubicación"
        aria-label="Mi ubicación"
      >
        <Crosshair className={`w-5 h-5 shrink-0 ${locating ? 'text-accent animate-pulse' : 'text-foreground'}`} />
        <span className="hidden md:inline text-sm font-medium text-foreground whitespace-nowrap">Ubicación</span>
      </button>
    </div>
  )
}
