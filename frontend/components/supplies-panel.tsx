'use client'

import { useMemo, useState } from 'react'
import {
  Insumo,
  CategoriaInsumo,
  categoriaColores,
  categoriaNombres,
  prioridadColores,
  prioridadNombres,
} from '@/lib/mock-data'
import {
  calcularProgresoInsumo,
  formatCantidad,
  formatUnidad,
  getCategoriasFromInsumos,
} from '@/lib/insumos-config'
import { AlertCircle, Target, Package } from 'lucide-react'

interface SuppliesPanelProps {
  insumos: Insumo[]
  centroNombre: string
  embedded?: boolean
}

type FiltroCategoria = 'todas' | CategoriaInsumo

export default function SuppliesPanel({ insumos, centroNombre, embedded = false }: SuppliesPanelProps) {
  const [filtro, setFiltro] = useState<FiltroCategoria>('todas')

  const categorias = useMemo(() => getCategoriasFromInsumos(insumos), [insumos])

  const insumosFiltrados = useMemo(() => {
    const list = filtro === 'todas' ? insumos : insumos.filter((i) => i.categoria === filtro)
    const prioridadOrder = { critica: 0, alta: 1, media: 2, baja: 3 }
    return [...list].sort((a, b) => {
      const catCmp = a.categoria.localeCompare(b.categoria)
      if (catCmp !== 0) return catCmp
      return prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad]
    })
  }, [insumos, filtro])

  const tieneCriticos = insumos.some(
    (i) => i.prioridad === 'critica' || calcularProgresoInsumo(i.cantidad_disponible, i.cantidad_necesaria).faltante > 0,
  )

  if (insumos.length === 0) {
    return (
      <div className="flex flex-col h-full bg-card">
        {!embedded && (
          <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
            <h2 className="font-semibold text-foreground text-lg truncate">{centroNombre}</h2>
            <p className="text-sm text-muted-foreground mt-1">Meta vs. inventario actual</p>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-6 text-sm text-muted-foreground text-center">
          No hay insumos registrados para este centro.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {!embedded && (
        <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
          <h2 className="font-semibold text-foreground text-lg truncate">{centroNombre}</h2>
          <p className="text-sm text-muted-foreground mt-1">Meta vs. inventario actual</p>
        </div>
      )}

      <div className="px-3 py-2 border-b border-border shrink-0">
        <p className="text-[11px] text-muted-foreground mb-2">
          Meta = lo que necesitamos · Actual = lo que tenemos hoy
        </p>
        {tieneCriticos && (
          <div className="mb-2 px-2.5 py-1.5 bg-red-500/10 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-[11px] font-medium text-red-500">Hay insumos por debajo de la meta</p>
          </div>
        )}
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFiltro('todas')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              filtro === 'todas'
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFiltro(cat)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                filtro === cat
                  ? 'bg-accent text-accent-foreground'
                  : `${categoriaColores[cat]} hover:opacity-90`
              }`}
            >
              {categoriaNombres[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3">
        {insumosFiltrados.map((insumo) => {
          const unidad = formatUnidad(insumo.unidad)
          const progreso = calcularProgresoInsumo(
            insumo.cantidad_disponible,
            insumo.cantidad_necesaria,
          )
          const barWidth = Math.min(progreso.porcentaje, 100)

          return (
            <div
              key={insumo.id}
              className={`rounded-xl border p-3 space-y-3 ${
                progreso.faltante > 0
                  ? 'border-orange-500/30 bg-orange-500/5'
                  : 'border-border bg-secondary/20'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {filtro === 'todas' && (
                    <span
                      className={`inline-block mb-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoriaColores[insumo.categoria]}`}
                    >
                      {categoriaNombres[insumo.categoria]}
                    </span>
                  )}
                  <p className="font-semibold text-sm text-foreground leading-snug">{insumo.nombre}</p>
                </div>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold text-white ${prioridadColores[insumo.prioridad]}`}
                >
                  {prioridadNombres[insumo.prioridad]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-background/60 border border-border p-2.5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <Target className="w-3 h-3" />
                    Meta
                  </div>
                  <p className="text-base font-bold tabular-nums leading-none">
                    {formatCantidad(insumo.cantidad_necesaria)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{unidad}</p>
                </div>
                <div className="rounded-lg bg-background/60 border border-border p-2.5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <Package className="w-3 h-3" />
                    Actual
                  </div>
                  <p
                    className={`text-base font-bold tabular-nums leading-none ${
                      progreso.faltante > 0 ? 'text-orange-500' : 'text-green-500'
                    }`}
                  >
                    {formatCantidad(insumo.cantidad_disponible)}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{unidad}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Cobertura de la meta</span>
                  <span className="font-medium tabular-nums">{progreso.porcentaje}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      progreso.porcentaje >= 100
                        ? 'bg-green-500'
                        : progreso.porcentaje >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <p className="text-[11px] mt-1.5 font-medium">
                  {progreso.faltante > 0 ? (
                    <span className="text-orange-500">
                      Faltan {formatCantidad(progreso.faltante)} {unidad}
                    </span>
                  ) : progreso.excedente > 0 ? (
                    <span className="text-green-500">
                      Meta cubierta (+{formatCantidad(progreso.excedente)} {unidad})
                    </span>
                  ) : (
                    <span className="text-green-500">Meta cubierta</span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
