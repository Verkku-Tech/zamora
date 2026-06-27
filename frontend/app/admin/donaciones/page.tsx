'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import AdminNavbar from '@/components/admin-navbar'
import DonacionFormDialog from '@/components/donacion-form-dialog'
import DonacionesTable from '@/components/donaciones-table'
import { LoadingState, ErrorState } from '@/components/loading-state'
import { useAppData } from '@/lib/hooks/use-app-data'
import { getDonaciones, DonacionApi } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Plus, Search, Gift } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { POI_ICONS, POI_LABELS } from '@/lib/mock-data'
import type { TipoPuntoInteres } from '@/lib/mock-data'

export default function DonacionesPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { puntos, insumosByCentro, loading, error, refresh } = useAppData()
  const [donaciones, setDonaciones] = useState<DonacionApi[]>([])
  const [loadingDonaciones, setLoadingDonaciones] = useState(true)
  const [donacionesError, setDonacionesError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroPunto, setFiltroPunto] = useState('')

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  const loadDonaciones = useCallback(async () => {
    setLoadingDonaciones(true)
    setDonacionesError(null)
    try {
      const data = await getDonaciones(filtroPunto || undefined, 200)
      setDonaciones(data)
    } catch (err) {
      setDonacionesError(err instanceof Error ? err.message : 'Error al cargar donaciones')
    } finally {
      setLoadingDonaciones(false)
    }
  }, [filtroPunto])

  useEffect(() => {
    if (isAuthenticated) loadDonaciones()
  }, [isAuthenticated, loadDonaciones])

  const handleSaved = async () => {
    await refresh()
    await loadDonaciones()
  }

  const filtered = donaciones.filter((d) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      d.nombreProducto.toLowerCase().includes(q) ||
      d.puntoNombre.toLowerCase().includes(q) ||
      (d.donante?.toLowerCase().includes(q) ?? false)
    )
  })

  if (!isAuthenticated) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar currentPage="donaciones" />
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar currentPage="donaciones" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar currentPage="donaciones" />

      <main className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Gift className="w-7 h-7 text-accent" />
              Gestión de Donaciones
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Registra donaciones a puntos existentes. Se suman al inventario actual.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2 w-full sm:w-fit"
          >
            <Plus className="w-4 h-4" />
            Nueva donación
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar producto, punto o donante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border h-10"
            />
          </div>
          <select
            value={filtroPunto}
            onChange={(e) => setFiltroPunto(e.target.value)}
            className="h-10 rounded-md border border-border bg-secondary px-3 text-sm"
          >
            <option value="">Todos los puntos</option>
            {puntos.map((p) => {
              const tipo = p.tipo as TipoPuntoInteres
              return (
                <option key={p.id} value={p.id}>
                  {POI_ICONS[tipo]} {p.nombre}
                </option>
              )
            })}
          </select>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Historial de donaciones
          </h2>
          {loadingDonaciones ? (
            <LoadingState />
          ) : donacionesError ? (
            <ErrorState message={donacionesError} onRetry={loadDonaciones} />
          ) : (
            <DonacionesTable donaciones={filtered} />
          )}
        </div>
      </main>

      <DonacionFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={handleSaved}
        puntos={puntos}
        insumosByCentro={insumosByCentro}
      />
    </div>
  )
}
