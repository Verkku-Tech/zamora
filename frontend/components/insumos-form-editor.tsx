'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CategoriaInsumo,
  PrioridadInsumo,
  categoriaNombres,
  prioridadNombres,
} from '@/lib/mock-data'
import {
  CATEGORIAS_INSUMO,
  InsumoFormRow,
  createEmptyInsumoRow,
  unidadDefaultPorCategoria,
  unidadesPorCategoria,
} from '@/lib/insumos-config'
import { Plus, Trash2 } from 'lucide-react'

interface InsumosFormEditorProps {
  rows: InsumoFormRow[]
  onChange: (rows: InsumoFormRow[]) => void
}

const selectClass =
  'h-9 w-full rounded-md border border-border bg-secondary px-2 text-sm'

export default function InsumosFormEditor({ rows, onChange }: InsumosFormEditorProps) {
  const updateRow = (tempId: string, patch: Partial<InsumoFormRow>) => {
    onChange(
      rows.map((row) => {
        if (row.tempId !== tempId) return row
        const next = { ...row, ...patch }
        if (patch.categoria && patch.categoria !== row.categoria) {
          const units = unidadesPorCategoria[patch.categoria]
          if (!units.includes(next.unidad)) {
            next.unidad = unidadDefaultPorCategoria[patch.categoria]
          }
        }
        return next
      }),
    )
  }

  const removeRow = (tempId: string) => {
    onChange(rows.filter((r) => r.tempId !== tempId))
  }

  const addRow = () => {
    onChange([...rows, createEmptyInsumoRow()])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <label className="text-sm font-medium">Inventario de insumos</label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Agrega productos por categoría con cantidad y unidad de medida.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="shrink-0 gap-1">
          <Plus className="w-4 h-4" />
          Agregar
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Sin insumos. Pulsa &quot;Agregar&quot; para registrar productos.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-2 py-2 font-medium">Categoría</th>
                <th className="px-2 py-2 font-medium">Producto</th>
                <th className="px-2 py-2 font-medium w-20">Necesario</th>
                <th className="px-2 py-2 font-medium w-20">Disponible</th>
                <th className="px-2 py-2 font-medium w-24">Unidad</th>
                <th className="px-2 py-2 font-medium w-24">Prioridad</th>
                <th className="px-2 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.tempId} className="border-b border-border last:border-0">
                  <td className="px-2 py-2 align-top">
                    <select
                      value={row.categoria}
                      onChange={(e) =>
                        updateRow(row.tempId, { categoria: e.target.value as CategoriaInsumo })
                      }
                      className={selectClass}
                    >
                      {CATEGORIAS_INSUMO.map((cat) => (
                        <option key={cat} value={cat}>
                          {categoriaNombres[cat]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <Input
                      value={row.nombre}
                      onChange={(e) => updateRow(row.tempId, { nombre: e.target.value })}
                      placeholder="Ej. Arroz, Paracetamol..."
                      className="h-9"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <Input
                      type="number"
                      min={0}
                      value={row.cantidad_necesaria}
                      onChange={(e) =>
                        updateRow(row.tempId, {
                          cantidad_necesaria: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="h-9"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <Input
                      type="number"
                      min={0}
                      value={row.cantidad_disponible}
                      onChange={(e) =>
                        updateRow(row.tempId, {
                          cantidad_disponible: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="h-9"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <select
                      value={row.unidad}
                      onChange={(e) => updateRow(row.tempId, { unidad: e.target.value })}
                      className={selectClass}
                    >
                      {unidadesPorCategoria[row.categoria].map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <select
                      value={row.prioridad}
                      onChange={(e) =>
                        updateRow(row.tempId, { prioridad: e.target.value as PrioridadInsumo })
                      }
                      className={selectClass}
                    >
                      {(Object.keys(prioridadNombres) as PrioridadInsumo[]).map((p) => (
                        <option key={p} value={p}>
                          {prioridadNombres[p]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <button
                      type="button"
                      onClick={() => removeRow(row.tempId)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                      title="Eliminar fila"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
