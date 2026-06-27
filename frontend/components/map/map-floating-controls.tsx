'use client'

import { Crosshair, AlertTriangle } from 'lucide-react'

interface MapFloatingControlsProps {
  onReport: () => void
  onGeolocate: () => void
  locating: boolean
  reportActive?: boolean
}

export default function MapFloatingControls({
  onReport,
  onGeolocate,
  locating,
  reportActive = false,
}: MapFloatingControlsProps) {
  const btnClass =
    'w-10 h-10 flex items-center justify-center rounded-lg border border-border shadow-lg transition-colors'

  return (
    <div className="absolute right-3 bottom-[5.75rem] md:bottom-[6.25rem] z-30 flex flex-col gap-2">
      <button
        type="button"
        onClick={onReport}
        className={`${btnClass} ${
          reportActive
            ? 'bg-orange-600 text-white ring-2 ring-orange-300'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
        title="Reportar zona afectada"
        aria-label="Reportar zona"
      >
        <AlertTriangle className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onGeolocate}
        disabled={locating}
        className={`${btnClass} bg-card hover:bg-secondary disabled:opacity-50`}
        title="Mi ubicación"
        aria-label="Mi ubicación"
      >
        <Crosshair className={`w-5 h-5 ${locating ? 'text-accent animate-pulse' : 'text-foreground'}`} />
      </button>
    </div>
  )
}
