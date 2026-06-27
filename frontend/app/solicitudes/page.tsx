'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PublicNavbar from '@/components/public-navbar'
import SolicitudFormDialog from '@/components/solicitud-form-dialog'
import { buscarInsumos, mapInsumoBusqueda } from '@/lib/api-client'
import { InsumoBusqueda, TipoSolicitud } from '@/lib/solicitudes-config'
import { formatCantidad, formatUnidad } from '@/lib/insumos-config'
import { POI_ICONS, POI_LABELS, categoriaNombres } from '@/lib/mock-data'
import type { TipoPuntoInteres, CategoriaInsumo } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClipboardList, Search, Plus, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function SolicitudesPage() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [resultados, setResultados] = useState<InsumoBusqueda[]>([])
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [formTipo, setFormTipo] = useState<TipoSolicitud>('insumo')
  const [insumoSeleccionado, setInsumoSeleccionado] = useState<InsumoBusqueda | null>(null)
  const [mensajeExito, setMensajeExito] = useState('')

  const handleBuscar = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (busqueda.trim().length < 2) return
    setBuscando(true)
    setBusquedaRealizada(true)
    setMensajeExito('')
    try {
      const data = await buscarInsumos(busqueda.trim())
      setResultados(data.map(mapInsumoBusqueda))
    } catch {
      setResultados([])
    } finally {
      setBuscando(false)
    }
  }

  const abrirForm = (tipo: TipoSolicitud, insumo?: InsumoBusqueda | null) => {
    setFormTipo(tipo)
    setInsumoSeleccionado(insumo ?? null)
    setMensajeExito('')
    setShowForm(true)
  }

  const handleSaved = () => {
    setMensajeExito('Solicitud registrada correctamente. El equipo de coordinación la revisará pronto.')
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar currentPage="solicitudes" />

      <main className="max-w-4xl mx-auto px-3 py-4 sm:px-4 sm:py-6 md:py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-accent" />
              Solicitudes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entidades estatales y municipales pueden registrar solicitudes de insumos e inspecciones de lugar.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => abrirForm('inspeccion')}
              className="flex-1 sm:flex-none"
            >
              🏗️ Inspección
            </Button>
            <Button
              onClick={() => abrirForm('insumo')}
              className="bg-accent hover:bg-accent/90 flex-1 sm:flex-none gap-1"
            >
              <Plus className="w-4 h-4" />
              Nueva solicitud
            </Button>
          </div>
        </div>

        {mensajeExito && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            {mensajeExito}
          </div>
        )}

        <section className="bg-card rounded-xl border border-border p-4 space-y-4">
          <div>
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-accent" />
              Buscar insumo en centros
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Ej: medicinas, paracetamol, agua, arroz… Busca en todos los puntos registrados.
            </p>
          </div>

          <form onSubmit={handleBuscar} className="flex gap-2">
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="¿Qué insumo necesitas?"
              className="flex-1 bg-secondary"
            />
            <Button type="submit" disabled={busqueda.trim().length < 2 || buscando} className="bg-accent hover:bg-accent/90 shrink-0">
              {buscando ? '...' : 'Buscar'}
            </Button>
          </form>

          {busquedaRealizada && !buscando && resultados.length === 0 && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">No se encontró &quot;{busqueda}&quot; en ningún centro</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Puedes crear una solicitud para gestionarla con el equipo de coordinación.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => abrirForm('insumo')}
                className="bg-accent hover:bg-accent/90"
              >
                Crear solicitud de insumo
              </Button>
            </div>
          )}

          {resultados.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
              </p>
              {resultados.map((r) => (
                <div
                  key={r.insumo_id}
                  className="rounded-lg border border-border bg-secondary/20 p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{r.producto_nombre}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-muted">
                        {categoriaNombres[r.categoria as CategoriaInsumo] ?? r.categoria}
                      </span>
                      <span>
                        Actual: <strong className="text-foreground">{formatCantidad(r.cantidad_disponible)}</strong>{' '}
                        {formatUnidad(r.unidad)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent" />
                      {POI_ICONS[r.punto_tipo as TipoPuntoInteres]}{' '}
                      {r.punto_nombre}
                      <span className="opacity-70">
                        · {POI_LABELS[r.punto_tipo as TipoPuntoInteres]} · {r.punto_ciudad}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/?centro=${encodeURIComponent(r.punto_interes_id)}`)
                      }
                    >
                      Ver mapa
                    </Button>
                    <Button
                      size="sm"
                      className="bg-accent hover:bg-accent/90"
                      onClick={() => abrirForm('insumo', r)}
                    >
                      Registrar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <SolicitudFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setInsumoSeleccionado(null) }}
        onSaved={handleSaved}
        tipoInicial={formTipo}
        insumoEncontrado={insumoSeleccionado}
        terminoBusqueda={busqueda}
      />
    </div>
  )
}
