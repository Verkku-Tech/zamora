'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LocationPickerMap from '@/components/map/location-picker-map'
import {
  TipoSolicitud,
  tipoSolicitudLabels,
  tipoSolicitudIconos,
  InsumoBusqueda,
} from '@/lib/solicitudes-config'
import { CATEGORIAS_INSUMO, getUnidadesForCategoria, unidadDefaultPorCategoria } from '@/lib/insumos-config'
import { categoriaNombres, prioridadNombres, POI_LABELS, CONFIG_APP } from '@/lib/mock-data'
import type { CategoriaInsumo, PrioridadInsumo, TipoPuntoInteres } from '@/lib/mock-data'
import { createSolicitud, CreateSolicitudPayload } from '@/lib/api-client'
import { reverseGeocode } from '@/lib/reverse-geocode'
import { X, MapPin, Loader2 } from 'lucide-react'

interface SolicitudFormDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  tipoInicial?: TipoSolicitud
  insumoEncontrado?: InsumoBusqueda | null
  terminoBusqueda?: string
}

const selectClass =
  'h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm'

export default function SolicitudFormDialog({
  open,
  onClose,
  onSaved,
  tipoInicial = 'insumo',
  insumoEncontrado = null,
  terminoBusqueda = '',
}: SolicitudFormDialogProps) {
  const [tipo, setTipo] = useState<TipoSolicitud>(tipoInicial)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [productoNombre, setProductoNombre] = useState('')
  const [categoria, setCategoria] = useState<CategoriaInsumo>('medicinas')
  const [cantidad, setCantidad] = useState<number | ''>('')
  const [unidad, setUnidad] = useState('unidades')
  const [solicitante, setSolicitante] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [latitud, setLatitud] = useState(CONFIG_APP.ubicacion_predeterminada.latitud)
  const [longitud, setLongitud] = useState(CONFIG_APP.ubicacion_predeterminada.longitud)
  const [locationSet, setLocationSet] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [prioridad, setPrioridad] = useState<PrioridadInsumo>('alta')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setTipo(tipoInicial)
    setError('')
    setLocationSet(false)
    setShowLocationPicker(false)
    setGeocoding(false)
    setDireccion('')
    setLatitud(CONFIG_APP.ubicacion_predeterminada.latitud)
    setLongitud(CONFIG_APP.ubicacion_predeterminada.longitud)

    if (insumoEncontrado) {
      setTipo('insumo')
      setTitulo(`Solicitud: ${insumoEncontrado.producto_nombre}`)
      setProductoNombre(insumoEncontrado.producto_nombre)
      setCategoria(insumoEncontrado.categoria as CategoriaInsumo)
      setUnidad(insumoEncontrado.unidad || unidadDefaultPorCategoria.medicinas)
    } else {
      setTitulo(
        tipoInicial === 'inspeccion'
          ? 'Inspección de habitabilidad'
          : terminoBusqueda
            ? `Solicitud: ${terminoBusqueda}`
            : '',
      )
      setProductoNombre(terminoBusqueda)
      setDescripcion('')
      setCantidad('')
      setSolicitante('')
      setTelefono('')
      setNotas('')
      if (tipoInicial === 'insumo') {
        setCategoria('medicinas')
        setUnidad('unidades')
        setPrioridad('alta')
      }
    }
  }, [open, tipoInicial, insumoEncontrado, terminoBusqueda])

  if (!open) return null

  const ubicacionLabel =
    tipo === 'inspeccion'
      ? 'Ubicación del lugar a inspeccionar'
      : insumoEncontrado
        ? 'Dónde se necesita el insumo'
        : 'Ubicación donde se necesita el insumo'

  const handleLocationConfirm = async (lat: number, lng: number) => {
    setLatitud(lat)
    setLongitud(lng)
    setLocationSet(true)
    setShowLocationPicker(false)
    setGeocoding(true)

    try {
      const place = await reverseGeocode(lat, lng)
      setDireccion(place.direccion || '')
    } catch {
      /* coords guardadas; dirección editable manualmente */
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) {
      setError('El título es obligatorio')
      return
    }
    if (!locationSet) {
      setError('Selecciona la ubicación en el mapa antes de enviar')
      return
    }
    setLoading(true)
    setError('')

    const payload: CreateSolicitudPayload = {
      tipo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      solicitante: solicitante.trim() || undefined,
      telefonoSolicitante: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
      latitud,
      longitud,
      prioridad,
      notasInternas: notas.trim() || undefined,
      ...(tipo === 'insumo'
        ? {
            productoNombre: productoNombre.trim() || undefined,
            categoria,
            cantidadSolicitada: cantidad === '' ? undefined : Number(cantidad),
            unidad,
            ...(insumoEncontrado ? { insumoId: insumoEncontrado.insumo_id } : {}),
          }
        : {}),
    }

    try {
      await createSolicitud(payload)
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card rounded-lg border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold">Nueva solicitud</h2>
            <button type="button" onClick={onClose} className="p-1 hover:bg-secondary rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {!insumoEncontrado && (
              <div className="flex gap-2">
                {(['insumo', 'inspeccion'] as TipoSolicitud[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      tipo === t
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {tipoSolicitudIconos[t]} {tipoSolicitudLabels[t]}
                  </button>
                ))}
              </div>
            )}

            {insumoEncontrado && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-xs">
                <p className="font-medium text-green-600 dark:text-green-400">Insumo disponible en centro</p>
                <p className="text-muted-foreground mt-1">
                  {insumoEncontrado.producto_nombre} en{' '}
                  {POI_LABELS[insumoEncontrado.punto_tipo as TipoPuntoInteres] ?? insumoEncontrado.punto_tipo}
                  : {insumoEncontrado.punto_nombre}
                </p>
                <p className="text-muted-foreground mt-1">
                  Indica abajo dónde se necesita entregar o recoger el insumo.
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Título</label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required className="mt-1" />
            </div>

            {tipo === 'insumo' && !insumoEncontrado && (
              <>
                <div>
                  <label className="text-sm font-medium">Producto buscado</label>
                  <Input
                    value={productoNombre}
                    onChange={(e) => setProductoNombre(e.target.value)}
                    placeholder="Ej. Paracetamol, Agua..."
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={categoria}
                      onChange={(e) => {
                        const cat = e.target.value as CategoriaInsumo
                        setCategoria(cat)
                        setUnidad(unidadDefaultPorCategoria[cat])
                      }}
                      className={`${selectClass} mt-1`}
                    >
                      {CATEGORIAS_INSUMO.map((c) => (
                        <option key={c} value={c}>{categoriaNombres[c]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Cantidad</label>
                    <Input
                      type="number"
                      min={1}
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value ? parseInt(e.target.value, 10) : '')}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Unidad</label>
                  <select value={unidad} onChange={(e) => setUnidad(e.target.value)} className={`${selectClass} mt-1`}>
                    {getUnidadesForCategoria(categoria).map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium">
                {tipo === 'inspeccion' ? 'Detalle del lugar a inspeccionar' : 'Descripción'}
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder={
                  tipo === 'inspeccion'
                    ? 'Describe el inmueble, daños, acceso, urgencia...'
                    : 'Detalles adicionales de la solicitud...'
                }
                className="mt-1 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{ubicacionLabel}</label>
              {locationSet ? (
                <div className="mt-1 flex items-center gap-2 p-3 bg-secondary rounded-lg border border-border">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-sm font-mono flex-1 min-w-0 truncate">
                    {latitud.toFixed(5)}, {longitud.toFixed(5)}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLocationPicker(true)}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full mt-1 h-10 gap-2 border-dashed"
                >
                  <MapPin className="w-4 h-4 text-accent" />
                  Seleccionar en el mapa
                </Button>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Marca el punto exacto en el mapa, igual que al registrar un centro.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Dirección</label>
              <div className="relative mt-1">
                <Input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder={geocoding ? 'Obteniendo dirección del mapa...' : 'Se completa al seleccionar en el mapa'}
                  disabled={geocoding}
                />
                {geocoding && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Se obtiene automáticamente del punto en el mapa. Puedes editarla si hace falta.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Solicitante</label>
                <Input value={solicitante} onChange={(e) => setSolicitante(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Prioridad</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as PrioridadInsumo)}
                className={`${selectClass} mt-1`}
              >
                {(Object.keys(prioridadNombres) as PrioridadInsumo[]).map((p) => (
                  <option key={p} value={p}>{prioridadNombres[p]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Notas internas</label>
              <Input value={notas} onChange={(e) => setNotas(e.target.value)} className="mt-1" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 bg-accent hover:bg-accent/90">
                {loading ? 'Guardando...' : 'Crear solicitud'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            </div>
          </form>
        </div>
      </div>

      <LocationPickerMap
        open={showLocationPicker}
        initialLat={locationSet ? latitud : undefined}
        initialLng={locationSet ? longitud : undefined}
        onConfirm={handleLocationConfirm}
        onCancel={() => setShowLocationPicker(false)}
      />
    </>
  )
}
