import type { PrioridadInsumo } from './mock-data'

export type TipoSolicitud = 'insumo' | 'inspeccion'

export type EstadoSolicitud =
  | 'pendiente'
  | 'en_busqueda'
  | 'ubicado'
  | 'en_proceso'
  | 'resuelta'
  | 'cancelada'

export interface Solicitud {
  id: string
  tipo: TipoSolicitud
  titulo: string
  descripcion: string
  producto_nombre: string
  categoria: string
  cantidad_solicitada: number | null
  unidad: string
  solicitante: string
  telefono_solicitante: string
  direccion: string
  prioridad: PrioridadInsumo
  estado: EstadoSolicitud
  punto_interes_id: string | null
  punto_nombre: string | null
  punto_tipo: string | null
  insumo_id: string | null
  notas_internas: string
  created_at: string
  updated_at: string
}

export interface InsumoBusqueda {
  insumo_id: string
  producto_nombre: string
  categoria: string
  cantidad_disponible: number
  cantidad_necesaria: number
  unidad: string
  punto_interes_id: string
  punto_nombre: string
  punto_tipo: string
  punto_direccion: string
  punto_ciudad: string
}

export const TIPOS_SOLICITUD: TipoSolicitud[] = ['insumo', 'inspeccion']

export const tipoSolicitudLabels: Record<TipoSolicitud, string> = {
  insumo: 'Insumo',
  inspeccion: 'Inspección',
}

export const tipoSolicitudIconos: Record<TipoSolicitud, string> = {
  insumo: '📦',
  inspeccion: '🏗️',
}

export const ESTADOS_SOLICITUD: EstadoSolicitud[] = [
  'pendiente',
  'en_busqueda',
  'ubicado',
  'en_proceso',
  'resuelta',
  'cancelada',
]

export const estadoSolicitudLabels: Record<EstadoSolicitud, string> = {
  pendiente: 'Pendiente',
  en_busqueda: 'En búsqueda',
  ubicado: 'Ubicado',
  en_proceso: 'En proceso',
  resuelta: 'Resuelta',
  cancelada: 'Cancelada',
}

export const estadoSolicitudColores: Record<EstadoSolicitud, string> = {
  pendiente: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
  en_busqueda: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  ubicado: 'bg-green-500/20 text-green-600 dark:text-green-400',
  en_proceso: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
  resuelta: 'bg-green-600/20 text-green-700 dark:text-green-300',
  cancelada: 'bg-muted text-muted-foreground',
}
