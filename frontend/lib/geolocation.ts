export interface GeoCoords {
  lat: number
  lng: number
}

export function getCurrentPosition(options?: PositionOptions): Promise<GeoCoords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Tu navegador no soporta geolocalización'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('Permiso de ubicación denegado'))
          return
        }
        reject(new Error('No se pudo obtener la ubicación'))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...options },
    )
  })
}
