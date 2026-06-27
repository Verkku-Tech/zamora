'use client'

import { MapPin, X, Crosshair } from 'lucide-react'

interface MapPickHintProps {
  message: string
  onCancel: () => void
  onUseCurrentLocation?: () => void
  locatingCurrent?: boolean
}

export default function MapPickHint({
  message,
  onCancel,
  onUseCurrentLocation,
  locatingCurrent = false,
}: MapPickHintProps) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex justify-center px-3 w-full max-w-lg pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border shadow-lg rounded-full pl-3 pr-1.5 py-1.5 text-sm text-foreground">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" aria-hidden />
        <span className="font-medium leading-snug">{message}</span>
        {onUseCurrentLocation && (
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={locatingCurrent}
            title="Usar ubicación actual"
            aria-label="Usar ubicación actual"
            className="p-1 rounded-full hover:bg-secondary shrink-0 text-muted-foreground disabled:opacity-50"
          >
            <Crosshair className={`w-4 h-4 ${locatingCurrent ? 'text-accent animate-pulse' : ''}`} />
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-full hover:bg-secondary shrink-0 text-muted-foreground"
          aria-label="Cancelar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
