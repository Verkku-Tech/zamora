'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  PuntoInteres,
  Insumo,
  TIPOS_POI,
  POI_LABELS,
  POI_ICONS,
  categoriaNombres,
} from '@/lib/mock-data'
import { registrarDonacion, CreateDonacionPayload } from '@/lib/api-client'
import {
  CATEGORIAS_INSUMO,
  formatCantidad,
  formatUnidad,
  getUnidadesForCategoria,
  unidadDefaultPorCategoria,
  unidadesPorCategoria,
} from '@/lib/insumos-config'
import type { CategoriaInsumo } from '@/lib/mock-data'
import { X, Plus, Package } from 'lucide-react'

interface DonacionFormDialogProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
  puntos: PuntoInteres[]
  insumosByCentro: Record<string, Insumo[]>
}

type ModoProducto = 'existente' | 'nuevo'

const selectClass =
  'h-10 w-full rounded-md border border-border bg-secondary px-3 text-sm'

export default function DonacionFormDialog({
  open,
  onClose,
  onSaved,
  puntos,
  insumosByCentro,
}: DonacionFormDialogProps) {
  const [puntoId, setPuntoId] = useState('')
  const [modo, setModo] = useState<ModoProducto>('existente')
  const [insumoId, setInsumoId] = useState('')
  const [categoria, setCategoria] = useState<CategoriaInsumo>('agua')
  const [nombre, setNombre] = useState('')
  const [unidad, setUnidad] = useState('Ltrs')
  const [cantidad, setCantidad] = useState(0)
  const [donante, setDonante] = useState('')
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const puntosOrdenados = useMemo(
    () => [...puntos].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [puntos],
  )

  const insumosPunto = puntoId ? insumosByCentro[puntoId] ?? [] : []
  const insumoSeleccionado = insumosPunto.find((i) => i.id === insumoId) ?? null
  const puntoSeleccionado = puntos.find((p) => p.id === puntoId) ?? null

  useEffect(() => {
    if (!open) return
    setPuntoId('')
    setModo('existente')
    setInsumoId('')
    setCategoria('agua')
    setNombre('')
    setUnidad('Ltrs')
    setCantidad(0)
    setDonante('')
    setNotas('')
    setError('')
    setSuccessMsg('')
  }, [open])

  useEffect(() => {
    if (!puntoId) return
    const insumos = insumosByCentro[puntoId] ?? []
    if (insumos.length > 0) {
      setModo('existente')
      setInsumoId(insumos[0].id)
    } else {
      setModo('nuevo')
      setInsumoId('')
    }
  }, [puntoId, insumosByCentro])

  useEffect(() => {
    if (modo === 'existente' && insumoSeleccionado) {
      setNombre(insumoSeleccionado.nombre)
      setCategoria(insumoSeleccionado.categoria)
      setUnidad(formatUnidad(insumoSeleccionado.unidad))
    }
  }, [modo, insumoSeleccionado])

  useEffect(() => {
    if (modo === 'nuevo') {
      const units = unidadesPorCategoria[categoria]
      if (!units.includes(unidad)) {
        setUnidad(unidadDefaultPorCategoria[categoria])
      }
    }
  }, [modo, categoria, unidad])

  if (!open) return null

  const totalProyectado =
    modo === 'existente' && insumoSeleccionado
      ? insumoSeleccionado.cantidad_disponible + cantidad
      : cantidad

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!puntoId) {
      setError('Selecciona un punto de destino')
      return
    }
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a cero')
      return
    }
    if (modo === 'existente' && !insumoId) {
      setError('Selecciona un producto existente')
      return
    }
    if (modo === 'nuevo' && !nombre.trim()) {
      setError('Indica el nombre del producto')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMsg('')

    const payload: CreateDonacionPayload = {
      puntoInteresId: puntoId,
      cantidad,
      categoria,
      unidad,
      donante: donante.trim() || undefined,
      notas: notas.trim() || undefined,
      ...(modo === 'existente'
        ? { insumoId, nombre: insumoSeleccionado!.nombre }
        : { nombre: nombre.trim() }),
    }

    try {
      const result = await registrarDonacion(payload)
      const u = formatUnidad(result.donacion.unidad)
      setSuccessMsg(
        result.insumoNuevo
          ? `Nuevo producto registrado. Inventario actual: ${formatCantidad(result.totalActual)} ${u}`
          : `Sumado al inventario. ${formatCantidad(result.donacion.cantidadAnterior)} → ${formatCantidad(result.totalActual)} ${u}`,
      )
      onSaved()
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar donación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Registrar donación</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Se suma al inventario actual del punto seleccionado
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Destino</label>
            <select
              required
              value={puntoId}
              onChange={(e) => setPuntoId(e.target.value)}
              className={`${selectClass} mt-1`}
            >
              <option value="">Selecciona un punto...</option>
              {TIPOS_POI.map((tipo) => {
                const delTipo = puntosOrdenados.filter((p) => p.tipo === tipo)
                if (delTipo.length === 0) return null
                return (
                  <optgroup key={tipo} label={`${POI_ICONS[tipo]} ${POI_LABELS[tipo]}`}>
                    {delTipo.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} — {p.ciudad}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>

          {puntoId && (
            <>
              {insumosPunto.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModo('existente')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      modo === 'existente'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Producto existente
                  </button>
                  <button
                    type="button"
                    onClick={() => { setModo('nuevo'); setInsumoId('') }}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                      modo === 'nuevo'
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Producto nuevo
                  </button>
                </div>
              )}

              {modo === 'existente' && insumosPunto.length > 0 ? (
                <div>
                  <label className="text-sm font-medium">Producto</label>
                  <select
                    value={insumoId}
                    onChange={(e) => setInsumoId(e.target.value)}
                    className={`${selectClass} mt-1`}
                  >
                    {insumosPunto.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} — Actual: {formatCantidad(i.cantidad_disponible)}{' '}
                        {formatUnidad(i.unidad)} ({categoriaNombres[i.categoria]})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value as CategoriaInsumo)}
                      className={`${selectClass} mt-1`}
                    >
                      {CATEGORIAS_INSUMO.map((cat) => (
                        <option key={cat} value={cat}>
                          {categoriaNombres[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Producto</label>
                    <Input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Agua embotellada, Arroz..."
                      className="mt-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Si ya existe con el mismo nombre y unidad, se sumará automáticamente.
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Unidad</label>
                    <select
                      value={unidad}
                      onChange={(e) => setUnidad(e.target.value)}
                      className={`${selectClass} mt-1`}
                    >
                      {getUnidadesForCategoria(categoria).map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium">Cantidad donada</label>
                <Input
                  type="number"
                  min={1}
                  required
                  value={cantidad || ''}
                  onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 0)}
                  className="mt-1"
                  placeholder="Ej. 500"
                />
              </div>

              {cantidad > 0 && (
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 flex gap-2">
                  <Package className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-foreground">Vista previa del inventario</p>
                    {modo === 'existente' && insumoSeleccionado ? (
                      <p className="text-muted-foreground mt-1">
                        Actual:{' '}
                        <strong>{formatCantidad(insumoSeleccionado.cantidad_disponible)}</strong>{' '}
                        {formatUnidad(insumoSeleccionado.unidad)} → Quedará:{' '}
                        <strong className="text-accent">{formatCantidad(totalProyectado)}</strong>{' '}
                        {formatUnidad(insumoSeleccionado.unidad)}
                      </p>
                    ) : (
                      <p className="text-muted-foreground mt-1">
                        Se registrará con{' '}
                        <strong className="text-accent">{formatCantidad(cantidad)}</strong>{' '}
                        {formatUnidad(unidad)} en{' '}
                        <strong>{puntoSeleccionado?.nombre}</strong>
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Donante (opcional)</label>
                  <Input
                    value={donante}
                    onChange={(e) => setDonante(e.target.value)}
                    placeholder="Persona u organización"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notas (opcional)</label>
                  <Input
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Observaciones"
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {successMsg && <p className="text-sm text-green-500">{successMsg}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading || !puntoId}
              className="flex-1 bg-accent hover:bg-accent/90 gap-2"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Registrando...' : 'Registrar donación'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
