import type { CategoriaInsumo, Insumo, PrioridadInsumo } from './mock-data'
import { createInsumo, deleteInsumo, updateInsumo } from './api-client'

export interface UnidadMedida {
  value: string
  label: string
}

/** Catálogo de unidades con etiquetas legibles */
export const UNIDADES_MEDIDA: UnidadMedida[] = [
  { value: 'Ltrs', label: 'Litros (Ltrs)' },
  { value: 'mL', label: 'Mililitros (mL)' },
  { value: 'mg', label: 'Miligramos (mg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'Kg', label: 'Kilogramos (Kg)' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'cajas', label: 'Cajas' },
  { value: 'paquetes', label: 'Paquetes' },
  { value: 'frascos', label: 'Frascos' },
  { value: 'ampollas', label: 'Ampollas' },
  { value: 'botellas', label: 'Botellas' },
  { value: 'bidones', label: 'Bidones' },
  { value: 'galones', label: 'Galones' },
  { value: 'latas', label: 'Latas' },
  { value: 'pares', label: 'Pares' },
  { value: 'juegos', label: 'Juegos' },
]

/** Normaliza valores antiguos guardados en BD (ej. "L" → "Ltrs") */
const UNIDAD_ALIASES: Record<string, string> = {
  L: 'Ltrs',
  l: 'Ltrs',
  ltr: 'Ltrs',
  ltrs: 'Ltrs',
  litros: 'Ltrs',
  ml: 'mL',
  ML: 'mL',
  kg: 'Kg',
  KG: 'Kg',
}

export function normalizeUnidad(unidad: string | null | undefined): string {
  if (!unidad) return 'unidades'
  const trimmed = unidad.trim()
  return UNIDAD_ALIASES[trimmed] ?? trimmed
}

export function formatUnidad(unidad: string | null | undefined): string {
  const normalized = normalizeUnidad(unidad)
  const found = UNIDADES_MEDIDA.find((u) => u.value === normalized)
  return found?.value ?? normalized
}

export function unidadLabel(unidad: string | null | undefined): string {
  const normalized = normalizeUnidad(unidad)
  const found = UNIDADES_MEDIDA.find((u) => u.value === normalized)
  return found?.label ?? normalized
}

export const CATEGORIAS_INSUMO: CategoriaInsumo[] = [
  'alimentos',
  'medicinas',
  'agua',
  'higiene',
  'ropa',
]

export const unidadesPorCategoria: Record<CategoriaInsumo, string[]> = {
  alimentos: ['Kg', 'g', 'Ltrs', 'mL', 'unidades', 'cajas', 'latas'],
  medicinas: ['mg', 'g', 'mL', 'Ltrs', 'unidades', 'cajas', 'frascos', 'ampollas'],
  agua: ['Ltrs', 'mL', 'galones', 'botellas', 'bidones'],
  higiene: ['unidades', 'paquetes', 'Ltrs', 'mL', 'Kg', 'g'],
  ropa: ['unidades', 'pares', 'juegos', 'Kg'],
}

export const unidadDefaultPorCategoria: Record<CategoriaInsumo, string> = {
  alimentos: 'Kg',
  medicinas: 'unidades',
  agua: 'Ltrs',
  higiene: 'unidades',
  ropa: 'unidades',
}

export function getUnidadesForCategoria(categoria: CategoriaInsumo): UnidadMedida[] {
  return unidadesPorCategoria[categoria]
    .map((value) => UNIDADES_MEDIDA.find((u) => u.value === value))
    .filter((u): u is UnidadMedida => !!u)
}

export interface ProgresoInsumo {
  porcentaje: number
  faltante: number
  excedente: number
  metaCubierta: boolean
}

/** meta = lo que necesitamos | actual = lo que tenemos ahora */
export function calcularProgresoInsumo(actual: number, meta: number): ProgresoInsumo {
  if (meta <= 0) {
    return {
      porcentaje: actual > 0 ? 100 : 0,
      faltante: 0,
      excedente: actual,
      metaCubierta: actual > 0,
    }
  }
  const porcentaje = Math.round((actual / meta) * 100)
  return {
    porcentaje,
    faltante: Math.max(0, meta - actual),
    excedente: Math.max(0, actual - meta),
    metaCubierta: actual >= meta,
  }
}

export function formatCantidad(n: number): string {
  return n.toLocaleString('es-VE')
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
    unidad: normalizeUnidad(insumo.unidad) || unidadDefaultPorCategoria[insumo.categoria],
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
      unidad: normalizeUnidad(row.unidad),
    }

    if (row.id) {
      await updateInsumo(row.id, payload)
    } else {
      await createInsumo({ ...payload, puntoInteresId: centroId })
    }
  }
}
