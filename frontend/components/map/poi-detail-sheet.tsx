'use client'

import { PuntoInteres, Insumo, POI_LABELS } from '@/lib/mock-data'
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
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
        aria-hidden
      />

      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-card border-t border-border shadow-2xl rounded-t-2xl max-h-[52dvh] md:max-h-none md:fixed md:inset-x-auto md:bottom-auto md:right-4 md:top-4 md:w-80 lg:w-96 md:rounded-lg md:border md:max-h-[85vh]">
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted" />
        </div>

        <div className="flex items-center justify-between px-3 pt-1 pb-2 md:px-4 md:pt-4 border-b border-border shrink-0">
          <div className="flex gap-3 md:gap-4 min-w-0 flex-1">
            <button
              onClick={() => onShowSupplies(false)}
              className={`pb-1.5 px-1.5 font-medium text-xs md:text-sm transition-colors border-b-2 ${
                !showSupplies
                  ? 'text-accent border-accent'
                  : 'text-muted-foreground border-transparent'
              }`}
            >
              Info
            </button>
            {poi.tipo === 'centro_acopio' && (
              <button
                onClick={() => onShowSupplies(true)}
                className={`pb-1.5 px-1.5 font-medium text-xs md:text-sm transition-colors border-b-2 ${
                  showSupplies
                    ? 'text-accent border-accent'
                    : 'text-muted-foreground border-transparent'
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
            <div className="px-3 py-3 md:p-5 space-y-3">
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground leading-snug">{poi.nombre}</h2>
                <p className="text-[10px] md:text-xs text-accent bg-accent/10 px-2 py-0.5 rounded inline-block mt-1">
                  {POI_LABELS[poi.tipo]}
                </p>
              </div>

              {!compact && (
                <div className="space-y-2.5 text-sm">
                  <p className="flex items-start gap-2 text-foreground">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-accent" />
                    <span className="text-xs md:text-sm">{poi.direccion}</span>
                  </p>
                  <p className="text-xs md:text-sm font-semibold">{poi.responsable}</p>
                  <p className="flex items-center gap-2 text-xs md:text-sm">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    <a href={`tel:${poi.telefono}`} className="text-accent underline-offset-2 hover:underline">
                      {poi.telefono}
                    </a>
                  </p>

                  {poi.capacidad > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-secondary rounded p-2 md:p-3">
                        <p className="text-[10px] md:text-xs text-muted-foreground">Donaciones</p>
                        <p className="text-sm md:text-lg font-bold">
                          {poi.donacionesRecibidas}
                          <span className="text-xs text-muted-foreground font-normal">/{poi.capacidad}</span>
                        </p>
                      </div>
                      <div className="bg-secondary rounded p-2 md:p-3">
                        <p className="text-[10px] md:text-xs text-muted-foreground">Beneficiarios</p>
                        <p className="text-sm md:text-lg font-bold">{poi.beneficiarios}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold text-white ${
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

                  {poi.tipos_donacion.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {poi.tipos_donacion.map((tipo) => (
                        <span key={tipo} className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                          {tipo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {compact && (
                <div className="space-y-2 text-xs md:text-sm">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                    {poi.direccion}
                  </p>
                  <p className="font-semibold">{poi.responsable}</p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                    {poi.telefono}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <SuppliesPanel insumos={insumos} centroNombre={poi.nombre} />
          )}
        </div>
      </div>
    </>
  )
}
