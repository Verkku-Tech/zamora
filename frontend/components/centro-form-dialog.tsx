'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import LocationPickerMap from '@/components/map/location-picker-map'
import {
  PuntoInteres,
  Insumo,
  TIPOS_POI,
  POI_LABELS,
  ESTADOS_OPERATIVOS,
  CONFIG_APP,
} from '@/lib/mock-data'
import { createPuntoInteres, updatePuntoInteres, CreatePuntoInteresPayload } from '@/lib/api-client'
import { reverseGeocode } from '@/lib/reverse-geocode'
import {
  InsumoFormRow,
  insumoToFormRow,
  syncInsumosForCentro,
  getCategoriasFromRows,
} from '@/lib/insumos-config'
import InsumosFormEditor from '@/components/insumos-form-editor'
import { X, MapPin, Loader2 } from 'lucide-react'

interface CentroFormDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  centro?: PuntoInteres | null
  insumosIniciales?: Insumo[]
  defaultConfig?: typeof CONFIG_APP
}

const emptyForm = (cfg: typeof CONFIG_APP): CreatePuntoInteresPayload => ({
  tipo: 'centro_acopio',
  nombre: '',
  latitud: cfg.ubicacion_predeterminada.latitud,
  longitud: cfg.ubicacion_predeterminada.longitud,
  direccion: '',
  ciudad: 'Guatire',
  municipio: cfg.municipio,
  estado: cfg.estado,
  responsable: '',
  telefono: '',
  capacidad: 0,
  donacionesRecibidas: 0,
  beneficiarios: 0,
  estadoOperativo: 'activo',
  tiposDonacion: [],
})

export default function CentroFormDialog({
  open,
  onClose,
  onSaved,
  centro,
  insumosIniciales = [],
  defaultConfig = CONFIG_APP,
}: CentroFormDialogProps) {
  const [form, setForm] = useState<CreatePuntoInteresPayload>(() =>
    centro
      ? {
          tipo: centro.tipo,
          nombre: centro.nombre,
          latitud: centro.latitud,
          longitud: centro.longitud,
          direccion: centro.direccion,
          ciudad: centro.ciudad,
          municipio: centro.municipio,
          estado: centro.estado,
          responsable: centro.responsable,
          telefono: centro.telefono,
          capacidad: centro.capacidad,
          donacionesRecibidas: centro.donacionesRecibidas,
          beneficiarios: centro.beneficiarios,
          estadoOperativo: centro.estado_operativo,
          tiposDonacion: centro.tipos_donacion,
        }
      : emptyForm(defaultConfig),
  )
  const [insumoRows, setInsumoRows] = useState<InsumoFormRow[]>([])
  const [existingInsumos, setExistingInsumos] = useState<Insumo[]>([])
  const [locationSet, setLocationSet] = useState(!!centro)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    if (centro) {
      setForm({
        tipo: centro.tipo,
        nombre: centro.nombre,
        latitud: centro.latitud,
        longitud: centro.longitud,
        direccion: centro.direccion,
        ciudad: centro.ciudad,
        municipio: centro.municipio,
        estado: centro.estado,
        responsable: centro.responsable,
        telefono: centro.telefono,
        capacidad: centro.capacidad,
        donacionesRecibidas: centro.donacionesRecibidas,
        beneficiarios: centro.beneficiarios,
        estadoOperativo: centro.estado_operativo,
        tiposDonacion: centro.tipos_donacion,
      })
      setInsumoRows(insumosIniciales.map(insumoToFormRow))
      setExistingInsumos(insumosIniciales)
      setLocationSet(true)
    } else {
      setForm(emptyForm(defaultConfig))
      setInsumoRows([])
      setExistingInsumos([])
      setLocationSet(false)
    }
    setError('')
    setShowLocationPicker(false)
    setGeocoding(false)
  }, [open, centro, defaultConfig, insumosIniciales])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locationSet) {
      setError('Selecciona la ubicación en el mapa antes de guardar')
      return
    }
    setLoading(true)
    setError('')
    const categorias = getCategoriasFromRows(insumoRows)
    const payload = {
      ...form,
      tiposDonacion: categorias,
    }
    try {
      let centroId = centro?.id
      if (centro) {
        await updatePuntoInteres(centro.id, payload)
      } else {
        const created = await createPuntoInteres(payload)
        centroId = created.id
      }
      if (form.tipo === 'centro_acopio' && centroId) {
        await syncInsumosForCentro(centroId, insumoRows, existingInsumos)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationConfirm = async (lat: number, lng: number) => {
    setForm((f) => ({ ...f, latitud: lat, longitud: lng }))
    setLocationSet(true)
    setShowLocationPicker(false)
    setGeocoding(true)

    try {
      const place = await reverseGeocode(lat, lng)
      setForm((f) => ({
        ...f,
        latitud: lat,
        longitud: lng,
        direccion: place.direccion || f.direccion || '',
        ciudad: place.ciudad || f.ciudad,
        municipio: place.municipio || f.municipio,
        estado: place.estado || f.estado,
      }))
    } catch {
      /* coords ya guardadas; dirección se puede escribir manualmente */
    } finally {
      setGeocoding(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card rounded-lg border border-border shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-bold">{centro ? 'Editar Punto' : 'Nuevo Punto'}</h2>
            <button type="button" onClick={onClose} className="p-1 hover:bg-secondary rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                className="w-full mt-1 h-10 rounded-md border border-border bg-secondary px-3 text-sm"
              >
                {TIPOS_POI.map((t) => (
                  <option key={t} value={t}>{POI_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input required value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} />
            </div>

            <div>
              <label className="text-sm font-medium">Ubicación en el mapa</label>
              {locationSet ? (
                <div className="mt-1 flex items-center gap-2 p-3 bg-secondary rounded-lg border border-border">
                  <MapPin className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-sm font-mono flex-1 min-w-0 truncate">
                    {form.latitud.toFixed(5)}, {form.longitud.toFixed(5)}
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
                Marca el punto exacto del centro, igual que al reportar una zona.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Dirección</label>
              <div className="relative mt-1">
                <Input
                  value={form.direccion ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
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
            <div>
              <label className="text-sm font-medium">Ciudad</label>
              <Input
                value={form.ciudad ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
                placeholder="Guatire"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Responsable</label>
                <Input value={form.responsable ?? ''} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Teléfono</label>
                <Input value={form.telefono ?? ''} onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Capacidad</label>
                <Input type="number" value={form.capacidad} onChange={(e) => setForm((f) => ({ ...f, capacidad: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Donaciones</label>
                <Input type="number" value={form.donacionesRecibidas} onChange={(e) => setForm((f) => ({ ...f, donacionesRecibidas: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Beneficiarios</label>
                <Input type="number" value={form.beneficiarios} onChange={(e) => setForm((f) => ({ ...f, beneficiarios: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Estado operativo</label>
              <select
                value={form.estadoOperativo}
                onChange={(e) => setForm((f) => ({ ...f, estadoOperativo: e.target.value }))}
                className="w-full mt-1 h-10 rounded-md border border-border bg-secondary px-3 text-sm"
              >
                {ESTADOS_OPERATIVOS.map((e) => (
                  <option key={e} value={e}>{e.toUpperCase()}</option>
                ))}
              </select>
            </div>
            {form.tipo === 'centro_acopio' && (
              <InsumosFormEditor rows={insumoRows} onChange={setInsumoRows} />
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 bg-accent hover:bg-accent/90">
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            </div>
          </form>
        </div>
      </div>

      <LocationPickerMap
        open={showLocationPicker}
        initialLat={locationSet ? form.latitud : undefined}
        initialLng={locationSet ? form.longitud : undefined}
        config={defaultConfig}
        onConfirm={handleLocationConfirm}
        onCancel={() => setShowLocationPicker(false)}
      />
    </>
  )
}
