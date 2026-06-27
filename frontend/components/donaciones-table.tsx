'use client'

import { DonacionApi } from '@/lib/api-client'
import { POI_ICONS, POI_LABELS, categoriaNombres } from '@/lib/mock-data'
import type { TipoPuntoInteres, CategoriaInsumo } from '@/lib/mock-data'
import { formatCantidad, formatUnidad } from '@/lib/insumos-config'

interface DonacionesTableProps {
  donaciones: DonacionApi[]
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DonacionesTable({ donaciones }: DonacionesTableProps) {
  if (donaciones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No hay donaciones registradas aún.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {donaciones.map((d) => {
        const tipo = d.puntoTipo as TipoPuntoInteres
        const unidad = formatUnidad(d.unidad)
        const catLabel =
          categoriaNombres[d.categoria as CategoriaInsumo] ?? d.categoria

        return (
          <div
            key={d.id}
            className="rounded-xl border border-border bg-card p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground">{d.nombreProducto}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {POI_ICONS[tipo] ?? '📍'} {d.puntoNombre}
                  <span className="mx-1">·</span>
                  {POI_LABELS[tipo] ?? d.puntoTipo}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatFecha(d.createdAt)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                +{formatCantidad(d.cantidad)} {unidad}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {catLabel}
              </span>
              <span className="text-muted-foreground">
                Inventario: {formatCantidad(d.cantidadAnterior)} →{' '}
                <strong className="text-foreground">{formatCantidad(d.cantidadNueva)}</strong>{' '}
                {unidad}
              </span>
            </div>

            {(d.donante || d.notas) && (
              <p className="text-[11px] text-muted-foreground border-t border-border pt-2">
                {d.donante && <span>Donante: {d.donante}</span>}
                {d.donante && d.notas && ' · '}
                {d.notas && <span>{d.notas}</span>}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
