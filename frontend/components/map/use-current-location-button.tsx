'use client'

import { useState } from 'react'
import { Crosshair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentPosition } from '@/lib/geolocation'

interface UseCurrentLocationButtonProps {
  onLocated: (lat: number, lng: number) => void
  disabled?: boolean
  size?: 'sm' | 'default' | 'icon'
  className?: string
  /** Solo icono (mapa fullscreen). Si false, muestra texto en pantallas sm+ */
  iconOnly?: boolean
}

export default function UseCurrentLocationButton({
  onLocated,
  disabled,
  size = 'sm',
  className,
  iconOnly = false,
}: UseCurrentLocationButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const { lat, lng } = await getCurrentPosition()
      onLocated(lat, lng)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo obtener la ubicación')
    } finally {
      setLoading(false)
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        title="Usar ubicación actual"
        aria-label="Usar ubicación actual"
        className={`bg-card/95 backdrop-blur border border-border rounded-lg shadow-lg p-2 hover:bg-secondary transition-colors disabled:opacity-50 ${className ?? ''}`}
      >
        <Crosshair className={`w-5 h-5 ${loading ? 'text-accent animate-pulse' : 'text-foreground'}`} />
      </button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      title="Usar ubicación actual"
    >
      <Crosshair className={`w-4 h-4 shrink-0 ${loading ? 'animate-pulse text-accent' : ''}`} />
      <span className="hidden sm:inline whitespace-nowrap">Mi ubicación</span>
    </Button>
  )
}
