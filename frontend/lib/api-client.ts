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
  nombre: string
  role: string
  permisos: Record<string, string[]>
  accesoGlobal: boolean
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

// ── Users ──

export interface UserApi {
  id: string
  email: string
  nombre: string
  roleId: string
  roleNombre: string | null
  activo: boolean
  puntosInteresIds: string[]
  createdAt: string
}

export interface CreateUserPayload {
  email: string
  nombre: string
  password: string
  roleId: string
  puntosInteresIds?: string[]
}

export interface UpdateUserPayload {
  nombre?: string
  password?: string
  roleId?: string
  activo?: boolean
  puntosInteresIds?: string[]
}

export function getUsers() {
  return request<UserApi[]>('/Users')
}

export function getUser(id: string) {
  return request<UserApi>(`/Users/${id}`)
}

export function createUser(data: CreateUserPayload) {
  return request<UserApi>('/Users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateUser(id: string, data: UpdateUserPayload) {
  return request<UserApi>(`/Users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteUser(id: string) {
  return request<void>(`/Users/${id}`, { method: 'DELETE' })
}

// ── Roles ──

export interface RoleApi {
  id: string
  nombre: string
  accesoGlobal: boolean
  permisos: Record<string, string[]>
}

export interface CreateRolePayload {
  nombre: string
  accesoGlobal: boolean
  permisos: Record<string, string[]>
}

export interface UpdateRolePayload {
  nombre?: string
  accesoGlobal?: boolean
  permisos?: Record<string, string[]>
}

export function getRoles() {
  return request<RoleApi[]>('/Roles')
}

export function getRole(id: string) {
  return request<RoleApi>(`/Roles/${id}`)
}

export function createRole(data: CreateRolePayload) {
  return request<RoleApi>('/Roles', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateRole(id: string, data: UpdateRolePayload) {
  return request<RoleApi>(`/Roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteRole(id: string) {
  return request<void>(`/Roles/${id}`, { method: 'DELETE' })
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
