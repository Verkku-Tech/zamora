'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import AdminNavbar from '@/components/admin-navbar'
import PoiDetailSheet from '@/components/map/poi-detail-sheet'
import ReporteDialog from '@/components/reporte-dialog'
import { LoadingState, ErrorState } from '@/components/loading-state'
import { useAppData } from '@/lib/hooks/use-app-data'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary animate-pulse" />,
})

function AdminMapContent() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { puntos, zonas, insumosByCentro, config, loading, error, refresh } = useAppData()
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null)
  const [showSupplies, setShowSupplies] = useState(false)
  const [reportPickMode, setReportPickMode] = useState(false)
  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showReporteForm, setShowReporteForm] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    const centroId = searchParams.get('centro')
    if (!centroId || puntos.length === 0) return
    const found = puntos.find((p) => p.id.toLowerCase() === centroId.toLowerCase())
    if (found) setSelectedPoiId(found.id)
  }, [searchParams, puntos])

  const selectedPoi = selectedPoiId
    ? puntos.find((p) => p.id.toLowerCase() === selectedPoiId.toLowerCase()) ?? null
    : null

  const latParam = searchParams.get('lat')
  const lngParam = searchParams.get('lng')
  const urlFocus =
    latParam && lngParam && !Number.isNaN(Number(latParam)) && !Number.isNaN(Number(lngParam))
      ? { lat: Number(latParam), lng: Number(lngParam), zoom: 16 as const }
      : null

  const startReport = () => {
    setReportPickMode(true)
    setShowReporteForm(false)
    setReportCoords(null)
    setSelectedPoiId(null)
    setShowSupplies(false)
  }

  const cancelReportPick = () => {
    setReportPickMode(false)
    setReportCoords(null)
  }

  const handleMapPick = (lat: number, lng: number) => {
    setReportCoords({ lat, lng })
    setReportPickMode(false)
    setShowReporteForm(true)
  }

  const handleReportDone = () => {
    setReportCoords(null)
    refresh()
  }

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar currentPage="map" />
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar currentPage="map" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavbar currentPage="map" />

      <div className="relative flex-1 w-full min-h-[50vh] h-[calc(100dvh-56px)] md:h-[calc(100vh-72px)]">
        <InteractiveMap
          puntos={puntos}
          zonas={zonas}
          config={config}
          hideLegend={!!selectedPoi}
          autoGeolocate={false}
          focusLocation={
            selectedPoi
              ? { lat: selectedPoi.latitud, lng: selectedPoi.longitud, zoom: 16 }
              : urlFocus
          }
          reportPickMode={reportPickMode}
          pickHint="Selecciona la zona afectada en el mapa"
          onMapPick={handleMapPick}
          onReportPickCancel={cancelReportPick}
          pickMarker={reportCoords}
          onReportClick={startReport}
          sidePanelOpen={!!selectedPoi && !reportPickMode}
          onPoiClick={(poi) => {
            setSelectedPoiId(poi.id)
            setShowSupplies(false)
          }}
        />

        {selectedPoi && !reportPickMode && (
          <PoiDetailSheet
            poi={selectedPoi}
            insumos={insumosByCentro[selectedPoi.id] || []}
            showSupplies={showSupplies}
            onShowSupplies={setShowSupplies}
            onClose={() => {
              setSelectedPoiId(null)
              setShowSupplies(false)
            }}
          />
        )}
      </div>

      {showReporteForm && reportCoords && (
        <ReporteDialog
          open={showReporteForm}
          onClose={() => {
            setShowReporteForm(false)
            setReportCoords(null)
          }}
          onReported={handleReportDone}
          latitud={reportCoords.lat}
          longitud={reportCoords.lng}
        />
      )}
    </div>
  )
}

export default function AdminMapPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminMapContent />
    </Suspense>
  )
}
