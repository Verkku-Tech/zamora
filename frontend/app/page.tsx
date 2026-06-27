'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import PublicNavbar from '@/components/public-navbar'
import PoiDetailSheet from '@/components/map/poi-detail-sheet'
import ReporteDialog from '@/components/reporte-dialog'
import { LoadingState, ErrorState } from '@/components/loading-state'
import { useAppData } from '@/lib/hooks/use-app-data'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary animate-pulse" />,
})

export default function Page() {
  const { puntos, zonas, insumosByCentro, config, loading, error, refresh } = useAppData()
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null)
  const [showSupplies, setShowSupplies] = useState(false)
  const [showReporte, setShowReporte] = useState(false)

  const selectedPoi = selectedPoiId ? puntos.find((p) => p.id === selectedPoiId) ?? null : null

  const handleClosePoi = () => {
    setSelectedPoiId(null)
    setShowSupplies(false)
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

      <div className="relative flex-1 min-h-0 h-[calc(100dvh-64px)] md:h-[calc(100vh-80px)]">
        <InteractiveMap
          puntos={puntos}
          zonas={zonas}
          config={config}
          hideLegend={!!selectedPoi}
          onPoiClick={(poi) => {
            setSelectedPoiId(poi.id)
            setShowSupplies(false)
          }}
        />

        <Button
          onClick={() => setShowReporte(true)}
          size="sm"
          className="absolute left-2 top-2 md:left-4 md:top-4 z-40 bg-orange-500 hover:bg-orange-600 text-white shadow-lg h-9 px-2.5 md:h-10 md:px-4"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="hidden sm:inline ml-1.5">Reportar zona</span>
        </Button>

        {selectedPoi && (
          <PoiDetailSheet
            poi={selectedPoi}
            insumos={insumosByCentro[selectedPoi.id] || []}
            showSupplies={showSupplies}
            onShowSupplies={setShowSupplies}
            onClose={handleClosePoi}
          />
        )}
      </div>

      <ReporteDialog
        open={showReporte}
        onClose={() => setShowReporte(false)}
        onReported={refresh}
        latitud={config.ubicacion_predeterminada.latitud}
        longitud={config.ubicacion_predeterminada.longitud}
      />
    </div>
  )
}
