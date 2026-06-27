'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Map, { MapRef, NavigationControl, Marker } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import PoiMarkers from './map/poi-markers'
import Legend from './map/legend'
import MapFloatingControls from './map/map-floating-controls'
import MapPickHint from './map/map-pick-hint'
import { PuntoInteres, ZonaAfectada, ConfigApp, CONFIG_APP } from '@/lib/mock-data'

interface InteractiveMapProps {
  puntos: PuntoInteres[]
  zonas: ZonaAfectada[]
  config?: ConfigApp
  onPoiClick?: (punto: PuntoInteres) => void
  hideLegend?: boolean
  reportPickMode?: boolean
  pickHint?: string
  onMapPick?: (lat: number, lng: number) => void
  onReportPickCancel?: () => void
  pickMarker?: { lat: number; lng: number } | null
  onReportClick?: () => void
  sidePanelOpen?: boolean
}

const HEATMAP_SOURCE = 'zonas-afectadas-source'
const HEATMAP_LAYER = 'zonas-afectadas-heat'

function buildHeatmapGeoJSON(zonas: ZonaAfectada[]): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: zonas.map((z) => ({
      type: 'Feature' as const,
      properties: { intensidad: z.intensidad, descripcion: z.descripcion },
      geometry: { type: 'Point' as const, coordinates: [z.longitud, z.latitud] },
    })),
  }
}

function addHeatmapLayer(map: MapLibreMap, zonas: ZonaAfectada[]) {
  if (map.getSource(HEATMAP_SOURCE)) return
  map.addSource(HEATMAP_SOURCE, {
    type: 'geojson',
    data: buildHeatmapGeoJSON(zonas),
  })
  map.addLayer({
    id: HEATMAP_LAYER,
    type: 'heatmap',
    source: HEATMAP_SOURCE,
    paint: {
      'heatmap-weight': ['get', 'intensidad'],
      'heatmap-intensity': 0.6,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0, 255, 0, 0)',
        0.2, 'rgba(0, 255, 0, 0.5)',
        0.4, 'rgba(255, 255, 0, 0.6)',
        0.6, 'rgba(255, 165, 0, 0.7)',
        0.8, 'rgba(255, 0, 0, 0.8)',
        1, 'rgba(139, 0, 0, 0.9)',
      ],
      'heatmap-radius': 40,
      'heatmap-opacity': 0.7,
    },
  })
}

export default function InteractiveMap({
  puntos,
  zonas,
  config = CONFIG_APP,
  onPoiClick,
  hideLegend = false,
  reportPickMode = false,
  pickHint = 'Selecciona la zona afectada en el mapa',
  onMapPick,
  onReportPickCancel,
  pickMarker = null,
  onReportClick,
  sidePanelOpen = false,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef>(null)
  const heatmapAddedRef = useRef(false)
  const geolocatedRef = useRef(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [locating, setLocating] = useState(false)

  const resizeMap = useCallback(() => {
    const map = mapRef.current?.getMap() as MapLibreMap | undefined
    map?.resize()
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => resizeMap())
    observer.observe(el)
    return () => observer.disconnect()
  }, [resizeMap])

  useEffect(() => {
    if (!mapLoaded || geolocatedRef.current) return
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          geolocatedRef.current = true
          const map = mapRef.current?.getMap() as MapLibreMap | undefined
          if (map) {
            map.flyTo({
              center: [pos.coords.longitude, pos.coords.latitude],
              zoom: 14,
              duration: 1500,
            })
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 },
      )
    }
  }, [mapLoaded])

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current.getMap() as MapLibreMap
    if (!map || !heatmapAddedRef.current) return
    const source = map.getSource(HEATMAP_SOURCE) as GeoJSONSource | undefined
    if (source) source.setData(buildHeatmapGeoJSON(zonas))
  }, [zonas])

  const handleMapLoad = useCallback(
    (e: { target: MapLibreMap }) => {
      const map = e.target
      resizeMap()
      requestAnimationFrame(() => resizeMap())
      setTimeout(() => resizeMap(), 100)
      setTimeout(() => resizeMap(), 500)

      if (!heatmapAddedRef.current) {
        try {
          addHeatmapLayer(map, zonas)
          heatmapAddedRef.current = true
        } catch {
          /* heatmap opcional — no bloquear mapa base */
        }
      }
      setMapLoaded(true)
    },
    [zonas, resizeMap],
  )

  const handleGeolocate = useCallback(() => {
    const map = mapRef.current?.getMap() as MapLibreMap | undefined
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
        () => setLocating(false),
        { enableHighAccuracy: true, timeout: 10000 },
      )
    } else {
      setLocating(false)
    }
  }, [locating])

  const handleMapClick = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (reportPickMode && onMapPick) {
        onMapPick(e.lngLat.lat, e.lngLat.lng)
      }
    },
    [reportPickMode, onMapPick],
  )

  const handlePoiClick = useCallback(
    (punto: PuntoInteres) => {
      if (reportPickMode) return
      onPoiClick?.(punto)
    },
    [onPoiClick, reportPickMode],
  )

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full min-h-[300px] ${reportPickMode ? 'cursor-crosshair' : ''}`}
    >
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          longitude: config.ubicacion_predeterminada.longitud,
          latitude: config.ubicacion_predeterminada.latitud,
          zoom: config.ubicacion_predeterminada.zoom,
        }}
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}
        onLoad={handleMapLoad}
        onClick={handleMapClick}
      >
        <PoiMarkers puntos={puntos} onPoiClick={handlePoiClick} disabled={reportPickMode} />
        <NavigationControl position="bottom-right" showCompass={false} />
        {pickMarker && (
          <Marker longitude={pickMarker.lng} latitude={pickMarker.lat} anchor="center">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-10 h-10 rounded-full bg-orange-500/30 animate-ping" />
              <span className="relative w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-lg" />
            </div>
          </Marker>
        )}
      </Map>

      {reportPickMode && onReportPickCancel && (
        <MapPickHint message={pickHint} onCancel={onReportPickCancel} />
      )}

      {onReportClick && (
        <MapFloatingControls
          onReport={onReportClick}
          onGeolocate={handleGeolocate}
          locating={locating}
          reportActive={reportPickMode}
          sidePanelOpen={sidePanelOpen}
        />
      )}

      <Legend hidden={hideLegend || reportPickMode} />

      <div className="absolute bottom-2 right-14 md:right-16 text-[9px] md:text-[10px] text-muted-foreground/60 bg-card/80 px-1.5 py-0.5 rounded z-20 pointer-events-none">
        © OpenFreeMap
      </div>
    </div>
  )
}
