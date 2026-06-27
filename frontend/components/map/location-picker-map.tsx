'use client'

import { useState, useCallback, useEffect } from 'react'
import Map, { Marker, NavigationControl } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Button } from '@/components/ui/button'
import MapPickHint from './map-pick-hint'
import { ConfigApp, CONFIG_APP } from '@/lib/mock-data'

interface LocationPickerMapProps {
  open: boolean
  initialLat?: number
  initialLng?: number
  config?: ConfigApp
  onConfirm: (lat: number, lng: number) => void
  onCancel: () => void
}

export default function LocationPickerMap({
  open,
  initialLat,
  initialLng,
  config = CONFIG_APP,
  onConfirm,
  onCancel,
}: LocationPickerMapProps) {
  const defaultLat = config.ubicacion_predeterminada.latitud
  const defaultLng = config.ubicacion_predeterminada.longitud

  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!open) return
    if (initialLat != null && initialLng != null) {
      setPoint({ lat: initialLat, lng: initialLng })
    } else {
      setPoint(null)
    }
  }, [open, initialLat, initialLng])

  const handleMapClick = useCallback((e: maplibregl.MapMouseEvent) => {
    setPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng })
  }, [])

  if (!open) return null

  const centerLat = point?.lat ?? initialLat ?? defaultLat
  const centerLng = point?.lng ?? initialLng ?? defaultLng

  return (
    <div className="fixed inset-0 z-[60] bg-background cursor-crosshair">
      <MapPickHint message="Haz clic en el mapa para marcar la ubicación" onCancel={onCancel} />

      <Map
        mapLib={maplibregl}
        initialViewState={{
          longitude: centerLng,
          latitude: centerLat,
          zoom: point || initialLat != null ? 15 : config.ubicacion_predeterminada.zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}
        onClick={handleMapClick}
      >
        {point && (
          <Marker longitude={point.lng} latitude={point.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-accent/30 animate-ping" />
              <span className="relative w-5 h-5 rounded-full bg-accent border-2 border-white shadow-lg" />
            </div>
          </Marker>
        )}
        <NavigationControl position="bottom-right" showCompass={false} />
      </Map>

      <div className="absolute bottom-4 inset-x-4 z-50 flex flex-col sm:flex-row gap-2 sm:justify-center pointer-events-none">
        <div className="pointer-events-auto flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {point && (
            <div className="flex items-center justify-center gap-2 bg-card/95 backdrop-blur border border-border rounded-lg px-4 py-2 text-sm shadow-lg">
              <span className="text-muted-foreground">Coordenadas:</span>
              <span className="font-mono font-medium">
                {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
              </span>
            </div>
          )}
          <Button type="button" variant="outline" onClick={onCancel} className="bg-card/95 backdrop-blur">
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!point}
            onClick={() => point && onConfirm(point.lat, point.lng)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Confirmar ubicación
          </Button>
        </div>
      </div>
    </div>
  )
}
