'use client'

import { useState, useEffect } from 'react'
import PublicNavbar from '@/components/public-navbar'
import CentrosTable from '@/components/centros-table'
import { LoadingState, ErrorState } from '@/components/loading-state'
import { useAppData } from '@/lib/hooks/use-app-data'
import { PuntoInteres } from '@/lib/mock-data'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function PublicCentrosPage() {
  const { puntos, insumosByCentro, loading, error, refresh } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCentros, setFilteredCentros] = useState<PuntoInteres[]>([])

  useEffect(() => {
    const filtered = puntos.filter(
      (centro) =>
        centro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.responsable.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCentros(filtered)
  }, [searchTerm, puntos])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar currentPage="centros" />
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar currentPage="centros" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar currentPage="centros" />

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8 space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Centros de Acopio</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Conoce los centros activos y qué necesitan</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, ciudad o responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary text-foreground placeholder-muted-foreground border-border h-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total de Centros</p>
            <p className="text-2xl font-bold text-foreground">{puntos.length}</p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Activos</p>
            <p className="text-2xl font-bold text-green-500">
              {puntos.filter((c) => c.estado_operativo === 'activo').length}
            </p>
          </div>
          <div className="bg-card rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-1">Beneficiarios Totales</p>
            <p className="text-2xl font-bold text-foreground">
              {puntos.reduce((sum, c) => sum + c.beneficiarios, 0)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mostrando <strong>{filteredCentros.length}</strong> de <strong>{puntos.length}</strong> centros
          </p>
          <CentrosTable centros={filteredCentros} insumosByCentro={insumosByCentro} readOnly />
        </div>

        {filteredCentros.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron centros con ese término de búsqueda</p>
          </div>
        )}
      </main>
    </div>
  )
}
