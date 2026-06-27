'use client'

import { useState, useCallback } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import { Crosshair } from 'lucide-react'

export default function GeolocateControl() {
  const { current: map } = useMap()
  const [locating, setLocating] = useState(false)

  const handleGeolocate = useCallback(() => {
    if (!map || locating) return

    setLocating(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 14,
            duration: 1500,
          })
          setLocating(false)
        },
        () => {
          setLocating(false)
        },
        { enableHighAccuracy: true, timeout: 10000 },
      )
    } else {
      setLocating(false)
    }
  }, [map, locating])

  return (
    <button
      onClick={handleGeolocate}
      disabled={locating}
      className="absolute top-3 right-3 md:top-20 md:right-4 z-30 bg-card border border-border rounded-lg shadow-lg p-2 hover:bg-secondary transition-colors disabled:opacity-50"
      title="Mi ubicación"
    >
      <Crosshair className={`w-5 h-5 ${locating ? 'text-accent animate-pulse' : 'text-foreground'}`} />
    </button>
  )
}
