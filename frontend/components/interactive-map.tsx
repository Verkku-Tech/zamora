'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Map, { MapRef, NavigationControl } from 'react-map-gl/maplibre'
import maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import PoiMarkers from './map/poi-markers'
import Legend from './map/legend'
import GeolocateControl from './map/geolocate-control'
import { PuntoInteres, ZonaAfectada, ConfigApp, CONFIG_APP } from '@/lib/mock-data'

interface InteractiveMapProps {
  puntos: PuntoInteres[]
  zonas: ZonaAfectada[]
  config?: ConfigApp
  onPoiClick?: (punto: PuntoInteres) => void
  hideLegend?: boolean
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

export default function InteractiveMap({ puntos, zonas, config = CONFIG_APP, onPoiClick, hideLegend = false }: InteractiveMapProps) {
  const mapRef = useRef<MapRef>(null)
  const heatmapAddedRef = useRef(false)
  const geolocatedRef = useRef(false)
  const [mapLoaded, setMapLoaded] = useState(false)

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
    if (!map) return

    const source = map.getSource(HEATMAP_SOURCE) as GeoJSONSource | undefined
    if (source) {
      source.setData(buildHeatmapGeoJSON(zonas))
    }
  }, [zonas])

  const handleMapLoad = useCallback((e: { target: MapLibreMap }) => {
    const map = e.target
    if (heatmapAddedRef.current) return

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

    heatmapAddedRef.current = true
    setMapLoaded(true)
  }, [zonas])

  const handlePoiClick = useCallback(
    (punto: PuntoInteres) => {
      onPoiClick?.(punto)
    },
    [onPoiClick],
  )

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={{
          longitude: config.ubicacion_predeterminada.longitud,
          latitude: config.ubicacion_predeterminada.latitud,
          zoom: config.ubicacion_predeterminada.zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={false}
        onLoad={handleMapLoad}
      >
        <PoiMarkers puntos={puntos} onPoiClick={handlePoiClick} />
        <NavigationControl position="top-left" />
        <GeolocateControl />
      </Map>
      <Legend hidden={hideLegend} />
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 text-[9px] md:text-[10px] text-muted-foreground/60 bg-card/80 px-1.5 py-0.5 rounded z-20 pointer-events-none">
        © OpenFreeMap
      </div>
    </div>
  )
}
