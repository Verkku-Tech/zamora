'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminNavbar from '@/components/admin-navbar'
import CentrosTable from '@/components/centros-table'
import CentroFormDialog from '@/components/centro-form-dialog'
import { LoadingState, ErrorState } from '@/components/loading-state'
import { useAppData } from '@/lib/hooks/use-app-data'
import { deletePuntoInteres } from '@/lib/api-client'
import { PuntoInteres } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function CentrosPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { puntos, insumosByCentro, config, loading, error, refresh } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCentros, setFilteredCentros] = useState<PuntoInteres[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCentro, setEditingCentro] = useState<PuntoInteres | null>(null)

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  useEffect(() => {
    const filtered = puntos.filter(
      (centro) =>
        centro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centro.responsable.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCentros(filtered)
  }, [searchTerm, puntos])

  if (!isAuthenticated) return null

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este centro?')) return
    try {
      await deletePuntoInteres(id)
      await refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar currentPage="centros" />
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNavbar currentPage="centros" />
        <ErrorState message={error} onRetry={refresh} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar currentPage="centros" />

      <main className="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8 space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestión de Centros</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Administra los centros de acopio activos</p>
          </div>
          <Button
            onClick={() => { setEditingCentro(null); setShowForm(true) }}
            className="bg-accent hover:bg-accent/90 text-accent-foreground flex items-center gap-2 w-full sm:w-fit"
          >
            <Plus className="w-4 h-4" />
            Nuevo Centro
          </Button>
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
          <CentrosTable
            centros={filteredCentros}
            insumosByCentro={insumosByCentro}
            onEdit={(c) => { setEditingCentro(c); setShowForm(true) }}
            onDelete={handleDelete}
            onViewMap={(c) =>
              router.push(
                `/admin/map?centro=${encodeURIComponent(c.id)}&lat=${c.latitud}&lng=${c.longitud}`,
              )
            }
          />
        </div>
      </main>

      <CentroFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setEditingCentro(null) }}
        onSaved={refresh}
        centro={editingCentro}
        insumosIniciales={editingCentro ? (insumosByCentro[editingCentro.id] ?? []) : []}
        defaultConfig={config}
      />
    </div>
  )
}
