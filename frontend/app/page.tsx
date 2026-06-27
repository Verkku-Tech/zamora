'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import PublicNavbar from '@/components/public-navbar'
import PoiDetailSheet from '@/components/map/poi-detail-sheet'
import ReporteDialog from '@/components/reporte-dialog'
import { LoadingState, ErrorState } from '@/components/loading-state'
import { useAppData } from '@/lib/hooks/use-app-data'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 min-h-[50vh] bg-secondary animate-pulse flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
})

export default function Page() {
  const { puntos, zonas, insumosByCentro, config, loading, error, refresh } = useAppData()
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null)
  const [showSupplies, setShowSupplies] = useState(false)
  const [reportPickMode, setReportPickMode] = useState(false)
  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [showReporteForm, setShowReporteForm] = useState(false)

  const selectedPoi = selectedPoiId ? puntos.find((p) => p.id === selectedPoiId) ?? null : null

  const handleClosePoi = () => {
    setSelectedPoiId(null)
    setShowSupplies(false)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar currentPage="mapa" />
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar currentPage="mapa" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar currentPage="mapa" />

      <div className="relative flex-1 w-full min-h-[50vh] h-[calc(100dvh-56px)] md:h-[calc(100vh-72px)]">
        <InteractiveMap
          puntos={puntos}
          zonas={zonas}
          config={config}
          hideLegend={!!selectedPoi}
          reportPickMode={reportPickMode}
          onMapPick={handleMapPick}
          onReportPickCancel={cancelReportPick}
          pickMarker={reportCoords}
          onReportClick={startReport}
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
            onClose={handleClosePoi}
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
