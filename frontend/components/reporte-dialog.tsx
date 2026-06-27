'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { reportarZona } from '@/lib/api-client'
import { AlertTriangle, X, MapPin } from 'lucide-react'

interface ReporteDialogProps {
  open: boolean
  onClose: () => void
  onReported: () => void
  latitud: number
  longitud: number
}

export default function ReporteDialog({
  open,
  onClose,
  onReported,
  latitud,
  longitud,
}: ReporteDialogProps) {
  const [intensidad, setIntensidad] = useState('0.7')
  const [radioKm, setRadioKm] = useState('0.5')
  const [descripcion, setDescripcion] = useState('')
  const [reportadoPor, setReportadoPor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      setIntensidad('0.7')
      setRadioKm('0.5')
      setDescripcion('')
      setReportadoPor('')
      setError('')
      setSuccess(false)
    }
  }, [open, latitud, longitud])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await reportarZona({
        latitud,
        longitud,
        intensidad: parseFloat(intensidad),
        radioKm: parseFloat(radioKm),
        descripcion,
        reportadoPor,
      })
      setSuccess(true)
      setTimeout(() => {
        onReported()
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4">
      <div className="bg-card rounded-t-2xl md:rounded-lg border border-border shadow-xl w-full max-w-md max-h-[85dvh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
            <h2 className="text-base md:text-lg font-bold">Reportar zona afectada</h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 hover:bg-secondary rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <MapPin className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div className="text-xs md:text-sm">
              <p className="font-medium text-foreground">Ubicación seleccionada</p>
              <p className="text-muted-foreground mt-0.5">
                {latitud.toFixed(5)}, {longitud.toFixed(5)}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Intensidad de afectación</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={intensidad}
              onChange={(e) => setIntensidad(e.target.value)}
              className="w-full mt-1 accent-orange-500"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(intensidad) >= 0.8 ? 'Crítica' : parseFloat(intensidad) >= 0.5 ? 'Moderada' : 'Leve'} ({intensidad})
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Radio aproximado (km)</label>
            <Input
              required
              type="number"
              step="0.1"
              min="0.1"
              max="5"
              value={radioKm}
              onChange={(e) => setRadioKm(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">¿Qué está pasando?</label>
            <Input
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Falta agua, alimentos, heridos..."
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tu nombre o comunidad</label>
            <Input
              required
              value={reportadoPor}
              onChange={(e) => setReportadoPor(e.target.value)}
              placeholder="Nombre o sector"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">¡Reporte enviado! Gracias por ayudar.</p>}

          <div className="flex gap-2 pt-2 pb-safe">
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? 'Enviando...' : 'Enviar reporte'}
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
