import type { PuntoInteres, Insumo, ZonaAfectada, ConfigApp } from './mock-data'

const API_BASE = '/api'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }
  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const body = await res.json()
      message = body.message ?? body.title ?? message
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Auth ──

export interface LoginResponse {
  token: string
  email: string
  expiresAt: string
}

export function login(email: string, password: string) {
  return request<LoginResponse>('/Auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// ── Puntos de interés ──

export interface PuntoInteresApi {
  id: string
  tipo: string
  nombre: string
  latitud: number
  longitud: number
  direccion: string | null
  ciudad: string | null
  municipio: string | null
  estado: string | null
  responsable: string | null
  telefono: string | null
  capacidad: number
  donacionesRecibidas: number
  beneficiarios: number
  estadoOperativo: string
  tiposDonacion: string[]
  ultimaActualizacion: string
}

export interface CreatePuntoInteresPayload {
  tipo: string
  nombre: string
  latitud: number
  longitud: number
  direccion?: string
  ciudad?: string
  municipio?: string
  estado?: string
  responsable?: string
  telefono?: string
  capacidad: number
  donacionesRecibidas: number
  beneficiarios: number
  estadoOperativo?: string
  tiposDonacion?: string[]
}

export type UpdatePuntoInteresPayload = Partial<CreatePuntoInteresPayload>

export function getPuntosInteres(params?: { tipo?: string; search?: string }) {
  const qs = new URLSearchParams()
  if (params?.tipo) qs.set('tipo', params.tipo)
  if (params?.search) qs.set('search', params.search)
  const query = qs.toString()
  return request<PuntoInteresApi[]>(`/PuntosInteres${query ? `?${query}` : ''}`)
}

export function createPuntoInteres(data: CreatePuntoInteresPayload) {
  return request<PuntoInteresApi>('/PuntosInteres', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updatePuntoInteres(id: string, data: UpdatePuntoInteresPayload) {
  return request<PuntoInteresApi>(`/PuntosInteres/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deletePuntoInteres(id: string) {
  return request<void>(`/PuntosInteres/${id}`, { method: 'DELETE' })
}

// ── Insumos ──

export interface InsumoApi {
  id: string
  puntoInteresId: string
  nombre: string
  categoria: string
  prioridad: string
  cantidadNecesaria: number
  cantidadDisponible: number
  unidad: string | null
}

export interface CreateInsumoPayload {
  puntoInteresId: string
  nombre: string
  categoria: string
  prioridad: string
  cantidadNecesaria: number
  cantidadDisponible: number
  unidad?: string
}

export type UpdateInsumoPayload = Partial<Omit<CreateInsumoPayload, 'puntoInteresId'>>

export function getInsumos(puntoInteresId?: string) {
  const qs = puntoInteresId ? `?puntoInteresId=${puntoInteresId}` : ''
  return request<InsumoApi[]>(`/Insumos${qs}`)
}

export function createInsumo(data: CreateInsumoPayload) {
  return request<InsumoApi>('/Insumos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateInsumo(id: string, data: UpdateInsumoPayload) {
  return request<InsumoApi>(`/Insumos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteInsumo(id: string) {
  return request<void>(`/Insumos/${id}`, { method: 'DELETE' })
}

// ── Donaciones ──

export interface DonacionApi {
  id: string
  puntoInteresId: string
  puntoNombre: string
  puntoTipo: string
  insumoId: string
  nombreProducto: string
  categoria: string
  cantidad: number
  unidad: string | null
  donante: string | null
  notas: string | null
  cantidadAnterior: number
  cantidadNueva: number
  createdAt: string
}

export interface CreateDonacionPayload {
  puntoInteresId: string
  insumoId?: string
  nombre: string
  categoria: string
  cantidad: number
  unidad: string
  donante?: string
  notas?: string
}

export interface DonacionResultApi {
  donacion: DonacionApi
  insumoNuevo: boolean
  totalActual: number
}

export function getDonaciones(puntoInteresId?: string, limit = 100) {
  const params = new URLSearchParams()
  if (puntoInteresId) params.set('puntoInteresId', puntoInteresId)
  params.set('limit', String(limit))
  const qs = params.toString()
  return request<DonacionApi[]>(`/Donaciones${qs ? `?${qs}` : ''}`)
}

export function registrarDonacion(data: CreateDonacionPayload) {
  return request<DonacionResultApi>('/Donaciones', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Zonas afectadas ──

export interface ZonaAfectadaApi {
  id: string
  latitud: number
  longitud: number
  intensidad: number
  radioKm: number
  descripcion: string | null
  reportadoPor: string | null
  fechaReporte: string
}

export function getZonasAfectadas() {
  return request<ZonaAfectadaApi[]>('/ZonasAfectadas')
}

export interface ReporteCiudadanoPayload {
  latitud: number
  longitud: number
  intensidad: number
  radioKm: number
  descripcion: string
  reportadoPor: string
}

export function reportarZona(data: ReporteCiudadanoPayload) {
  return request<ZonaAfectadaApi>('/Reportes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Config ──

export interface ConfigApi {
  id: number
  latitudDefault: number
  longitudDefault: number
  zoomDefault: number
  municipio: string
  estado: string
  pais: string
}

export function getConfig() {
  return request<ConfigApi>('/Config')
}

export function updateConfig(data: Partial<Omit<ConfigApi, 'id'>>) {
  return request<ConfigApi>('/Config', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

// ── Estadísticas ──

export interface EstadisticasApi {
  totalPuntos: number
  activos: number
  parciales: number
  inactivos: number
  totalDonaciones: number
  totalBeneficiarios: number
  totalCapacidad: number
  tasaUtilizacion: number
  totalZonasAfectadas: number
  intensidadPromedio: number
}

export function getEstadisticas() {
  return request<EstadisticasApi>('/Estadisticas')
}

// ── Mappers ──

export function mapPunto(p: PuntoInteresApi): PuntoInteres {
  return {
    id: p.id,
    tipo: p.tipo as PuntoInteres['tipo'],
    nombre: p.nombre,
    latitud: p.latitud,
    longitud: p.longitud,
    direccion: p.direccion ?? '',
    ciudad: p.ciudad ?? '',
    municipio: p.municipio ?? '',
    estado: p.estado ?? '',
    responsable: p.responsable ?? '',
    telefono: p.telefono ?? '',
    capacidad: p.capacidad,
    donacionesRecibidas: p.donacionesRecibidas,
    beneficiarios: p.beneficiarios,
    estado_operativo: p.estadoOperativo as PuntoInteres['estado_operativo'],
    ultima_actualizacion: p.ultimaActualizacion,
    tipos_donacion: p.tiposDonacion ?? [],
  }
}

export function mapInsumo(i: InsumoApi): Insumo {
  return {
    id: i.id,
    nombre: i.nombre,
    categoria: i.categoria as Insumo['categoria'],
    prioridad: i.prioridad as Insumo['prioridad'],
    cantidad_necesaria: i.cantidadNecesaria,
    cantidad_disponible: i.cantidadDisponible,
    unidad: i.unidad ?? '',
  }
}

export function mapZona(z: ZonaAfectadaApi): ZonaAfectada {
  return {
    latitud: z.latitud,
    longitud: z.longitud,
    intensidad: z.intensidad,
    radio_km: z.radioKm,
    descripcion: z.descripcion ?? '',
    reportado_por: z.reportadoPor ?? undefined,
    fecha_reporte: z.fechaReporte,
  }
}

export function mapConfig(c: ConfigApi): ConfigApp {
  return {
    ubicacion_predeterminada: {
      latitud: c.latitudDefault,
      longitud: c.longitudDefault,
      zoom: c.zoomDefault,
    },
    municipio: c.municipio,
    estado: c.estado,
    pais: c.pais,
  }
}

export function buildInsumosMap(insumos: InsumoApi[]): Record<string, Insumo[]> {
  return insumos.reduce<Record<string, Insumo[]>>((acc, i) => {
    const key = i.puntoInteresId
    if (!acc[key]) acc[key] = []
    acc[key].push(mapInsumo(i))
    return acc
  }, {})
}
