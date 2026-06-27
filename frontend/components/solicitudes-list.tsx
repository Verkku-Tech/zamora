'use client'

import { useRouter } from 'next/navigation'
import {
  Solicitud,
  estadoSolicitudColores,
  estadoSolicitudLabels,
  tipoSolicitudIconos,
  tipoSolicitudLabels,
  TipoSolicitud,
  EstadoSolicitud,
} from '@/lib/solicitudes-config'
import { POI_ICONS, POI_LABELS, prioridadColores, prioridadNombres, categoriaNombres } from '@/lib/mock-data'
import type { TipoPuntoInteres, CategoriaInsumo } from '@/lib/mock-data'
import { formatCantidad, formatUnidad } from '@/lib/insumos-config'
import { updateSolicitud, deleteSolicitud } from '@/lib/api-client'
import { MapPin, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SolicitudesListProps {
  solicitudes: Solicitud[]
  onRefresh: () => void
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SolicitudesList({ solicitudes, onRefresh }: SolicitudesListProps) {
  const router = useRouter()

  const cambiarEstado = async (id: string, estado: EstadoSolicitud) => {
    try {
      await updateSolicitud(id, { estado })
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta solicitud?')) return
    try {
      await deleteSolicitud(id)
      onRefresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  if (solicitudes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay solicitudes registradas.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {solicitudes.map((s) => {
        const tipo = s.tipo as TipoSolicitud
        return (
          <div key={s.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-sm">{tipoSolicitudIconos[tipo]}</span>
                  <span className="text-xs text-muted-foreground">{tipoSolicitudLabels[tipo]}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${estadoSolicitudColores[s.estado]}`}>
                    {estadoSolicitudLabels[s.estado]}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white ${prioridadColores[s.prioridad]}`}>
                    {prioridadNombres[s.prioridad]}
                  </span>
                </div>
                <p className="font-semibold text-sm">{s.titulo}</p>
                {s.descripcion && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.descripcion}</p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{formatFecha(s.created_at)}</span>
            </div>

            {s.tipo === 'insumo' && s.producto_nombre && (
              <p className="text-xs text-muted-foreground">
                Producto: <strong className="text-foreground">{s.producto_nombre}</strong>
                {s.cantidad_solicitada != null && s.cantidad_solicitada > 0 && (
                  <> · {formatCantidad(s.cantidad_solicitada)} {formatUnidad(s.unidad)}</>
                )}
                {s.categoria && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-muted">
                    {categoriaNombres[s.categoria as CategoriaInsumo] ?? s.categoria}
                  </span>
                )}
              </p>
            )}

            {s.punto_nombre && s.tipo === 'insumo' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Insumo en centro: {POI_ICONS[s.punto_tipo as TipoPuntoInteres] ?? '📍'} {s.punto_nombre}
                </span>
              </div>
            )}

            {(s.latitud != null && s.longitud != null) || s.direccion ? (
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="min-w-0">
                  {s.direccion || `${s.latitud?.toFixed(5)}, ${s.longitud?.toFixed(5)}`}
                </span>
                {s.latitud != null && s.longitud != null && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/map?lat=${encodeURIComponent(String(s.latitud))}&lng=${encodeURIComponent(String(s.longitud))}`,
                      )
                    }
                    className="text-accent hover:underline ml-auto shrink-0"
                  >
                    Ver en mapa
                  </button>
                )}
              </div>
            ) : null}

            {s.solicitante && (
              <p className="text-[11px] text-muted-foreground border-t border-border pt-2">
                Solicitante: {s.solicitante}
                {s.telefono_solicitante && ` · ${s.telefono_solicitante}`}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {s.estado !== 'resuelta' && s.estado !== 'cancelada' && (
                <>
                  {s.estado === 'pendiente' && (
                    <Button size="sm" variant="outline" onClick={() => cambiarEstado(s.id, 'en_busqueda')}>
                      En búsqueda
                    </Button>
                  )}
                  {s.estado !== 'en_proceso' && (
                    <Button size="sm" variant="outline" onClick={() => cambiarEstado(s.id, 'en_proceso')}>
                      En proceso
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600/30"
                    onClick={() => cambiarEstado(s.id, 'resuelta')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Resuelta
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive ml-auto"
                onClick={() => eliminar(s.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
