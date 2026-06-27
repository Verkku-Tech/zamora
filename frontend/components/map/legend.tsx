'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { POI_COLORS, POI_ICONS, POI_LABELS, TipoPuntoInteres } from '@/lib/mock-data'

const TIPOS: TipoPuntoInteres[] = [
  'centro_acopio',
  'centro_medico',
  'institucion',
  'albergue',
  'zona_segura',
  'punto_agua',
  'punto_distribucion',
]

interface LegendProps {
  hidden?: boolean
}

export default function Legend({ hidden = false }: LegendProps) {
  const [open, setOpen] = useState(false)

  if (hidden) return null

  return (
    <div className="absolute bottom-14 left-2 md:bottom-20 md:left-4 z-30 max-w-[calc(100vw-1rem)] md:max-w-[200px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden flex items-center gap-1.5 bg-card/95 backdrop-blur border border-border rounded-full shadow-lg px-3 py-1.5 text-xs font-medium text-foreground"
      >
        Leyenda
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      <div
        className={`mt-1.5 bg-card/95 backdrop-blur rounded-lg border border-border shadow-lg p-2.5 md:p-3 ${
          open ? 'block' : 'hidden md:block'
        }`}
      >
        <p className="hidden md:block text-xs font-semibold text-foreground mb-2">Leyenda</p>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 md:grid-cols-1 md:space-y-1.5">
          {TIPOS.map((tipo) => (
            <div key={tipo} className="flex items-center gap-1.5 min-w-0">
              <span
                className="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full text-[9px] md:text-[10px] flex-shrink-0"
                style={{ backgroundColor: POI_COLORS[tipo] }}
              >
                {POI_ICONS[tipo]}
              </span>
              <span className="text-[10px] md:text-xs text-muted-foreground leading-tight truncate">
                {POI_LABELS[tipo]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
