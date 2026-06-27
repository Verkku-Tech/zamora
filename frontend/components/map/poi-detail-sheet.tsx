'use client'

import { PuntoInteres, Insumo, POI_LABELS, categoriaColores, categoriaNombres } from '@/lib/mock-data'
import { getCategoriasFromInsumos } from '@/lib/insumos-config'
import SuppliesPanel from '@/components/supplies-panel'
import { X, Phone, MapPin } from 'lucide-react'

interface PoiDetailSheetProps {
  poi: PuntoInteres
  insumos: Insumo[]
  showSupplies: boolean
  onShowSupplies: (show: boolean) => void
  onClose: () => void
  compact?: boolean
}

function PoiInfoContent({
  poi,
  insumos,
  dense = false,
}: {
  poi: PuntoInteres
  insumos: Insumo[]
  dense?: boolean
}) {
  const categorias = getCategoriasFromInsumos(insumos)
  const categoriasLegacy = poi.tipos_donacion.filter(
    (t) => !categorias.some((c) => categoriaNombres[c].toLowerCase() === t.toLowerCase() || c === t),
  )
  return (
    <div className={`space-y-3 ${dense ? 'text-xs' : 'text-sm'}`}>
      <div>
        <h2 className={`font-bold text-foreground leading-snug ${dense ? 'text-base' : 'text-lg'}`}>
          {poi.nombre}
        </h2>
        <p className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded inline-block mt-1.5">
          {POI_LABELS[poi.tipo]}
        </p>
      </div>

      <div className="space-y-2.5">
        <p className="flex items-start gap-2 text-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
          <span>{poi.direccion}</span>
        </p>
        <p className="font-semibold">{poi.responsable}</p>
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-accent shrink-0" />
          <a href={`tel:${poi.telefono}`} className="text-accent underline-offset-2 hover:underline">
            {poi.telefono}
          </a>
        </p>
      </div>

      {poi.capacidad > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Donaciones</p>
            <p className="text-lg font-bold">
              {poi.donacionesRecibidas}
              <span className="text-xs text-muted-foreground font-normal">/{poi.capacidad}</span>
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Beneficiarios</p>
            <p className="text-lg font-bold">{poi.beneficiarios}</p>
          </div>
        </div>
      )}

      <div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold text-white ${
            poi.estado_operativo === 'activo'
              ? 'bg-green-500'
              : poi.estado_operativo === 'parcial'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
        >
          {poi.estado_operativo.toUpperCase()}
        </span>
      </div>

      {(categorias.length > 0 || categoriasLegacy.length > 0) && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Categorías de donación</p>
          <div className="flex flex-wrap gap-1.5">
            {categorias.map((cat) => (
              <span
                key={cat}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${categoriaColores[cat]}`}
              >
                {categoriaNombres[cat]}
              </span>
            ))}
            {categoriasLegacy.map((tipo) => (
              <span key={tipo} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                {tipo}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PoiDetailSheet({
  poi,
  insumos,
  showSupplies,
  onShowSupplies,
  onClose,
  compact = false,
}: PoiDetailSheetProps) {
  return (
    <>
      {/* Overlay solo móvil */}
      <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} aria-hidden />

      {/* Móvil: bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-card border-t border-border shadow-2xl rounded-t-2xl max-h-[52dvh] md:hidden">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        <div className="flex items-center justify-between px-3 pt-1 pb-2 border-b border-border shrink-0">
          <div className="flex gap-3 min-w-0 flex-1">
            <button
              onClick={() => onShowSupplies(false)}
              className={`pb-1.5 px-1.5 font-medium text-xs transition-colors border-b-2 ${
                !showSupplies ? 'text-accent border-accent' : 'text-muted-foreground border-transparent'
              }`}
            >
              Info
            </button>
            {poi.tipo === 'centro_acopio' && (
              <button
                onClick={() => onShowSupplies(true)}
                className={`pb-1.5 px-1.5 font-medium text-xs transition-colors border-b-2 ${
                  showSupplies ? 'text-accent border-accent' : 'text-muted-foreground border-transparent'
                }`}
              >
                Insumos
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded shrink-0 text-muted-foreground"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          {!showSupplies ? (
            <div className="px-3 py-3">
              <PoiInfoContent poi={poi} insumos={insumos} dense={compact} />
            </div>
          ) : (
            <SuppliesPanel insumos={insumos} centroNombre={poi.nombre} embedded />
          )}
        </div>
      </div>

      {/* Desktop: panel lateral dentro del mapa */}
      <div className="hidden md:flex absolute top-3 right-3 bottom-3 z-30 w-[min(22rem,calc(100%-1.5rem))] lg:w-96 flex-col bg-card border border-border shadow-2xl rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-card">
          <div className="flex gap-4 min-w-0 flex-1">
            <button
              onClick={() => onShowSupplies(false)}
              className={`pb-1 px-1 font-medium text-sm transition-colors border-b-2 ${
                !showSupplies ? 'text-accent border-accent' : 'text-muted-foreground border-transparent'
              }`}
            >
              Info
            </button>
            {poi.tipo === 'centro_acopio' && (
              <button
                onClick={() => onShowSupplies(true)}
                className={`pb-1 px-1 font-medium text-sm transition-colors border-b-2 ${
                  showSupplies ? 'text-accent border-accent' : 'text-muted-foreground border-transparent'
                }`}
              >
                Insumos
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-secondary rounded shrink-0 text-muted-foreground"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {!showSupplies ? (
            <div className="p-5">
              <PoiInfoContent poi={poi} insumos={insumos} />
            </div>
          ) : (
            <SuppliesPanel insumos={insumos} centroNombre={poi.nombre} embedded />
          )}
        </div>
      </div>
    </>
  )
}
