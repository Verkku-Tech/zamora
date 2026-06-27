'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import AdminNavbar from '@/components/admin-navbar'
import PoiDetailSheet from '@/components/map/poi-detail-sheet'
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

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    const centroId = searchParams.get('centro')
    if (centroId && puntos.length > 0) {
      const found = puntos.find((p) => p.id === centroId)
      if (found) setSelectedPoiId(found.id)
    }
  }, [searchParams, puntos])

  const selectedPoi = selectedPoiId ? puntos.find((p) => p.id === selectedPoiId) ?? null : null

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

        {selectedPoi && (
          <PoiDetailSheet
            poi={selectedPoi}
            insumos={insumosByCentro[selectedPoi.id] || []}
            showSupplies={showSupplies}
            onShowSupplies={setShowSupplies}
            onClose={() => {
              setSelectedPoiId(null)
              setShowSupplies(false)
            }}
            compact
          />
        )}
      </div>
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
