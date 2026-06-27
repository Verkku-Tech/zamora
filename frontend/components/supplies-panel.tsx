'use client'

import { useState, useMemo } from 'react'
import { Insumo, CategoriaInsumo, categoriaColores, categoriaNombres, prioridadColores, prioridadNombres } from '@/lib/mock-data'
import { ChevronDown, AlertCircle } from 'lucide-react'

interface SuppliesPanelProps {
  insumos: Insumo[]
  centroNombre: string
  embedded?: boolean
}

export default function SuppliesPanel({ insumos, centroNombre, embedded = false }: SuppliesPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<CategoriaInsumo | null>(null)

  // Agrupar insumos por categoría y ordenar por prioridad
  const insumosPorCategoria = useMemo(() => {
    const grupos = insumos.reduce(
      (acc, insumo) => {
        if (!acc[insumo.categoria]) {
          acc[insumo.categoria] = []
        }
        acc[insumo.categoria].push(insumo)
        return acc
      },
      {} as Record<CategoriaInsumo, Insumo[]>,
    )

    // Ordenar insumos en cada categoría por prioridad (crítica primero)
    const prioridadOrder = { critica: 0, alta: 1, media: 2, baja: 3 }
    Object.keys(grupos).forEach((cat) => {
      grupos[cat as CategoriaInsumo].sort(
        (a, b) => prioridadOrder[a.prioridad] - prioridadOrder[b.prioridad],
      )
    })

    return grupos
  }, [insumos])

  const categorias = Object.keys(insumosPorCategoria) as CategoriaInsumo[]
  const categoriasConCriticos = categorias.filter((cat) =>
    insumosPorCategoria[cat].some((i) => i.prioridad === 'critica'),
  )

  const calcularPorcentaje = (disponible: number, necesario: number) => {
    return necesario === 0 ? 0 : Math.round((disponible / necesario) * 100)
  }

  return (
    <div className={`flex flex-col h-full bg-card ${embedded ? '' : ''}`}>
      {!embedded && (
        <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
          <h2 className="font-semibold text-foreground text-lg truncate">{centroNombre}</h2>
          <p className="text-sm text-muted-foreground mt-1">Insumos necesitados</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {categoriasConCriticos.length > 0 && (
          <div className="border-b border-border">
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">Necesidades Críticas</p>
            </div>
          </div>
        )}

        <div className="space-y-2 p-4">
          {categorias.map((categoria) => {
            const insumosCategoria = insumosPorCategoria[categoria]
            const estaExpandida = expandedCategory === categoria
            const tieneCriticos = insumosCategoria.some((i) => i.prioridad === 'critica')

            return (
              <div key={categoria} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedCategory(estaExpandida ? null : categoria)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoriaColores[categoria]}`}>
                      {categoriaNombres[categoria]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {insumosCategoria.length} {insumosCategoria.length === 1 ? 'item' : 'items'}
                    </span>
                    {tieneCriticos && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      estaExpandida ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {estaExpandida && (
                  <div className="divide-y divide-border bg-background/50">
                    {insumosCategoria.map((insumo) => {
                      const porcentaje = calcularPorcentaje(
                        insumo.cantidad_disponible,
                        insumo.cantidad_necesaria,
                      )
                      const esCritico = porcentaje < 50

                      return (
                        <div
                          key={insumo.id}
                          className={`p-3 ${
                            esCritico ? 'bg-red-50 dark:bg-red-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-foreground truncate">
                                {insumo.nombre}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Disponible: {insumo.cantidad_disponible} / Necesario:{' '}
                                {insumo.cantidad_necesaria} {insumo.unidad}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${prioridadColores[insumo.prioridad]} text-white`}>
                              {prioridadNombres[insumo.prioridad]}
                            </div>
                          </div>

                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                porcentaje >= 75
                                  ? 'bg-green-500'
                                  : porcentaje >= 50
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {porcentaje}% disponible
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
