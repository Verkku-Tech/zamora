'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import AdminNavbar from '@/components/admin-navbar'
import SolicitudesList from '@/components/solicitudes-list'
import { LoadingState, ErrorState } from '@/components/loading-state'
import { getSolicitudes, mapSolicitud } from '@/lib/api-client'
import {
  Solicitud,
  ESTADOS_SOLICITUD,
  estadoSolicitudLabels,
} from '@/lib/solicitudes-config'
import { ClipboardList } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminSolicitudesPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    if (!isAuthenticated) router.push('/login')
  }, [isAuthenticated, router])

  const loadSolicitudes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSolicitudes(filtroTipo || undefined, filtroEstado || undefined, 200)
      setSolicitudes(data.map(mapSolicitud))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes')
    } finally {
      setLoading(false)
    }
  }, [filtroTipo, filtroEstado])

  useEffect(() => {
    if (isAuthenticated) loadSolicitudes()
  }, [isAuthenticated, loadSolicitudes])

  if (!isAuthenticated) return null

  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente' || s.estado === 'en_busqueda').length

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar currentPage="dashboard" />

      <main className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-accent" />
              Bandeja de solicitudes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestión interna: revisar, cambiar estado y dar seguimiento a las solicitudes recibidas.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/solicitudes">Ver portal público</Link>
          </Button>
        </div>

        <section className="bg-card rounded-xl border border-border p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="font-semibold">Solicitudes registradas</h2>
              {pendientes > 0 && (
                <p className="text-xs text-orange-500 mt-0.5">{pendientes} pendiente{pendientes !== 1 ? 's' : ''}</p>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="h-9 rounded-md border border-border bg-secondary px-2 text-xs"
              >
                <option value="">Todos los tipos</option>
                <option value="insumo">Insumos</option>
                <option value="inspeccion">Inspecciones</option>
              </select>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="h-9 rounded-md border border-border bg-secondary px-2 text-xs"
              >
                <option value="">Todos los estados</option>
                {ESTADOS_SOLICITUD.map((e) => (
                  <option key={e} value={e}>{estadoSolicitudLabels[e]}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={loadSolicitudes} />
          ) : (
            <SolicitudesList solicitudes={solicitudes} onRefresh={loadSolicitudes} />
          )}
        </section>
      </main>
    </div>
  )
}
