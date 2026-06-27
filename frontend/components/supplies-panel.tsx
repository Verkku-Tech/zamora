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
import { getCategoriasFromInsumos } from '@/lib/insumos-config'
import { AlertCircle } from 'lucide-react'

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

  const tieneCriticos = insumos.some((i) => i.prioridad === 'critica')

  const calcularPorcentaje = (disponible: number, necesario: number) =>
    necesario === 0 ? 0 : Math.round((disponible / necesario) * 100)

  if (insumos.length === 0) {
    return (
      <div className={`flex flex-col h-full bg-card ${embedded ? '' : ''}`}>
        {!embedded && (
          <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
            <h2 className="font-semibold text-foreground text-lg truncate">{centroNombre}</h2>
            <p className="text-sm text-muted-foreground mt-1">Inventario de insumos</p>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-6 text-sm text-muted-foreground text-center">
          No hay insumos registrados para este centro.
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-card ${embedded ? '' : ''}`}>
      {!embedded && (
        <div className="sticky top-0 bg-card border-b border-border p-4 z-10">
          <h2 className="font-semibold text-foreground text-lg truncate">{centroNombre}</h2>
          <p className="text-sm text-muted-foreground mt-1">Inventario de insumos</p>
        </div>
      )}

      {tieneCriticos && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 flex items-center gap-2 border-b border-border shrink-0">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">Hay necesidades críticas</p>
        </div>
      )}

      <div className="px-3 py-2 border-b border-border shrink-0 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
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

      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card z-[1]">
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {filtro === 'todas' && <th className="px-3 py-2 font-medium">Categoría</th>}
              <th className="px-3 py-2 font-medium">Producto</th>
              <th className="px-3 py-2 font-medium text-right">Necesario</th>
              <th className="px-3 py-2 font-medium text-right">Disponible</th>
              <th className="px-3 py-2 font-medium">Unidad</th>
              <th className="px-3 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {insumosFiltrados.map((insumo) => {
              const porcentaje = calcularPorcentaje(
                insumo.cantidad_disponible,
                insumo.cantidad_necesaria,
              )
              const esCritico = porcentaje < 50

              return (
                <tr
                  key={insumo.id}
                  className={`border-b border-border last:border-0 ${
                    esCritico ? 'bg-red-50/50 dark:bg-red-950/20' : ''
                  }`}
                >
                  {filtro === 'todas' && (
                    <td className="px-3 py-2.5 align-top">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${categoriaColores[insumo.categoria]}`}
                      >
                        {categoriaNombres[insumo.categoria]}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-2.5 align-top">
                    <p className="font-medium text-foreground">{insumo.nombre}</p>
                    <span
                      className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${prioridadColores[insumo.prioridad]}`}
                    >
                      {prioridadNombres[insumo.prioridad]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 align-top text-right tabular-nums">
                    {insumo.cantidad_necesaria}
                  </td>
                  <td className="px-3 py-2.5 align-top text-right tabular-nums font-medium">
                    {insumo.cantidad_disponible}
                  </td>
                  <td className="px-3 py-2.5 align-top text-muted-foreground">{insumo.unidad}</td>
                  <td className="px-3 py-2.5 align-top min-w-[5rem]">
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          porcentaje >= 75
                            ? 'bg-green-500'
                            : porcentaje >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{porcentaje}%</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
