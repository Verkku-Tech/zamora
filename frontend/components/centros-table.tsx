'use client'

import { useState, Fragment } from 'react'
import { PuntoInteres, POI_LABELS, Insumo, prioridadColores, prioridadNombres, categoriaNombres } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, MapPin, Phone, ChevronDown, AlertCircle } from 'lucide-react'

interface CentrosTableProps {
  centros: PuntoInteres[]
  insumosByCentro?: Record<string, Insumo[]>
  onEdit?: (centro: PuntoInteres) => void
  onDelete?: (id: string) => void
  onViewMap?: (centro: PuntoInteres) => void
  readOnly?: boolean
}

const PRIORIDAD_ORDER: Record<string, number> = { critica: 0, alta: 1, media: 2, baja: 3 }

function getStatusColor(estado: string) {
  if (estado === 'activo') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  if (estado === 'parcial') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

function getCapacityPercentage(recibidas: number, capacidad: number) {
  if (capacidad === 0) return 0
  return Math.round((recibidas / capacidad) * 100)
}

function InsumosList({ insumos }: { insumos: Insumo[] }) {
  const tieneCriticos = insumos.some((i) => i.prioridad === 'critica')

  if (insumos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay insumos registrados para este punto.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {tieneCriticos && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded text-xs font-semibold text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Necesidades críticas
        </div>
      )}
      {insumos.map((insumo) => {
        const porcentaje =
          insumo.cantidad_necesaria === 0
            ? 0
            : Math.round((insumo.cantidad_disponible / insumo.cantidad_necesaria) * 100)
        return (
          <div
            key={insumo.id}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-secondary/30"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{insumo.nombre}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {insumo.cantidad_disponible} / {insumo.cantidad_necesaria} {insumo.unidad}
                <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-muted">
                  {categoriaNombres[insumo.categoria]}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex-1 sm:w-24 h-2 bg-muted rounded-full overflow-hidden min-w-[80px]">
                <div
                  className={`h-full transition-all ${porcentaje >= 75 ? 'bg-green-500' : porcentaje >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(porcentaje, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{porcentaje}%</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${prioridadColores[insumo.prioridad]} text-white`}
              >
                {prioridadNombres[insumo.prioridad]}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CentroActions({
  centro,
  readOnly,
  onViewMap,
  onEdit,
  onDelete,
  compact = false,
}: {
  centro: PuntoInteres
  readOnly: boolean
  onViewMap?: (centro: PuntoInteres) => void
  onEdit?: (centro: PuntoInteres) => void
  onDelete?: (id: string) => void
  compact?: boolean
}) {
  if (readOnly) return null

  return (
    <div className={`flex items-center ${compact ? 'justify-end gap-1' : 'justify-center gap-2'}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onViewMap?.(centro)
        }}
        className="hover:bg-secondary"
        title="Ver en mapa"
      >
        <MapPin className="w-4 h-4 text-accent" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onEdit?.(centro)
        }}
        className="hover:bg-secondary"
        title="Editar"
      >
        <Edit2 className="w-4 h-4 text-blue-500" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          onDelete?.(centro.id)
        }}
        className="hover:bg-secondary"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  )
}

function DonacionesBar({ recibidas, capacidad }: { recibidas: number; capacidad: number }) {
  const pct = getCapacityPercentage(recibidas, capacidad)
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">
        {recibidas} / {capacidad}
      </p>
      <div className="w-full max-w-[120px] h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{pct}%</p>
    </div>
  )
}

export default function CentrosTable({
  centros,
  insumosByCentro = {},
  onEdit,
  onDelete,
  onViewMap,
  readOnly = false,
}: CentrosTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getSortedInsumos = (id: string): Insumo[] => {
    const insumos = insumosByCentro[id] || []
    return [...insumos].sort((a, b) => PRIORIDAD_ORDER[a.prioridad] - PRIORIDAD_ORDER[b.prioridad])
  }

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)

  return (
    <>
      {/* Vista móvil: tarjetas */}
      <div className="md:hidden space-y-3">
        {centros.map((centro) => {
          const isExpanded = expandedId === centro.id
          const insumos = getSortedInsumos(centro.id)

          return (
            <article
              key={centro.id}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(centro.id)}
                    className="mt-0.5 p-1 hover:bg-secondary rounded shrink-0"
                    aria-expanded={isExpanded}
                    aria-label="Ver insumos"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <button type="button" onClick={() => toggleExpand(centro.id)} className="text-left w-full">
                      <p className="font-semibold text-foreground leading-snug">{centro.nombre}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {centro.ciudad}, {centro.municipio}
                      </p>
                    </button>
                  </div>
                  {!readOnly && (
                    <CentroActions
                      centro={centro}
                      readOnly={readOnly}
                      onViewMap={onViewMap}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      compact
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                    {POI_LABELS[centro.tipo]}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusColor(centro.estado_operativo)}`}
                  >
                    {centro.estado_operativo.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Responsable</p>
                    <p className="font-medium text-foreground truncate">{centro.responsable}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span className="truncate">{centro.telefono}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Beneficiarios</p>
                    <p className="font-medium text-foreground">{centro.beneficiarios}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Donaciones</p>
                  <DonacionesBar recibidas={centro.donacionesRecibidas} capacidad={centro.capacidad} />
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border bg-secondary/20 px-4 py-3">
                  <InsumosList insumos={insumos} />
                </div>
              )}
            </article>
          )
        })}
      </div>

      {/* Vista desktop: tabla */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px]">
          <thead className="bg-primary/5 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground w-10"></th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Punto</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Tipo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Responsable</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Donaciones</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Beneficiarios</th>
              {!readOnly && (
                <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {centros.map((centro) => {
              const isExpanded = expandedId === centro.id
              const insumos = getSortedInsumos(centro.id)
              const colCount = readOnly ? 7 : 8

              return (
                <Fragment key={centro.id}>
                  <tr className={`hover:bg-secondary/50 transition-colors ${isExpanded ? 'bg-secondary/30' : ''}`}>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleExpand(centro.id)}
                        className="p-1 hover:bg-secondary rounded transition-transform"
                        title="Ver insumos"
                      >
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <button type="button" onClick={() => toggleExpand(centro.id)} className="text-left hover:underline">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{centro.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {centro.ciudad}, {centro.municipio}
                          </p>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                        {POI_LABELS[centro.tipo]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{centro.responsable}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {centro.telefono}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(centro.estado_operativo)}`}
                      >
                        {centro.estado_operativo.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <DonacionesBar recibidas={centro.donacionesRecibidas} capacidad={centro.capacidad} />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-foreground">{centro.beneficiarios}</p>
                    </td>
                    {!readOnly && (
                      <td className="px-4 py-4">
                        <CentroActions
                          centro={centro}
                          readOnly={readOnly}
                          onViewMap={onViewMap}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </td>
                    )}
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={colCount} className="px-0 py-0 bg-secondary/20">
                        <div className="px-6 lg:px-12 py-4">
                          <InsumosList insumos={insumos} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
