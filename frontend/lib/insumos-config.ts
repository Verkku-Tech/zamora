import type { CategoriaInsumo, Insumo, PrioridadInsumo } from './mock-data'
import { createInsumo, deleteInsumo, updateInsumo } from './api-client'

export const CATEGORIAS_INSUMO: CategoriaInsumo[] = [
  'alimentos',
  'medicinas',
  'agua',
  'higiene',
  'ropa',
]

export const unidadesPorCategoria: Record<CategoriaInsumo, string[]> = {
  alimentos: ['kg', 'g', 'L', 'unidades', 'cajas', 'latas'],
  medicinas: ['mg', 'ml', 'g', 'unidades', 'cajas', 'frascos', 'ampollas'],
  agua: ['L', 'ml', 'galones', 'botellas', 'bidones'],
  higiene: ['unidades', 'paquetes', 'L', 'ml', 'kg'],
  ropa: ['unidades', 'pares', 'juegos', 'kg'],
}

export const unidadDefaultPorCategoria: Record<CategoriaInsumo, string> = {
  alimentos: 'kg',
  medicinas: 'unidades',
  agua: 'L',
  higiene: 'unidades',
  ropa: 'unidades',
}

export interface InsumoFormRow {
  id?: string
  tempId: string
  nombre: string
  categoria: CategoriaInsumo
  prioridad: PrioridadInsumo
  cantidad_necesaria: number
  cantidad_disponible: number
  unidad: string
}

export function createEmptyInsumoRow(categoria: CategoriaInsumo = 'alimentos'): InsumoFormRow {
  return {
    tempId: crypto.randomUUID(),
    nombre: '',
    categoria,
    prioridad: 'media',
    cantidad_necesaria: 0,
    cantidad_disponible: 0,
    unidad: unidadDefaultPorCategoria[categoria],
  }
}

export function insumoToFormRow(insumo: Insumo): InsumoFormRow {
  return {
    id: insumo.id,
    tempId: insumo.id,
    nombre: insumo.nombre,
    categoria: insumo.categoria,
    prioridad: insumo.prioridad,
    cantidad_necesaria: insumo.cantidad_necesaria,
    cantidad_disponible: insumo.cantidad_disponible,
    unidad: insumo.unidad || unidadDefaultPorCategoria[insumo.categoria],
  }
}

export function getCategoriasFromInsumos(insumos: Insumo[]): CategoriaInsumo[] {
  const set = new Set(insumos.map((i) => i.categoria))
  return CATEGORIAS_INSUMO.filter((c) => set.has(c))
}

export function getCategoriasFromRows(rows: InsumoFormRow[]): CategoriaInsumo[] {
  const set = new Set(
    rows.filter((r) => r.nombre.trim()).map((r) => r.categoria),
  )
  return CATEGORIAS_INSUMO.filter((c) => set.has(c))
}

export async function syncInsumosForCentro(
  centroId: string,
  rows: InsumoFormRow[],
  existing: Insumo[],
): Promise<void> {
  const validRows = rows.filter((r) => r.nombre.trim())
  const keptIds = new Set(validRows.filter((r) => r.id).map((r) => r.id!))

  for (const insumo of existing) {
    if (!keptIds.has(insumo.id)) {
      await deleteInsumo(insumo.id)
    }
  }

  for (const row of validRows) {
    const payload = {
      nombre: row.nombre.trim(),
      categoria: row.categoria,
      prioridad: row.prioridad,
      cantidadNecesaria: row.cantidad_necesaria,
      cantidadDisponible: row.cantidad_disponible,
      unidad: row.unidad,
    }

    if (row.id) {
      await updateInsumo(row.id, payload)
    } else {
      await createInsumo({ ...payload, puntoInteresId: centroId })
    }
  }
}
